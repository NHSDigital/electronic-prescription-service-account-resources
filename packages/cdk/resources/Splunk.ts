import {
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal
} from "aws-cdk-lib/aws-iam"
import {CfnDeliveryStream} from "aws-cdk-lib/aws-kinesisfirehose"
import {CfnKey, Key} from "aws-cdk-lib/aws-kms"
import {LogGroup, LogStream} from "aws-cdk-lib/aws-logs"
import {CfnBucket} from "aws-cdk-lib/aws-s3"
import {Construct} from "constructs"
import {TypescriptLambdaFunction} from "@nhsdigital/eps-cdk-constructs"
import {resolve} from "path"
import {Runtime} from "aws-cdk-lib/aws-lambda"

export interface SplunkProps {
  readonly splunkHECEndpoint: string
  readonly splunkDeliveryStreamBackupBucket: CfnBucket
  readonly splunkDeliveryStreamBackupKMSKey: CfnKey
  readonly stackName: string
  readonly splunkDeliveryStreamBackupBucketRole: Role
  readonly splunkDeliveryStreamLogGroup: LogGroup
  readonly splunkDeliveryStreamLogStream: LogStream
  readonly logRetentionInDays: number
  readonly logLevel: string
  readonly version: string
  readonly commitId: string
  readonly cloudWatchLogsKmsKey: Key
  readonly lambdaInsightsLogGroupPolicy: ManagedPolicy
  readonly cloudwatchEncryptionKMSPolicy: ManagedPolicy
}

export class Splunk extends Construct {
  public splunkSubscriptionFilterRole: Role
  public splunkSubscriptionFilterDeliveryStreamManagedPolicy: ManagedPolicy
  public splunkDeliveryStream: CfnDeliveryStream

  public constructor(scope: Construct, id: string, props: SplunkProps){
    super(scope, id)

    const splunkSubscriptionFilterRole = new Role(this, "SplunkSubscriptionFilterRole", {
      assumedBy: new ServicePrincipal("logs.amazonaws.com")
    })

    const splunkDeliveryStreamProcessor = new TypescriptLambdaFunction(this, "SplunkDeliveryStreamProcessor", {
      functionName: `${props.stackName}-splunkProcessor`,
      packageBasePath: "packages/splunkProcessor",
      entryPoint: "src/splunkProcessor.js",
      environmentVariables: {
      },
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel,
      version: props.version,
      commitId: props.commitId,
      projectBaseDir: resolve(__dirname, "../../.."),
      runtime: Runtime.NODEJS_24_X,
      cloudWatchLogsKmsKey: props.cloudWatchLogsKmsKey,
      lambdaInsightsLogGroupPolicy: props.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: props.cloudwatchEncryptionKMSPolicy,
      addSplunkSubscriptionFilter: false
    })
    const splunkDeliveryStreamProcessorInvokeRole = new Role(this, "SplunkDeliveryStreamProcessorInvokeRole", {
      assumedBy: new ServicePrincipal("firehose.amazonaws.com")
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const splunkDeliveryStreamProcessorInvokeManagedPolicy = new ManagedPolicy(
      this, "SplunkDeliveryStreamProcessorInvokeManagedPolicy", {
        statements: [
          new PolicyStatement({
            actions: [
              "lambda:InvokeFunction"
            ],
            resources: [
              splunkDeliveryStreamProcessor.function.functionArn
            ]
          })
        ],
        roles: [
          splunkDeliveryStreamProcessorInvokeRole
        ]
      })

    const splunkDestinationConfigurationProperty: CfnDeliveryStream.SplunkDestinationConfigurationProperty = {
      hecEndpoint: props.splunkHECEndpoint,
      hecEndpointType: "Event",
      s3Configuration: {
        bucketArn: props.splunkDeliveryStreamBackupBucket.attrArn,
        roleArn: props.splunkDeliveryStreamBackupBucketRole.roleArn,
        encryptionConfiguration: {
          kmsEncryptionConfig: {
            awskmsKeyArn: props.splunkDeliveryStreamBackupKMSKey.attrArn
          }
        },
        prefix: props.stackName
      },
      cloudWatchLoggingOptions: {
        enabled: true,
        logGroupName: props.splunkDeliveryStreamLogGroup.logGroupName,
        logStreamName: props.splunkDeliveryStreamLogStream.logStreamName
      },
      hecToken: "{{resolve:secretsmanager:account-resources-SplunkHECToken:SecretString}}",
      processingConfiguration: {
        enabled: true,
        processors: [{
          type: "Lambda",
          parameters: [
            {
              parameterName: "LambdaArn",
              parameterValue: splunkDeliveryStreamProcessor.function.functionArn
            },
            {
              parameterName: "RoleArn",
              parameterValue: splunkDeliveryStreamProcessorInvokeRole.roleArn
            }
          ]
        }]
      }
    }
    const splunkDeliveryStream = new CfnDeliveryStream(this, "SplunkDeliveryStream", {
      splunkDestinationConfiguration: splunkDestinationConfigurationProperty,
      deliveryStreamType: "DirectPut"
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const SplunkDeliveryStreamProcessorDeliveryStreamManagedPolicy = new ManagedPolicy(
      this, "SplunkDeliveryStreamProcessorDeliveryStreamManagedPolicy", {
        statements: [
          new PolicyStatement({
            actions: [
              "firehose:PutRecordBatch"
            ],
            resources: [
              splunkDeliveryStream.attrArn
            ]
          })
        ],
        roles: [
          splunkDeliveryStreamProcessor.executionRole
        ]
      })
    const splunkSubscriptionFilterDeliveryStreamManagedPolicy = new ManagedPolicy(
      this, "SplunkSubscriptionFilterDeliveryStreamManagedPolicy", {
        statements: [
          new PolicyStatement({
            actions: [
              "firehose:PutRecord"
            ],
            resources: [
              splunkDeliveryStream.attrArn
            ]
          })
        ],
        roles: [
          splunkSubscriptionFilterRole
        ]
      })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const splunkSubscriptionFilterKMSManagedPolicy = new ManagedPolicy(
      this, "SplunkSubscriptionFilterKMSManagedPolicy", {
        statements: [
          new PolicyStatement({
            actions: [
              "kms:GenerateDataKey"
            ],
            resources: [
              props.cloudWatchLogsKmsKey.keyArn
            ]
          })
        ],
        roles: [
          splunkSubscriptionFilterRole
        ]
      })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const splunkDeliveryStreamLoggingManagedPolicy = new ManagedPolicy(
      this, "SplunkDeliveryStreamLoggingManagedPolicy", {
        statements: [
          new PolicyStatement({
            actions: [
              "kms:DescribeKey",
              "kms:GenerateDataKey",
              "kms:Encrypt",
              "kms:ReEncrypt*"
            ],
            resources: [
              props.cloudWatchLogsKmsKey.keyArn
            ]
          }),
          new PolicyStatement({
            actions: [
              "logs:PutLogEvents",
              "logs:CreateLogStream"
            ],
            resources: [
              props.splunkDeliveryStreamLogGroup.logGroupArn,
              `${props.splunkDeliveryStreamLogGroup.logGroupArn}:*`
            ]
          })
        ],
        roles: [
          props.splunkDeliveryStreamBackupBucketRole
        ]
      })

    this.splunkSubscriptionFilterRole = splunkSubscriptionFilterRole
    this.splunkSubscriptionFilterDeliveryStreamManagedPolicy = splunkSubscriptionFilterDeliveryStreamManagedPolicy
    this.splunkDeliveryStream = splunkDeliveryStream
  }
}
