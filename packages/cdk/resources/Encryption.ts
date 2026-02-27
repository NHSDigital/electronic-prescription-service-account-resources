import {Construct} from "constructs"
import {CfnAlias, CfnKey, Key} from "aws-cdk-lib/aws-kms"
import {
  CfnRole,
  ManagedPolicy,
  PolicyStatement,
  Role
} from "aws-cdk-lib/aws-iam"
import {RemovalPolicy} from "aws-cdk-lib"

export interface EncryptionProps {
  readonly accountId: string
  readonly region: string
  readonly apiGwCloudWatchRole: Role
  readonly cloudFormationExecutionRole: Role
  readonly cloudFormationPrepareChangesetRole: Role
  readonly CloudFormationDeployRole: Role
}
export class Encryption extends Construct {
  public readonly secretsKmsKey: Key
  public readonly snsKmsKey: CfnKey
  public readonly sqsKmsKey: CfnKey
  public readonly cloudwatchLogsKmsKey: CfnKey
  public readonly snsKmsKeyKmsKeyAlias: CfnAlias
  public readonly sqsKmsKeyKmsKeyAlias: CfnAlias
  public readonly cloudwatchLogsKmsKeyAlias: CfnAlias
  public readonly lambdaDecryptSecretsKmsPolicy: ManagedPolicy
  public readonly snsDecryptSecretsKmsPolicy: ManagedPolicy
  public readonly sqsDecryptSecretsKmsPolicy: ManagedPolicy
  public readonly useCloudwatchLogsKmsKeyManagedPolicy: ManagedPolicy
  public readonly lambdaEncryptCloudwatchKmsPolicy: ManagedPolicy

