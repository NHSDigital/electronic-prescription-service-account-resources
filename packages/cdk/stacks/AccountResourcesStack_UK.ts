import {
  StackProps,
  Stack,
  App,
  Tags,
  Fn
} from "aws-cdk-lib"
import {ECRRepositories} from "../resources/ECRRepositories"
import {RegressionTestSecrets} from "../resources/RegressionTestSecrets"
import {Storage} from "../resources/Storage"
import {Encryption} from "../resources/Encryption"
import {ManagedPolicy, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam"
import {CfnBucket} from "aws-cdk-lib/aws-s3"
import {nagSuppressions} from "../nagSuppressions"
import {MonitoringStorage} from "../resources/MonitoringStorage"
import {LambdaFunction} from "aws-cdk-lib/aws-events-targets"
import {Rule, Schedule} from "aws-cdk-lib/aws-events"
import {Functions} from "../resources/Functions"
import {InspectorFilters} from "../resources/InspectorFilters"
import {Topic} from "aws-cdk-lib/aws-sns"
import {Alarms} from "../resources/Alarms"
import {FunctionPolicies} from "../resources/FunctionPolicies"
import {LogGroups} from "../resources/LogGroups"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"
import {Splunk} from "../resources/Splunk"
import {Slack} from "../resources/Slack"

export interface AccountResourcesStackProps_UK extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
  readonly cloudFormationExecutionRole: Role
  readonly cloudFormationPrepareChangesetRole: Role
  readonly CloudFormationDeployRole: Role
  readonly apiGwCloudWatchRole: Role
  readonly splunkDeliveryStreamBackupBucketRole: Role
  readonly enableAlerts: boolean
  readonly lambdaConcurrencyThreshold: number
  readonly lambdaConcurrencyWarningThreshold: number
  readonly lambdaDecryptSecretsKmsPolicy: ManagedPolicy
  readonly lambdaInsightsLogGroupName: string
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
  readonly splunkHECEndpoint: string
  readonly snsFeedbackLoggingRole: Role
  readonly fhirValidatorUkCoreLambdaArn?: string
  readonly accessSlackSecretsManagedPolicy: ManagedPolicy
}

