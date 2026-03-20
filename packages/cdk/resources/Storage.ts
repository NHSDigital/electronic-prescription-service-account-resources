import {Construct} from "constructs"
import {CfnBucket, CfnBucketPolicy} from "aws-cdk-lib/aws-s3"
import {CfnKey, CfnAlias} from "aws-cdk-lib/aws-kms"
import {ManagedPolicy, PolicyStatement, Role} from "aws-cdk-lib/aws-iam"
import {addSuppressions} from "@nhsdigital/eps-cdk-constructs"

export interface StorageProps {
  readonly logRetentionDays: number
  readonly accountId: string
  readonly region: string
  readonly cloudFormationExecutionRole: Role
  readonly cloudFormationPrepareChangesetRole: Role
  readonly cloudFormationDeployRole: Role
  readonly splunkDeliveryStreamBackupBucketArn?: string
  readonly artifactsBucketArn?: string
  readonly trustStoreBucketArn?: string
  readonly trustStoreDeploymentBucketArn?: string
  readonly cptUIStatefulResourcesStaticContentBucketArn?: string
  readonly epsamKbDocsBucketArn?: string
}
export class Storage extends Construct {
  public readonly auditLoggingBucket: CfnBucket
  public readonly albLoggingBucket: CfnBucket
  public readonly trustStoreBucket: CfnBucket
  public readonly trustStoreBucketKmsKey: CfnKey
  public readonly trustStoreDeploymentBucket: CfnBucket