  public constructor(scope: Construct, id: string, props: EncryptionProps) {
    super(scope, id)

    const secretsKmsKey = new Key(this, "SecretsKMSKey", {
      enableKeyRotation: true,
      removalPolicy: RemovalPolicy.DESTROY
    })
    secretsKmsKey.addAlias("alias/SecretsKMSKeyAlias")

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const useSecretsKmsKeyManagedPolicy = new ManagedPolicy(this, "UseSecretsKmsKeyManagedPolicy", {
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
            secretsKmsKey.keyArn
          ]
        })],
      roles: [
        props.cloudFormationExecutionRole
      ]
    })

    const snsKmsKey = new CfnKey(this, "SnsKMSKey", {
      enableKeyRotation: true,
      keyPolicy: {
        Version: "2012-10-17",
        Id: "key-sns",
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
            Sid: "Enable Cloudwatch Alarms",
            Effect: "Allow",
            Principal: {
              Service: "cloudwatch.amazonaws.com"
            },
            Action: [
              "kms:DescribeKey",
              "kms:GenerateDataKey*",
              "kms:Encrypt*",
              "kms:ReEncrypt*",
              "kms:Decrypt"
            ],
            Resource: "*"
          },
          {
            Sid: "Enable SQS",
            Effect: "Allow",
            Principal: {
              Service: "sqs.amazonaws.com"
            },
            Action: [
              "kms:DescribeKey",
              "kms:GenerateDataKey*",
              "kms:Decrypt"
            ],
            Resource: "*"
          }
        ]
      }
    })

    const snsKmsKeyKmsKeyAlias = new CfnAlias(this, "SnsKMSKeyKMSKeyAlias", {
      aliasName: "alias/SnsKMSKeyAlias",
      targetKeyId: snsKmsKey.ref
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const useSnsKmsKeyManagedPolicy = new ManagedPolicy(this, "UseSnsKmsKeyManagedPolicy", {
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
            snsKmsKey.attrArn
          ]
        })],
      roles: [
        props.cloudFormationExecutionRole
      ]
    })

    const snsDecryptSecretsKmsPolicy = new ManagedPolicy(this, "SnsDecryptSecretsKmsPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "kms:Decrypt"
          ],
          resources: [
            snsKmsKey.attrArn
          ]
        })
      ]
    })

    const sqsKmsKey = new CfnKey(this, "SqsKMSKey", {
      enableKeyRotation: true,
      keyPolicy: {
        Version: "2012-10-17",
        Id: "key-sqs",
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
            Sid: "Enable SNS",
            Effect: "Allow",
            Principal: {
              Service: "sns.amazonaws.com"
            },
            Action: [
              "kms:DescribeKey",
              "kms:GenerateDataKey*",
              "kms:Encrypt*",
              "kms:ReEncrypt*",
              "kms:Decrypt"
            ],
            Resource: "*"
          }
        ]
      }
    })

    const sqsKmsKeyKmsKeyAlias = new CfnAlias(this, "SqsKMSKeyKMSKeyAlias", {
      aliasName: "alias/SqsKMSKeyAlias",
      targetKeyId: sqsKmsKey.ref
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const useSqsKmsKeyManagedPolicy = new ManagedPolicy(this, "UseSqsKmsKeyManagedPolicy", {
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
            sqsKmsKey.attrArn
          ]
        })],
      roles: [
        props.cloudFormationExecutionRole
      ]
    })

    const sqsDecryptSecretsKmsPolicy = new ManagedPolicy(this, "SqsDecryptSecretsKMSPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "kms:Decrypt"
          ],
          resources: [
            sqsKmsKey.attrArn
          ]
        })
      ]
    })

    const cfnApiGwCloudWatchRole = props.apiGwCloudWatchRole.node.defaultChild as CfnRole
    const cfnCloudFormationExecutionRole = props.cloudFormationExecutionRole.node.defaultChild as CfnRole
    const cloudwatchLogsKmsKey = new CfnKey(this, "CloudwatchLogsKmsKey", {
      enableKeyRotation: true,
      keyPolicy: {
        Version: "2012-10-17",
        Id: "key-policy-id",
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
            Sid: "Allow Service Logging",
            Effect: "Allow",
            Principal: {
              Service: `logs.${props.region}.amazonaws.com`
            },
            Action: [
              "kms:Encrypt*",
              "kms:Decrypt*",
              "kms:ReEncrypt*",
              "kms:GenerateDataKey*",
              "kms:Describe*"
            ],
            Resource: "*",
            Condition: {
              ArnEquals: {
                "kms:EncryptionContext:aws:logs:arn": [
                  `arn:aws:logs:${props.region}:${props.accountId}:log-group:/aws/apigateway/*`,
                  `arn:aws:logs:${props.region}:${props.accountId}:log-group:/aws/lambda/*`,
                  `arn:aws:logs:${props.region}:${props.accountId}:log-group:/aws/kinesisfirehose/*`,
                  `arn:aws:logs:${props.region}:${props.accountId}:log-group:/aws/lambda-insights*`,
                  `arn:aws:logs:${props.region}:${props.accountId}:log-group:/aws/stepfunctions/*`,
                  `arn:aws:logs:${props.region}:${props.accountId}:log-group:/aws/ecs/*`,
                  `arn:aws:logs:${props.region}:${props.accountId}:log-group:artilleryio-log-group/artilleryio-cluster`,
                  `arn:aws:logs:${props.region}:${props.accountId}:log-group:/aws/vpc/*`,
                  `arn:aws:logs:${props.region}:${props.accountId}:log-group:/aws/containerinsights/*`,
                  `arn:aws:logs:${props.region}:${props.accountId}:log-group:/aws/vendedlogs/*`,
                  `arn:aws:logs:${props.region}:${props.accountId}:log-group:/aws/cloudfront/*`,
                  `arn:aws:logs:${props.region}:${props.accountId}:log-group:aws-waf-logs-*`,
                  `arn:aws:logs:${props.region}:${props.accountId}:log-group:/aws/bedrock/*`
                ]
              }
            }
          },
          {
            Sid: "Allow API Gateway Role",
            Effect: "Allow",
            Principal: {
              AWS: cfnApiGwCloudWatchRole.attrArn
            },
            Action: [
              "kms:DescribeKey",
              "kms:GenerateDataKey*",
              "kms:Encrypt",
              "kms:ReEncrypt*"
            ],
            Resource: `arn:aws:logs:${props.region}:${props.accountId}:log-group:/aws/apigateway/*`
          },
          {
            Sid: "Allow Deployment Role",
            Effect: "Allow",
            Principal: {
              AWS: [
                cfnCloudFormationExecutionRole.attrArn,
                `arn:aws:iam::${props.accountId}:role/cdk-hnb659fds-cfn-exec-role-${props.accountId}-eu-west-2`
              ]
            },
            Action: [
              "kms:DescribeKey",
              "kms:GenerateDataKey*",
              "kms:Encrypt",
              "kms:ReEncrypt*"
            ],
            Resource: "*"
          }
        ]
      }
    })
    const cloudwatchLogsKmsKeyAlias = new CfnAlias(this, "CloudwatchLogsKMSKeyAlias", {
      aliasName: "alias/CloudwatchLogsKMSKeyAlias",
      targetKeyId: cloudwatchLogsKmsKey.ref
    })
    const useCloudwatchLogsKmsKeyManagedPolicy = new ManagedPolicy(this, "UseCloudwatchLogsKmsKeyManagedPolicy", {
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
            cloudwatchLogsKmsKey.attrArn
          ]
        })]
    })

    const lambdaDecryptSecretsKmsPolicy = new ManagedPolicy(this, "LambdaDecryptSecretsKmsPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "kms:Decrypt"
          ],
          resources: [
            secretsKmsKey.keyArn
          ]
        })
      ]
    })
    const lambdaEncryptCloudwatchKmsPolicy = new ManagedPolicy(this, "LambdaEncryptCloudwatchKmsPolicy", {
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
            cloudwatchLogsKmsKey.attrArn
          ]
        })]
    })

    this.secretsKmsKey = secretsKmsKey
    this.snsKmsKey = snsKmsKey
    this.sqsKmsKey = sqsKmsKey
    this.cloudwatchLogsKmsKey = cloudwatchLogsKmsKey
    this.snsKmsKeyKmsKeyAlias = snsKmsKeyKmsKeyAlias
    this.sqsKmsKeyKmsKeyAlias = sqsKmsKeyKmsKeyAlias
    this.cloudwatchLogsKmsKeyAlias = cloudwatchLogsKmsKeyAlias
    this.lambdaDecryptSecretsKmsPolicy = lambdaDecryptSecretsKmsPolicy
    this.snsDecryptSecretsKmsPolicy = snsDecryptSecretsKmsPolicy
    this.sqsDecryptSecretsKmsPolicy = sqsDecryptSecretsKmsPolicy
    this.useCloudwatchLogsKmsKeyManagedPolicy = useCloudwatchLogsKmsKeyManagedPolicy
    this.lambdaEncryptCloudwatchKmsPolicy = lambdaEncryptCloudwatchKmsPolicy
  }
}
