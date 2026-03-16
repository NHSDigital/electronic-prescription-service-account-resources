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
}

export class AccountResourcesStack_UK extends Stack {
  readonly auditLoggingBucket: CfnBucket
  public constructor(scope: App, id: string, props: AccountResourcesStackProps_UK){
    super(scope, id, props)

    Tags.of(this).add("stackName", props.stackName)
    new ECRRepositories(this, "ECRRepositories")
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
      logRetentionInDays: 30
    })
    const functionPolicies = new FunctionPolicies(this, "FunctionPolicies", {
      alertSuppressionsParameter: alarms.parameters.alertSuppressions,
      cloudwatchLogsKmsKey: encryption.cloudwatchLogsKmsKey,
      lambdaInsightsLogGroup: logGroups.lambdaInsightsLogGroup
    })
    const functions = new Functions(this, "Functions", {
      stackName: props.stackName,
      version: props.version,
      commitId: props.commitId,
      logRetentionInDays: 30,
      logLevel: "DEBUG",
      readAlertSuppressionsPolicy: functionPolicies.policies.readAlertSuppressionsPolicy,
      lambdaDecryptSecretsKmsPolicy: props.lambdaDecryptSecretsKmsPolicy
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
    new MonitoringStorage(this, "MonitoringStorage", {
      accountId: this.account,
      region: this.region,
      splunkDeliveryStreamBackupBucketRole: props.splunkDeliveryStreamBackupBucketRole,
      auditLoggingBucket: storage.auditLoggingBucket
    })

    // TODO - move monitoring stack into here
    nagSuppressions(this)

    this.auditLoggingBucket = storage.auditLoggingBucket
  }
}
