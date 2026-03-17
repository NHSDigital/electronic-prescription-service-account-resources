import {Construct} from "constructs"
import {LayerVersion, Runtime} from "aws-cdk-lib/aws-lambda"
import {ManagedPolicy, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam"
import {TypescriptLambdaFunction} from "@nhsdigital/eps-cdk-constructs"
import {resolve} from "path"
import {Key} from "aws-cdk-lib/aws-kms"
import {CfnDeliveryStream} from "aws-cdk-lib/aws-kinesisfirehose"
import {Rule, RuleTargetInput, Schedule} from "aws-cdk-lib/aws-events"
import {LambdaFunction} from "aws-cdk-lib/aws-events-targets"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"

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
  readonly certificateCheckerManagedPolicy: ManagedPolicy
  readonly clinicalTrackerCACertSecret: Secret
  readonly clinicalTrackerClientCertSecret: Secret
  readonly clinicalTrackerClientSandboxCertSecret: Secret
  readonly pfpCACertSecret: Secret
  readonly pfpClientCertSecret: Secret
  readonly pfpClientSandboxCertSecret: Secret
  readonly psuCACertSecret: Secret
  readonly psuClientCertSecret: Secret
  readonly psuClientSandboxCertSecret: Secret
  readonly fhirFacadeCACertSecret: Secret
  readonly fhirFacadeClientCertSecret: Secret
  readonly fhirFacadeClientSandboxCertSecret: Secret
  readonly spinePublicCertificate: Secret
  readonly ptlPrescriptionSigningPublicKey: Secret
  readonly sqsDecryptSecretsKmsPolicy: ManagedPolicy
  readonly accessSlackSecretsManagedPolicy: ManagedPolicy
  readonly readSlackAlerterSqsQueuePolicy: ManagedPolicy
  readonly FHIRValidatorListLambdaPolicy?: ManagedPolicy
  readonly FHIRValidatorDeleteVersionPolicy?: ManagedPolicy
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
    // Create an EventBridge rule to trigger every Monday at 09:00 UTC
    const reportAlertSuppressionsScheduleRole = new Role(this, "ReportAlertSuppressionsScheduleRole", {
      assumedBy: new ServicePrincipal("events.amazonaws.com")
    }).withoutPolicyUpdates()
    new Rule(this, "reportAlertSuppressionsLambdaSchedule", {
      schedule: Schedule.cron({
        minute: "0",
        hour: "9",
        weekDay: "MON",
        month: "*",
        year: "*"
      }),
      targets: [new LambdaFunction(reportAlertSuppressionsLambda.function)],
      role: reportAlertSuppressionsScheduleRole
    })

    const slackAlerterLambda = new TypescriptLambdaFunction(this, "SlackAlerterLambda", {
      functionName: `${props.stackName}-SlackAlerter`,
      packageBasePath: "packages/slackAlerter",
      entryPoint: "src/slackAlerter.ts",
      environmentVariables: {
        PARAMETERS_SECRETS_EXTENSION_HTTP_PORT: "2773"
      },
      additionalPolicies: [
        props.sqsDecryptSecretsKmsPolicy,
        props.accessSlackSecretsManagedPolicy,
        props.readSlackAlerterSqsQueuePolicy,
        props.readAlertSuppressionsPolicy,
        props.lambdaDecryptSecretsKmsPolicy
      ],
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

    const certExpiryCheckFunction = new TypescriptLambdaFunction(this, "CertExpiryCheckFunction", {
      functionName: `${props.stackName}-CertificateChecker`,
      packageBasePath: "packages/certificateChecker",
      entryPoint: "src/certificateChecker.ts",
      environmentVariables: {},
      additionalPolicies: [props.certificateCheckerManagedPolicy],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel,
      version: props.version,
      commitId: props.commitId,
      projectBaseDir: resolve(__dirname, "../../.."),
      runtime: Runtime.NODEJS_24_X,
      cloudWatchLogsKmsKey: props.cloudWatchLogsKmsKey,
      splunkDeliveryStream: props.splunkDeliveryStream,
      splunkSubscriptionFilterRole: props.splunkSubscriptionFilterRole,
      lambdaInsightsLogGroupPolicy: props.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: props.cloudwatchEncryptionKMSPolicy,
      addSplunkSubscriptionFilter: true
    })
    new Rule(this, "CertExpiryCheckFunctionRule", {
      description: "Schedule the certExpiryCheckFunction to run once a day",
      schedule: Schedule.cron({
        year: "*",
        month: "*",
        day: "*",
        hour: "1",
        minute: "0"
      }),
      targets: [new LambdaFunction(certExpiryCheckFunction.function, {
        event: RuleTargetInput.fromObject({
          secretARNs: [
            props.clinicalTrackerCACertSecret.secretArn,
            props.clinicalTrackerClientCertSecret.secretArn,
            props.clinicalTrackerClientSandboxCertSecret.secretArn,
            props.pfpCACertSecret.secretArn,
            props.pfpClientCertSecret.secretArn,
            props.pfpClientSandboxCertSecret.secretArn,
            props.psuCACertSecret.secretArn,
            props.psuClientCertSecret.secretArn,
            props.psuClientSandboxCertSecret.secretArn,
            props.fhirFacadeCACertSecret.secretArn,
            props.fhirFacadeClientCertSecret.secretArn,
            props.fhirFacadeClientSandboxCertSecret.secretArn,
            props.spinePublicCertificate.secretArn,
            props.ptlPrescriptionSigningPublicKey.secretArn
          ]
        })
      })]
    })

    let lambdaJanitorAdditionalPolicies: Array<ManagedPolicy> = []
    if(props.FHIRValidatorListLambdaPolicy && props.FHIRValidatorDeleteVersionPolicy){
      lambdaJanitorAdditionalPolicies = [props.FHIRValidatorListLambdaPolicy, props.FHIRValidatorDeleteVersionPolicy]
    }
    const lambdaJanitor = new TypescriptLambdaFunction(this, "LambdaJanitor", {
      functionName: `${props.stackName}-LambdaJanitor`,
      packageBasePath: "packages/lambdaJanitor",
      entryPoint: "src/janitor.ts",
      environmentVariables: {},
      additionalPolicies: lambdaJanitorAdditionalPolicies,
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel,
      version: props.version,
      commitId: props.commitId,
      projectBaseDir: resolve(__dirname, "../../.."),
      runtime: Runtime.NODEJS_24_X,
      cloudWatchLogsKmsKey: props.cloudWatchLogsKmsKey,
      splunkDeliveryStream: props.splunkDeliveryStream,
      splunkSubscriptionFilterRole: props.splunkSubscriptionFilterRole,
      lambdaInsightsLogGroupPolicy: props.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: props.cloudwatchEncryptionKMSPolicy,
      addSplunkSubscriptionFilter: true
    })
    new Rule(this, "LambdaJanitorRule", {
      description: "Schedule the lambda janitor function to run once a week",
      schedule: Schedule.cron({
        year: "*",
        month: "*",
        day: "3",
        hour: "6",
        minute: "0"
      }),
      targets: [new LambdaFunction(certExpiryCheckFunction.function, {})]
    })

    this.functions = {
      reportAlertSuppressionsLambda: reportAlertSuppressionsLambda,
      certExpiryCheckFunction: certExpiryCheckFunction,
      slackAlerterLambda: slackAlerterLambda,
      lambdaJanitor: lambdaJanitor
    }
  }
}
