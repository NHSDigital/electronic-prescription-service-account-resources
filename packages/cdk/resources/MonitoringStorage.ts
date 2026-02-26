import {Construct} from "constructs"
import {CfnAlias, CfnKey} from "aws-cdk-lib/aws-kms"
import {IRole, ManagedPolicy, PolicyStatement} from "aws-cdk-lib/aws-iam"
import {CfnBucket, CfnBucketPolicy, IBucket} from "aws-cdk-lib/aws-s3"

export interface MonitoringStorageProps {
  readonly accountId: string
  readonly region: string
  readonly splunkDeliveryStreamBackupBucketRole: IRole
  readonly auditLoggingBucket: IBucket
}
export class MonitoringStorage extends Construct {
  public readonly splunkDeliveryStreamBackupKmsKey: CfnKey
  public readonly splunkDeliveryStreamBackupKmsKeyAlias: CfnAlias
  public readonly splunkDeliveryStreamBackupBucketRoleKmsMangedPolicy: ManagedPolicy

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
              this.splunkDeliveryStreamBackupKmsKey.attrArn
            ]
          })
        ]
      })
    props.splunkDeliveryStreamBackupBucketRole.addManagedPolicy(
      this.splunkDeliveryStreamBackupBucketRoleKmsMangedPolicy
    )
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
              `arn:aws:kms:${props.region}:${props.accountId}:key/${this.splunkDeliveryStreamBackupKmsKey.ref}`
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
    splunkDeliveryStreamBackupBucket.cfnOptions.metadata = {
      guard: {
        SuppressedRules: [
          "S3_BUCKET_REPLICATION_ENABLED",
          "S3_BUCKET_DEFAULT_LOCK_ENABLED"
        ]
      }
    }
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
        ]
      })

    props.splunkDeliveryStreamBackupBucketRole.addManagedPolicy(
      splunkDeliveryStreamBackupBucketIamManagedPolicy
    )

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
    splunkDeliveryStreamBackupBucketPolicy.cfnOptions.metadata = {
      guard: {
        SuppressedRules: [
          "S3_BUCKET_SSL_REQUESTS_ONLY"
        ]
      }
    }

    this.splunkDeliveryStreamBackupKmsKey = splunkDeliveryStreamBackupKmsKey
    this.splunkDeliveryStreamBackupKmsKeyAlias = splunkDeliveryStreamBackupKmsKeyAlias
    this.splunkDeliveryStreamBackupBucketRoleKmsMangedPolicy = splunkDeliveryStreamBackupBucketRoleKmsMangedPolicy
  }
}
