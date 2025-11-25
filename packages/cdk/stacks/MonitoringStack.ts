import {
  StackProps,
  Stack,
  App,
  Fn
} from "aws-cdk-lib"
import {Alarms} from "../resources/Alarms"
import {InspectorFilters} from "../resources/InspectorFilters"
import {Topic} from "aws-cdk-lib/aws-sns"
import {Functions} from "../resources/Functions"
import {nagSuppressions} from "../nagSuppressions"
import {Rule, Schedule} from "aws-cdk-lib/aws-events"
import {LambdaFunction} from "aws-cdk-lib/aws-events-targets"
import {Role, ServicePrincipal} from "aws-cdk-lib/aws-iam"

export interface MonitoringStackProps extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
}

export class MonitoringStack extends Stack {
  public constructor(scope: App, id: string, props: MonitoringStackProps){
    super(scope, id, props)

    const lambdaConcurrencyThreshold: number = this.node.tryGetContext("lambdaConcurrencyThreshold")
    const lambdaConcurrencyWarningThreshold: number = this.node.tryGetContext("lambdaConcurrencyWarningThreshold")
    const enableAlerts: boolean = this.node.tryGetContext("enableAlerts")

    // Imports
    // import the existing slack alert topic until we migrate rest of slack alerter code to cdk
    const slackAlertTopic = Topic.fromTopicArn(this, "SlackAlertTopic",
      Fn.importValue("lambda-resources:SlackAlertsSnsTopicArn"))

    const alarms = new Alarms(this, "Alarms", {
      stackName: props.stackName,
      enableAlerts: enableAlerts,
      lambdaConcurrencyThreshold: lambdaConcurrencyThreshold,
      lambdaConcurrencyWarningThreshold: lambdaConcurrencyWarningThreshold,
      slackAlertTopicArn: slackAlertTopic
    })

    new InspectorFilters(this, "InspectorFilters")

    const functions = new Functions(this, "Functions", {
      stackName: props.stackName,
      version: props.version,
      commitId: props.commitId,
      logRetentionInDays: 30,
      logLevel: "DEBUG",
      alertSuppressionsParameter: alarms.parameters.alertSuppressions
    })

    // Create an EventBridge rule to trigger every Monday at 09:00 UTC
    const reportAlertSuppressionsScheduleRole = new Role(this, "ReportAlertSuppressionsScheduleRole", {
      assumedBy: new ServicePrincipal("events.amazonaws.com")
    })
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

    nagSuppressions(this)
  }
}
