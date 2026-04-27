import {Construct} from "constructs"
import {CfnAlias, CfnKey} from "aws-cdk-lib/aws-kms"
import {IRole, ManagedPolicy, PolicyStatement} from "aws-cdk-lib/aws-iam"
import {CfnBucket, CfnBucketPolicy} from "aws-cdk-lib/aws-s3"
import {addSuppressions} from "@nhsdigital/eps-cdk-constructs"

export interface MonitoringStorageProps {
  readonly accountId: string
  readonly region: string
  readonly splunkDeliveryStreamBackupBucketRole: IRole
  readonly auditLoggingBucket: CfnBucket
}
export class MonitoringStorage extends Construct {
  public readonly splunkDeliveryStreamBackupKmsKey: CfnKey
  public readonly splunkDeliveryStreamBackupKmsKeyAlias: CfnAlias
  public readonly splunkDeliveryStreamBackupBucketRoleKmsMangedPolicy: ManagedPolicy
  public readonly splunkDeliveryStreamBackupBucket: CfnBucket

  public constructor(scope: Construct, id: string, props: MonitoringStorageProps) {
    super(scope, id)

    const splunkDeliveryStreamBackupKmsKey = new CfnKey(this, "SplunkDeliveryStreamBackupKMSKey", {
      enableKeyRotation: true,
      keyPolicy: {
        Version: "2012-10-17",
        Id: "key-s3",
        Statement: [
          {
            Sid: "Enable IAM User Permissions",
            Effect: "Allow",
            Principal: {
              AWS: `arn:aws:iam::${props.accountId}:root`
            },
            Action: [
              "kms:*"
            ],
            Resource: "*"
          }
        ]
      }
    })
    const splunkDeliveryStreamBackupKmsKeyAlias = new CfnAlias(this, "SplunkDeliveryStreamBackupKMSKeyAlias", {
      aliasName: "alias/SplunkDeliveryStreamBackupKMSKeyAlias",
      targetKeyId: splunkDeliveryStreamBackupKmsKey.ref
    })
    const splunkDeliveryStreamBackupBucketRoleKmsMangedPolicy =
      new ManagedPolicy(this, "SplunkDeliveryStreamBackupBucketRoleKMSMangedPolicy", {
        statements: [
          new PolicyStatement({
            actions: [
              "kms:DescribeKey",
              "kms:GenerateDataKey*",
              "kms:Encrypt",
              "kms:ReEncrypt*"
            ],
            resources: [
              splunkDeliveryStreamBackupKmsKey.attrArn
            ]
          })
        ],
        roles: [
          props.splunkDeliveryStreamBackupBucketRole
        ]
      })
    const splunkDeliveryStreamBackupBucket = new CfnBucket(this, "SplunkDeliveryStreamBackupBucket", {
      versioningConfiguration: {
        status: "Enabled"
      },
      loggingConfiguration: {
        destinationBucketName: props.auditLoggingBucket.bucketName,
        logFilePrefix: "splunkDeliveryStreamBackup/"
      },
      publicAccessBlockConfiguration: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true
      },
      bucketEncryption: {
        serverSideEncryptionConfiguration: [
          {
            bucketKeyEnabled: false,
            serverSideEncryptionByDefault: {
              sseAlgorithm: "aws:kms",
              kmsMasterKeyId:
              `arn:aws:kms:${props.region}:${props.accountId}:key/${splunkDeliveryStreamBackupKmsKey.ref}`
            }
          }
        ]
      },
      lifecycleConfiguration: {
        rules: [
          {
            id: "SplunkBackup-IA-30d-Expire-90d",
            status: "Enabled",
            prefix: "",
            transitions: [
              {
                storageClass: "STANDARD_IA",
                transitionInDays: 30
              }
            ],
            expirationInDays: 90
          }
        ]
      }
    })

    addSuppressions([splunkDeliveryStreamBackupBucket], [
      "S3_BUCKET_REPLICATION_ENABLED",
      "S3_BUCKET_DEFAULT_LOCK_ENABLED"
    ])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const splunkDeliveryStreamBackupBucketIamManagedPolicy =
      new ManagedPolicy(this, "SplunkDeliveryStreamBackupBucketIAMManagedPolicy", {
        statements: [
          new PolicyStatement({
            actions: [
              "s3:AbortMultipartUpload",
              "s3:GetBucketLocation",
              "s3:GetObject",
              "s3:ListBucket",
              "s3:ListBucketMultipartUploads",
              "s3:PutObject"
            ],
            resources: [
              splunkDeliveryStreamBackupBucket.attrArn
            ]
          })
        ],
        roles: [
          props.splunkDeliveryStreamBackupBucketRole
        ]
      })

    const splunkDeliveryStreamBackupBucketPolicy = new CfnBucketPolicy(this, "SplunkDeliveryStreamBackupBucketPolicy", {
      bucket: splunkDeliveryStreamBackupBucket.ref,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Deny",
            Principal: "*",
            Action: [
              "s3:*"
            ],
            Resource: [
              [
                splunkDeliveryStreamBackupBucket.attrArn,
                "/*"
              ].join(""),
              splunkDeliveryStreamBackupBucket.attrArn
            ],
            Condition: {
              Bool: {
                "aws:SecureTransport": false
              }
            }
          },
          {
            Effect: "Allow",
            Principal: {
              AWS: [
                props.splunkDeliveryStreamBackupBucketRole.roleArn
              ]
            },
            Action: [
              "s3:AbortMultipartUpload",
              "s3:GetBucketLocation",
              "s3:GetObject",
              "s3:ListBucket",
              "s3:ListBucketMultipartUploads",
              "s3:PutObject"
            ],
            Resource: [
              splunkDeliveryStreamBackupBucket.attrArn,
              [
                splunkDeliveryStreamBackupBucket.attrArn,
                "/*"
              ].join("")
            ]
          }
        ]
      }
    })
    addSuppressions([splunkDeliveryStreamBackupBucketPolicy], [
      "S3_BUCKET_SSL_REQUESTS_ONLY"
    ])

    this.splunkDeliveryStreamBackupKmsKey = splunkDeliveryStreamBackupKmsKey
    this.splunkDeliveryStreamBackupKmsKeyAlias = splunkDeliveryStreamBackupKmsKeyAlias
    this.splunkDeliveryStreamBackupBucketRoleKmsMangedPolicy = splunkDeliveryStreamBackupBucketRoleKmsMangedPolicy
    this.splunkDeliveryStreamBackupBucket = splunkDeliveryStreamBackupBucket
  }
}
