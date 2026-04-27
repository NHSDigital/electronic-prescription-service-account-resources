import {Construct} from "constructs"
import {CfnAlias, Key} from "aws-cdk-lib/aws-kms"
import {
  AccountRootPrincipal,
  ArnPrincipal,
  CfnRole,
  Effect,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal
} from "aws-cdk-lib/aws-iam"

export interface EncryptionProps {
  readonly accountId: string
  readonly region: string
  readonly apiGwCloudWatchRole: Role
  readonly cloudFormationExecutionRole: Role
}
export class Encryption extends Construct {
  public readonly snsKmsKey: Key
  public readonly sqsKmsKey: Key
  public readonly cloudwatchLogsKmsKey: Key
  public readonly snsKmsKeyKmsKeyAlias: CfnAlias
  public readonly sqsKmsKeyKmsKeyAlias: CfnAlias
  public readonly cloudwatchLogsKmsKeyAlias: CfnAlias
  public readonly snsDecryptSecretsKmsPolicy: ManagedPolicy
  public readonly sqsDecryptSecretsKmsPolicy: ManagedPolicy
  public readonly useCloudwatchLogsKmsKeyManagedPolicy: ManagedPolicy
  public readonly lambdaEncryptCloudwatchKmsPolicy: ManagedPolicy