  public constructor(scope: Construct, id: string, props: StorageProps) {
    super(scope, id)
    const auditLoggingBucket = new CfnBucket(this, "AuditLoggingBucket", {
      versioningConfiguration: {
        status: "Enabled"
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
            serverSideEncryptionByDefault: {
              sseAlgorithm: "AES256"
            }
          }
        ]
      },
      lifecycleConfiguration: {
        rules: [
          {
            id: "Audit-IA-30d",
            status: "Enabled",
            prefix: "",
            transitions: [
              {
                storageClass: "STANDARD_IA",
                transitionInDays: 30
              }
            ]
          }
        ]
      }
    })
    addSuppressions([auditLoggingBucket], [
      "S3_BUCKET_REPLICATION_ENABLED",
      "S3_BUCKET_LOGGING_ENABLED",
      "S3_BUCKET_DEFAULT_LOCK_ENABLED"
    ])

    const auditLoggingBucketPolicyStatement: Array<unknown> = [
      {
        Effect: "Deny",
        Principal: "*",
        Action: [
          "s3:*"
        ],
        Resource: [
          [
            auditLoggingBucket.attrArn,
            "/*"
          ].join(""),
          auditLoggingBucket.attrArn
        ],
        Condition: {
          Bool: {
            "aws:SecureTransport": false
          }
        }
      }]
    if (props.splunkDeliveryStreamBackupBucketArn) {
      auditLoggingBucketPolicyStatement.push(this.createAuditLoggingPolicy(
        auditLoggingBucket.attrArn,
        props.accountId,
        props.splunkDeliveryStreamBackupBucketArn,
        "splunkDeliveryStreamBackup"
      ))
    }
    if (props.artifactsBucketArn) {
      auditLoggingBucketPolicyStatement.push(this.createAuditLoggingPolicy(
        auditLoggingBucket.attrArn,
        props.accountId,
        props.artifactsBucketArn,
        "artifact"
      ))
    }
    if (props.trustStoreBucketArn) {
      auditLoggingBucketPolicyStatement.push(this.createAuditLoggingPolicy(
        auditLoggingBucket.attrArn,
        props.accountId,
        props.trustStoreBucketArn,
        "trustStore"
      ))
    }
    if (props.trustStoreDeploymentBucketArn) {
      auditLoggingBucketPolicyStatement.push(this.createAuditLoggingPolicy(
        auditLoggingBucket.attrArn,
        props.accountId,
        props.trustStoreDeploymentBucketArn,
        "trustStore-deployment"
      ))
    }
    if (props.cptUIStatefulResourcesStaticContentBucketArn) {
      auditLoggingBucketPolicyStatement.push(this.createAuditLoggingPolicy(
        auditLoggingBucket.attrArn,
        props.accountId,
        props.cptUIStatefulResourcesStaticContentBucketArn,
        "/static-content/"
      ))
    }
    if (props.epsamKbDocsBucketArn) {
      auditLoggingBucketPolicyStatement.push(this.createAuditLoggingPolicy(
        auditLoggingBucket.attrArn,
        props.accountId,
        props.epsamKbDocsBucketArn,
        "/epsam-kb/"
      ))
    }
    const auditLoggingBucketPolicy = new CfnBucketPolicy(this, "AuditLoggingBucketPolicy", {
      bucket: auditLoggingBucket.ref,
      policyDocument: {
        Statement: auditLoggingBucketPolicyStatement
      }
    })
    addSuppressions([auditLoggingBucketPolicy], [
      "S3_BUCKET_SSL_REQUESTS_ONLY"
    ])

    const artifactsBucketKmsKey = new CfnKey(this, "ArtifactsBucketKMSKey", {
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
    const artifactsBucketKmsKeyAlias = new CfnAlias(this, "ArtifactsBucketKMSKeyAlias", {
      aliasName: "alias/ArtifactsBucketKMSKeyAlias",
      targetKeyId: artifactsBucketKmsKey.ref
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const useArtifactBucketKmsKeyManagedPolicy = new ManagedPolicy(this, "UseArtifactBucketKMSKeyManagedPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "kms:DescribeKey",
            "kms:GenerateDataKey*",
            "kms:Encrypt",
            "kms:ReEncrypt*",
            "kms:Decrypt"
          ],
          resources: [
            artifactsBucketKmsKey.attrArn
          ]
        })],
      roles: [
        props.cloudFormationExecutionRole,
        props.cloudFormationPrepareChangesetRole,
        props.cloudFormationDeployRole
      ]
    })

    const artifactsBucket = new CfnBucket(this, "ArtifactsBucket", {
      loggingConfiguration: {
        destinationBucketName: auditLoggingBucket.ref,
        logFilePrefix: "artifact/"
      },
      versioningConfiguration: {
        status: "Enabled"
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
            serverSideEncryptionByDefault: {
              kmsMasterKeyId: `arn:aws:kms:${props.region}:${props.accountId}:${artifactsBucketKmsKeyAlias.ref}`,
              sseAlgorithm: "aws:kms"
            }
          }
        ]
      },
      lifecycleConfiguration: {
        rules: [
          {
            id: "Artifacts-IA-30d-Expire-90d",
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
    addSuppressions([artifactsBucket], [
      "S3_BUCKET_REPLICATION_ENABLED",
      "S3_BUCKET_DEFAULT_LOCK_ENABLED"
    ])
    const artifactsBucketPolicy = new CfnBucketPolicy(this, "ArtifactsBucketPolicy", {
      bucket: artifactsBucket.ref,
      policyDocument: {
        Statement: [
          {
            Effect: "Deny",
            Principal: "*",
            Action: [
              "s3:*"
            ],
            Resource: [
              [
                artifactsBucket.attrArn,
                "/*"
              ].join(""),
              artifactsBucket.attrArn
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
                props.cloudFormationDeployRole.roleArn,
                props.cloudFormationExecutionRole.roleArn,
                props.cloudFormationPrepareChangesetRole.roleArn
              ]
            },
            Action: [
              "s3:GetObject*",
              "s3:PutObject*",
              "s3:GetBucket*",
              "s3:List*"
            ],
            Resource: [
              [
                artifactsBucket.attrArn,
                "/*"
              ].join(""),
              artifactsBucket.attrArn
            ]
          },
          {
            Effect: "Allow",
            Principal: {
              AWS: [
                props.cloudFormationDeployRole.roleArn
              ]
            },
            Action: [
              "s3:DeleteObject*"
            ],
            Resource: [
              [
                artifactsBucket.attrArn,
                "/*/*/*.lock"
              ].join("")
            ]
          }
        ]
      }
    })
    addSuppressions([artifactsBucketPolicy], [
      "S3_BUCKET_SSL_REQUESTS_ONLY"
    ])

    const athenaResultsBucketKmsKey = new CfnKey(this, "AthenaResultsBucketKMSKey", {
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
    const athenaResultsBucketKmsKeyKmsKeyAlias = new CfnAlias(this, "AthenaResultsBucketKMSKeyKMSKeyAlias", {
      aliasName: "alias/AthenaResultsBucketKMSKeyAlias",
      targetKeyId: athenaResultsBucketKmsKey.ref
    })

    const athenaResultsBucket = new CfnBucket(this, "AthenaResultsBucket", {
      versioningConfiguration: {
        status: "Enabled"
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
            serverSideEncryptionByDefault: {
              kmsMasterKeyId:
                `arn:aws:kms:${props.region}:${props.accountId}:${athenaResultsBucketKmsKeyKmsKeyAlias.ref}`,
              sseAlgorithm: "aws:kms"
            }
          }
        ]
      },
      lifecycleConfiguration: {
        rules: [
          {
            id: "AthenaResults-IA-30d-Expire-90d",
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
    addSuppressions([athenaResultsBucket], [
      "S3_BUCKET_REPLICATION_ENABLED",
      "S3_BUCKET_LOGGING_ENABLED",
      "S3_BUCKET_DEFAULT_LOCK_ENABLED"
    ])
    const athenaResultsBucketPolicy = new CfnBucketPolicy(this, "AthenaResultsBucketPolicy", {
      bucket: athenaResultsBucket.ref,
      policyDocument: {
        Statement: [
          {
            Effect: "Deny",
            Principal: "*",
            Action: [
              "s3:*"
            ],
            Resource: [
              [
                athenaResultsBucket.attrArn,
                "/*"
              ].join(""),
              athenaResultsBucket.attrArn
            ],
            Condition: {
              Bool: {
                "aws:SecureTransport": false
              }
            }
          }
        ]
      }
    })
    addSuppressions([athenaResultsBucketPolicy], [
      "S3_BUCKET_SSL_REQUESTS_ONLY"
    ])

    const trustStoreBucketKmsKey = new CfnKey(this, "TrustStoreBucketKMSKey", {
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
          },
          {
            Sid: "Allow CloudFormation Access",
            Effect: "Allow",
            Principal: {
              AWS: [
                props.cloudFormationExecutionRole.roleArn
              ]
            },
            Action: [
              "kms:DescribeKey",
              "kms:GenerateDataKey*",
              "kms:Encrypt",
              "kms:ReEncrypt*",
              "kms:Decrypt"
            ],
            Resource: "*"
          }
        ]
      }
    })
    const trustStoreBucketKmsKeyKmsKeyAlias = new CfnAlias(this, "TrustStoreBucketKMSKeyKMSKeyAlias", {
      aliasName: "alias/TrustStoreBucketKMSKeyAlias",
      targetKeyId: trustStoreBucketKmsKey.ref
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const useTrustStoreBucketKmsKeyManagedPolicy = new ManagedPolicy(this, "UseTrustStoreBucketKMSKeyManagedPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "kms:DescribeKey",
            "kms:GenerateDataKey*",
            "kms:Encrypt",
            "kms:ReEncrypt*",
            "kms:Decrypt"
          ],
          resources: [
            trustStoreBucketKmsKey.attrArn
          ]
        })],
      roles: [
        props.cloudFormationExecutionRole
      ]
    })

    const trustStoreBucket = new CfnBucket(this, "TrustStoreBucket", {
      loggingConfiguration: {
        destinationBucketName: auditLoggingBucket.ref,
        logFilePrefix: "truststore/"
      },
      publicAccessBlockConfiguration: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true
      },
      versioningConfiguration: {
        status: "Enabled"
      },
      bucketEncryption: {
        serverSideEncryptionConfiguration: [
          {
            serverSideEncryptionByDefault: {
              kmsMasterKeyId: `arn:aws:kms:${props.region}:${props.accountId}:${trustStoreBucketKmsKeyKmsKeyAlias.ref}`,
              sseAlgorithm: "aws:kms"
            }
          }
        ]
      }
    })
    addSuppressions([trustStoreBucket], [
      "S3_BUCKET_REPLICATION_ENABLED",
      "S3_BUCKET_DEFAULT_LOCK_ENABLED"
    ])
    const trustStoreBucketPolicy = new CfnBucketPolicy(this, "TrustStoreBucketPolicy", {
      bucket: trustStoreBucket.ref,
      policyDocument: {
        Statement: [
          {
            Effect: "Deny",
            Principal: "*",
            Action: [
              "s3:*"
            ],
            Resource: [
              [
                trustStoreBucket.attrArn,
                "/*"
              ].join(""),
              trustStoreBucket.attrArn
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
                props.cloudFormationDeployRole.roleArn,
                props.cloudFormationExecutionRole.roleArn,
                `arn:aws:iam::${props.accountId}:role/cdk-hnb659fds-cfn-exec-role-${props.accountId}-eu-west-2`
              ]
            },
            Action: [
              "s3:GetObject*",
              "s3:PutObject*",
              "s3:GetBucket*",
              "s3:List*"
            ],
            Resource: [
              [
                trustStoreBucket.attrArn,
                "/*"
              ].join(""),
              trustStoreBucket.attrArn
            ]
          }
        ]
      }
    })
    addSuppressions([trustStoreBucketPolicy], [
      "S3_BUCKET_SSL_REQUESTS_ONLY"
    ])

    const trustStoreDeploymentBucket = new CfnBucket(this, "TrustStoreDeploymentBucket", {
      loggingConfiguration: {
        destinationBucketName: auditLoggingBucket.ref,
        logFilePrefix: "truststore-deployment/"
      },
      publicAccessBlockConfiguration: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true
      },
      versioningConfiguration: {
        status: "Suspended"
      },
      bucketEncryption: {
        serverSideEncryptionConfiguration: [
          {
            serverSideEncryptionByDefault: {
              kmsMasterKeyId: `arn:aws:kms:${props.region}:${props.accountId}:${trustStoreBucketKmsKeyKmsKeyAlias.ref}`,
              sseAlgorithm: "aws:kms"
            }
          }
        ]
      }
    })
    addSuppressions([trustStoreDeploymentBucket], [
      "S3_BUCKET_REPLICATION_ENABLED",
      "S3_BUCKET_DEFAULT_LOCK_ENABLED",
      "S3_BUCKET_VERSIONING_ENABLED"
    ])
    const trustStoreDeploymentBucketPolicy = new CfnBucketPolicy(this, "TrustStoreDeploymentBucketPolicy", {
      bucket: trustStoreDeploymentBucket.ref,
      policyDocument: {
        Statement: [
          {
            Effect: "Deny",
            Principal: "*",
            Action: [
              "s3:*"
            ],
            Resource: [
              [
                trustStoreDeploymentBucket.attrArn,
                "/*"
              ].join(""),
              trustStoreDeploymentBucket.attrArn
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
              AWS: `arn:aws:iam::${props.accountId}:role/cdk-hnb659fds-cfn-exec-role-${props.accountId}-eu-west-2`
            },
            Action: "s3:GetObject",
            Resource: [
              trustStoreDeploymentBucket.attrArn,
              "/*"
            ].join("")
          }
        ]
      }
    })
    addSuppressions([trustStoreDeploymentBucketPolicy], [
      "S3_BUCKET_SSL_REQUESTS_ONLY"
    ])

    const albLoggingBucket = new CfnBucket(this, "ALBLoggingBucket", {
      versioningConfiguration: {
        status: "Enabled"
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
            serverSideEncryptionByDefault: {
              sseAlgorithm: "AES256"
            }
          }
        ]
      },
      lifecycleConfiguration: {
        rules: [
          {
            id: "ALBLogging-IA-30d-Expire-LogRetention",
            status: "Enabled",
            prefix: "",
            transitions: [
              {
                storageClass: "STANDARD_IA",
                transitionInDays: 30
              }
            ],
            expirationInDays: props.logRetentionDays
          }
        ]
      }
    })
    const albLoggingBucketPolicy = new CfnBucketPolicy(this, "ALBLoggingBucketPolicy", {
      bucket: albLoggingBucket.ref,
      policyDocument: {
        Statement: [
          {
            Effect: "Deny",
            Principal: "*",
            Action: [
              "s3:*"
            ],
            Resource: [
              [
                albLoggingBucket.attrArn,
                "/*"
              ].join(""),
              albLoggingBucket.attrArn
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
              AWS: "arn:aws:iam::652711504416:root"
            },
            Action: [
              "s3:PutObject"
            ],
            Resource: [
              [
                albLoggingBucket.attrArn,
                "/*"
              ].join("")
            ]
          }
        ]
      }
    })
    addSuppressions([albLoggingBucketPolicy], [
      "S3_BUCKET_SSL_REQUESTS_ONLY"
    ])
    addSuppressions([albLoggingBucket], [
      "S3_BUCKET_REPLICATION_ENABLED",
      "S3_BUCKET_LOGGING_ENABLED",
      "S3_BUCKET_DEFAULT_LOCK_ENABLED"
    ])
    this.auditLoggingBucket = auditLoggingBucket
    this.albLoggingBucket = albLoggingBucket
    this.trustStoreBucket = trustStoreBucket
    this.trustStoreBucketKmsKey = trustStoreBucketKmsKey
    this.trustStoreDeploymentBucket = trustStoreDeploymentBucket
  }

  createAuditLoggingPolicy(
    auditLoggingBucketArn: string,
    accountId: string,
    sourceArn:string,
    prefix:string
  ) {
    return {
      Effect: "Allow",
      Principal: {
        Service: "logging.s3.amazonaws.com"
      },
      Action: [
        "s3:PutObject*"
      ],
      Resource: [
        `${auditLoggingBucketArn}/${prefix}/*`
      ],
      Condition: {
        StringEquals: {
          "aws:SourceAccount": accountId
        },
        ArnLike: {
          "aws:SourceArn": sourceArn
        }
      }
    }
  }
}