export class AccountResourcesStack_UK extends Stack {
  readonly auditLoggingBucket: CfnBucket
  public constructor(scope: App, id: string, props: AccountResourcesStackProps_UK){
    super(scope, id, props)

    Tags.of(this).add("stackName", props.stackName)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const ecrRepositories = new ECRRepositories(this, "ECRRepositories")
    new RegressionTestSecrets(this, "RegressionTestSecrets", {stackName: props.stackName})
    const storage = new Storage(this, "Storage", {
      logRetentionDays: 30,
      accountId: this.account,
      region: this.region,
      cloudFormationExecutionRole: props.cloudFormationExecutionRole,
      cloudFormationPrepareChangesetRole: props.cloudFormationPrepareChangesetRole,
      CloudFormationDeployRole: props.CloudFormationDeployRole
      // need a way to pass these in
      // artifactsBucketArn
      // trustStoreBucketArn
      // trustStoreDeploymentBucketArn
      // cptUIStatefulResourcesStaticContentBucketArn
      // epsamKbDocsBucketArn
    })

    const encryption =new Encryption(this, "Encryption", {
      accountId: this.account,
      region: this.region,
      apiGwCloudWatchRole: props.apiGwCloudWatchRole,
      cloudFormationExecutionRole: props.cloudFormationExecutionRole,
      cloudFormationPrepareChangesetRole: props.cloudFormationPrepareChangesetRole,
      CloudFormationDeployRole: props.CloudFormationDeployRole
    })
    const slackAlertTopic = Topic.fromTopicArn(this, "SlackAlertTopic",
      Fn.importValue("lambda-resources:SlackAlertsSnsTopicArn"))

    const alarms = new Alarms(this, "Alarms", {
      stackName: props.stackName,
      enableAlerts: props.enableAlerts,
      lambdaConcurrencyThreshold: props.lambdaConcurrencyThreshold,
      lambdaConcurrencyWarningThreshold: props.lambdaConcurrencyWarningThreshold,
      slackAlertTopicArn: slackAlertTopic
    })

    new InspectorFilters(this, "InspectorFilters")

    const logGroups = new LogGroups(this, "LogGroups", {
      cloudWatchLogsKmsKey: encryption.cloudwatchLogsKmsKey,
      lambdaInsightsLogGroupName: props.lambdaInsightsLogGroupName,
      logRetentionInDays: 30,
      stackName: props.stackName
    })
    const slack = new Slack(this, "Slack", {
      snsFeedbackLoggingRole: props.snsFeedbackLoggingRole,
      stackName: props.stackName,
      sqsKMSKey: encryption.sqsKmsKey
    })
    const functionPolicies = new FunctionPolicies(this, "FunctionPolicies", {
      alertSuppressionsParameter: alarms.parameters.alertSuppressions,
      cloudwatchLogsKmsKey: encryption.cloudwatchLogsKmsKey,
      lambdaInsightsLogGroup: logGroups.lambdaInsightsLogGroup,
      clinicalTrackerCACertSecret: props.clinicalTrackerCACertSecret,
      clinicalTrackerClientCertSecret: props.clinicalTrackerClientCertSecret,
      clinicalTrackerClientSandboxCertSecret: props.clinicalTrackerClientSandboxCertSecret,
      pfpCACertSecret: props.pfpCACertSecret,
      pfpClientCertSecret: props.pfpClientCertSecret,
      pfpClientSandboxCertSecret: props.pfpClientSandboxCertSecret,
      psuCACertSecret: props.psuCACertSecret,
      psuClientCertSecret: props.psuClientCertSecret,
      psuClientSandboxCertSecret: props.psuClientSandboxCertSecret,
      fhirFacadeCACertSecret: props.fhirFacadeCACertSecret,
      fhirFacadeClientCertSecret: props.fhirFacadeClientCertSecret,
      fhirFacadeClientSandboxCertSecret: props.fhirFacadeClientSandboxCertSecret,
      spinePublicCertificate: props.spinePublicCertificate,
      ptlPrescriptionSigningPublicKey: props.ptlPrescriptionSigningPublicKey,
      slackAlerterSqsQueue: slack.slackAlerterSqsQueue,
      fhirValidatorUkCoreLambdaArn: props.fhirValidatorUkCoreLambdaArn
    })
    const monitoringStorage = new MonitoringStorage(this, "MonitoringStorage", {
      accountId: this.account,
      region: this.region,
      splunkDeliveryStreamBackupBucketRole: props.splunkDeliveryStreamBackupBucketRole,
      auditLoggingBucket: storage.auditLoggingBucket
    })

    const splunk = new Splunk(this, "Splunk", {
      stackName: props.stackName,
      version: props.version,
      commitId: props.commitId,
      logRetentionInDays: 30,
      logLevel: "DEBUG",
      cloudWatchLogsKmsKey: encryption.cloudwatchLogsKmsKey,
      lambdaInsightsLogGroupPolicy: functionPolicies.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: encryption.useCloudwatchLogsKmsKeyManagedPolicy,
      splunkHECEndpoint: props.splunkHECEndpoint,
      splunkDeliveryStreamBackupBucket: monitoringStorage.splunkDeliveryStreamBackupBucket,
      splunkDeliveryStreamBackupKMSKey: monitoringStorage.splunkDeliveryStreamBackupKmsKey,
      splunkDeliveryStreamBackupBucketRole: props.splunkDeliveryStreamBackupBucketRole,
      splunkDeliveryStreamLogGroup: logGroups.splunkDeliveryStreamLogGroup,
      splunkDeliveryStreamLogStream: logGroups.splunkDeliveryStreamLogStream
    })
    const functions = new Functions(this, "Functions", {
      stackName: props.stackName,
      version: props.version,
      commitId: props.commitId,
      logRetentionInDays: 30,
      logLevel: "DEBUG",
      readAlertSuppressionsPolicy: functionPolicies.readAlertSuppressionsPolicy,
      lambdaDecryptSecretsKmsPolicy: props.lambdaDecryptSecretsKmsPolicy,
      splunkDeliveryStream: splunk.splunkDeliveryStream,
      splunkSubscriptionFilterRole: splunk.splunkSubscriptionFilterRole,
      lambdaInsightsLogGroupPolicy: functionPolicies.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: encryption.useCloudwatchLogsKmsKeyManagedPolicy,
      cloudWatchLogsKmsKey: encryption.cloudwatchLogsKmsKey,
      certificateCheckerManagedPolicy: functionPolicies.certificateCheckerManagedPolicy,
      clinicalTrackerCACertSecret: props.clinicalTrackerCACertSecret,
      clinicalTrackerClientCertSecret: props.clinicalTrackerClientCertSecret,
      clinicalTrackerClientSandboxCertSecret: props.clinicalTrackerClientSandboxCertSecret,
      pfpCACertSecret: props.pfpCACertSecret,
      pfpClientCertSecret: props.pfpClientCertSecret,
      pfpClientSandboxCertSecret: props.pfpClientSandboxCertSecret,
      psuCACertSecret: props.psuCACertSecret,
      psuClientCertSecret: props.psuClientCertSecret,
      psuClientSandboxCertSecret: props.psuClientSandboxCertSecret,
      fhirFacadeCACertSecret: props.fhirFacadeCACertSecret,
      fhirFacadeClientCertSecret: props.fhirFacadeClientCertSecret,
      fhirFacadeClientSandboxCertSecret: props.fhirFacadeClientSandboxCertSecret,
      spinePublicCertificate: props.spinePublicCertificate,
      ptlPrescriptionSigningPublicKey: props.ptlPrescriptionSigningPublicKey,
      sqsDecryptSecretsKmsPolicy: encryption.sqsDecryptSecretsKmsPolicy,
      accessSlackSecretsManagedPolicy: props.accessSlackSecretsManagedPolicy,
      readSlackAlerterSqsQueuePolicy: functionPolicies.readSlackAlerterSqsQueuePolicy,
      FHIRValidatorListLambdaPolicy: functionPolicies.FHIRValidatorListLambdaPolicy,
      FHIRValidatorDeleteVersionPolicy: functionPolicies.FHIRValidatorDeleteVersionPolicy
    })

    // Create an EventBridge rule to trigger every Monday at 09:00 UTC
    const reportAlertSuppressionsScheduleRole = new Role(this, "ReportAlertSuppressionsScheduleRole", {
      assumedBy: new ServicePrincipal("events.amazonaws.com")
    }).withoutPolicyUpdates()
    functions.functions.reportAlertSuppressionsLambda.function.grantInvoke(reportAlertSuppressionsScheduleRole)
    new Rule(this, "WeeklyScheduleRule", {
      schedule: Schedule.cron({
        minute: "0",
        hour: "9",
        weekDay: "MON",
        month: "*",
        year: "*"
      }),
      targets: [new LambdaFunction(functions.functions.reportAlertSuppressionsLambda.function)],
      role: reportAlertSuppressionsScheduleRole
    })

    // TODO - move monitoring stack into here
    nagSuppressions(this, "AccountResources_UK")

    this.auditLoggingBucket = storage.auditLoggingBucket
  }
}
