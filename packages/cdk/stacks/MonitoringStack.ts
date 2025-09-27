import {
  StackProps,
  Stack,
  App,
  Fn
} from "aws-cdk-lib"
import {Alarms} from "../resources/Alarms"
import {InspectorFilters} from "../resources/InspectorFilters"
import {Topic} from "aws-cdk-lib/aws-sns"

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

    new Alarms(this, "Alarms", {
      stackName: props.stackName,
      enableAlerts: enableAlerts,
      lambdaConcurrencyThreshold: lambdaConcurrencyThreshold,
      lambdaConcurrencyWarningThreshold: lambdaConcurrencyWarningThreshold,
      slackAlertTopicArn: slackAlertTopic
    })

    new InspectorFilters(this, "InspectorFilters")
  }
}