  public constructor(scope: Construct, id: string, props: EncryptionProps) {
    super(scope, id)

    const snsKmsKey = new Key(this, "SnsKMSKey", {
      enableKeyRotation: true,
      policy: new PolicyDocument({
        statements: [
          new PolicyStatement({
            sid: "Enable IAM User Permissions",
            effect: Effect.ALLOW,
            actions: [
              "kms:*"
            ],
            principals: [
              new AccountRootPrincipal
            ],
            resources: ["*"]
          }),
          new PolicyStatement({
            sid: "Enable Cloudwatch Alarms",
            effect: Effect.ALLOW,
            actions: [
              "kms:DescribeKey",
              "kms:GenerateDataKey*",
              "kms:Encrypt*",
              "kms:ReEncrypt*",
              "kms:Decrypt"
            ],
            principals: [
              new ServicePrincipal("cloudwatch.amazonaws.com")
            ],
            resources: ["*"]
          }),
          new PolicyStatement({
            sid: "Enable SQS",
            effect: Effect.ALLOW,
            actions: [
              "kms:DescribeKey",
              "kms:GenerateDataKey",
              "kms:Decrypt"
            ],
            principals: [
              new ServicePrincipal("sqs.amazonaws.com")
            ],
            resources: ["*"]
          })
        ]
      })
    })

    const snsKmsKeyKmsKeyAlias = new CfnAlias(this, "SnsKMSKeyKMSKeyAlias", {
      aliasName: "alias/SnsKMSKeyAlias",
      targetKeyId: snsKmsKey.keyArn
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const useSnsKmsKeyManagedPolicy = new ManagedPolicy(this, "UseSnsKMSKeyManagedPolicy", {
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
            snsKmsKey.keyArn
          ]
        })],
      roles: [
        props.cloudFormationExecutionRole
      ]
    })

    const snsDecryptSecretsKmsPolicy = new ManagedPolicy(this, "SnsDecryptSecretsKMSPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "kms:Decrypt"
          ],
          resources: [
            snsKmsKey.keyArn
          ]
        })
      ]
    })

    const sqsKmsKey = new Key(this, "SqsKMSKey", {
      enableKeyRotation: true,
      policy: new PolicyDocument({
        statements: [
          new PolicyStatement({
            sid: "Enable IAM User Permissions",
            effect: Effect.ALLOW,
            actions: [
              "kms:*"
            ],
            principals: [
              new AccountRootPrincipal
            ],
            resources: ["*"]
          }),
          new PolicyStatement({
            sid: "Enable SNS",
            effect: Effect.ALLOW,
            principals: [
              new ServicePrincipal("sns.amazonaws.com")
            ],
            actions: [
              "kms:DescribeKey",
              "kms:GenerateDataKey*",
              "kms:Encrypt*",
              "kms:ReEncrypt*",
              "kms:Decrypt"
            ]
          })
        ]
      })
    })
    const sqsKmsKeyKmsKeyAlias = new CfnAlias(this, "SqsKMSKeyKMSKeyAlias", {
      aliasName: "alias/SqsKMSKeyAlias",
      targetKeyId: sqsKmsKey.keyArn
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const useSqsKmsKeyManagedPolicy = new ManagedPolicy(this, "UseSqsKMSKeyManagedPolicy", {
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
            sqsKmsKey.keyArn
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
            sqsKmsKey.keyArn
          ]
        })
      ]
    })

    const cfnApiGwCloudWatchRole = props.apiGwCloudWatchRole.node.defaultChild as CfnRole
    const cfnCloudFormationExecutionRole = props.cloudFormationExecutionRole.node.defaultChild as CfnRole
    const cloudwatchLogsKmsKey = new Key(this, "CloudwatchLogsKmsKey", {
      enableKeyRotation: true,
      policy: new PolicyDocument({
        statements: [
          new PolicyStatement({
            sid: "Enable IAM User Permissions",
            effect: Effect.ALLOW,
            actions: [
              "kms:*"
            ],
            principals: [
              new AccountRootPrincipal
            ],
            resources: ["*"]
          }),
          new PolicyStatement({
            sid: "Allow service logging",
            effect: Effect.ALLOW,
            actions: [
              "kms:Encrypt*",
              "kms:Decrypt*",
              "kms:ReEncrypt*",
              "kms:GenerateDataKey*",
              "kms:Describe*"
            ],
            principals: [
              new ServicePrincipal(`logs.${props.region}.amazonaws.com`)
            ],
            resources: ["*"],
            conditions: {
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
          }),
          new PolicyStatement({
            sid: "Allow API Gateway Role",
            effect: Effect.ALLOW,
            actions: [
              "kms:DescribeKey",
              "kms:GenerateDataKey*",
              "kms:Encrypt",
              "kms:ReEncrypt*"
            ],
            principals: [
              new ArnPrincipal(cfnApiGwCloudWatchRole.attrArn)
            ],
            resources: [
              `arn:aws:logs:${props.region}:${props.accountId}:log-group:/aws/apigateway/*`
            ]
          }),
          new PolicyStatement({
            sid: "Allow Deployment Role",
            effect: Effect.ALLOW,
            actions: [
              "kms:DescribeKey",
              "kms:GenerateDataKey*",
              "kms:Encrypt",
              "kms:ReEncrypt*"
            ],
            principals: [
              new ArnPrincipal(cfnCloudFormationExecutionRole.attrArn),
              new ArnPrincipal(
                `arn:aws:iam::${props.accountId}:role/cdk-hnb659fds-cfn-exec-role-${props.accountId}-eu-west-2`)
            ],
            resources: [
              "*"
            ]
          })
        ]
      })
    })
    const cloudwatchLogsKmsKeyAlias = new CfnAlias(this, "CloudwatchLogsKmsKeyAlias", {
      aliasName: "alias/CloudwatchLogsKMSKeyAlias",
      targetKeyId: cloudwatchLogsKmsKey.keyArn
    })
    const useCloudwatchLogsKmsKeyManagedPolicy = new ManagedPolicy(this, "CloudwatchEncryptionKMSPolicy", {
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
            cloudwatchLogsKmsKey.keyArn
          ]
        })]
    })

    const lambdaEncryptCloudwatchKmsPolicy = new ManagedPolicy(this, "LambdaEncryptCloudwatchKMSPolicy", {
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
            cloudwatchLogsKmsKey.keyArn
          ]
        })]
    })

    this.snsKmsKey = snsKmsKey
    this.sqsKmsKey = sqsKmsKey
    this.cloudwatchLogsKmsKey = cloudwatchLogsKmsKey
    this.snsKmsKeyKmsKeyAlias = snsKmsKeyKmsKeyAlias
    this.sqsKmsKeyKmsKeyAlias = sqsKmsKeyKmsKeyAlias
    this.cloudwatchLogsKmsKeyAlias = cloudwatchLogsKmsKeyAlias
    this.snsDecryptSecretsKmsPolicy = snsDecryptSecretsKmsPolicy
    this.sqsDecryptSecretsKmsPolicy = sqsDecryptSecretsKmsPolicy
    this.useCloudwatchLogsKmsKeyManagedPolicy = useCloudwatchLogsKmsKeyManagedPolicy
    this.lambdaEncryptCloudwatchKmsPolicy = lambdaEncryptCloudwatchKmsPolicy
  }
}
