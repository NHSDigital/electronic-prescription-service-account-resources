import {Construct} from "constructs"
import {LayerVersion, Runtime} from "aws-cdk-lib/aws-lambda"
import {ManagedPolicy, Role} from "aws-cdk-lib/aws-iam"
import {TypescriptLambdaFunction} from "../constructs/TypescriptLambdaFunction"
import {resolve} from "path"
import {Key} from "aws-cdk-lib/aws-kms"
import {CfnDeliveryStream} from "aws-cdk-lib/aws-kinesisfirehose"

export interface FunctionsProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
  readonly logRetentionInDays: number
  readonly logLevel: string
  readonly readAlertSuppressionsPolicy: ManagedPolicy
  readonly lambdaDecryptSecretsKmsPolicy: ManagedPolicy
  readonly cloudWatchLogsKmsKey: Key
  readonly splunkDeliveryStream: CfnDeliveryStream
  readonly splunkSubscriptionFilterRole: Role
  readonly lambdaInsightsLogGroupPolicy: ManagedPolicy
  readonly cloudwatchEncryptionKMSPolicy: ManagedPolicy
}

export class Functions extends Construct {
  functions: {[key: string]: TypescriptLambdaFunction}

  public constructor(scope: Construct, id: string, props: FunctionsProps){
    super(scope, id)

    // Imports
    const parameterAndSecretsLayerArn =
      "arn:aws:lambda:eu-west-2:133256977650:layer:AWS-Parameters-and-Secrets-Lambda-Extension:20"
    const parameterAndSecretsLayer = LayerVersion.fromLayerVersionArn(
      this, "parameterAndSecretsLayer", parameterAndSecretsLayerArn)

    const reportAlertSuppressionsLambda = new TypescriptLambdaFunction(this, "ReportAlertSuppressionsLambda", {
      functionName: `${props.stackName}-suppression-reporter`,
      packageBasePath: "packages/slackAlerter",
      entryPoint: "src/suppressionReporter.ts",
      environmentVariables: {
        PARAMETERS_SECRETS_EXTENSION_HTTP_PORT: "2773"
      },
      additionalPolicies: [props.readAlertSuppressionsPolicy, props.lambdaDecryptSecretsKmsPolicy],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel,
      version: props.version,
      commitId: props.commitId,
      layers: [
        parameterAndSecretsLayer
      ],
      projectBaseDir: resolve(__dirname, "../../.."),
      runtime: Runtime.NODEJS_24_X,
      cloudWatchLogsKmsKey: props.cloudWatchLogsKmsKey,
      splunkDeliveryStream: props.splunkDeliveryStream,
      splunkSubscriptionFilterRole: props.splunkSubscriptionFilterRole,
      lambdaInsightsLogGroupPolicy: props.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: props.cloudwatchEncryptionKMSPolicy,
      addSplunkSubscriptionFilter: true
    })

    this.functions = {
      reportAlertSuppressionsLambda: reportAlertSuppressionsLambda
    }
  }
}
