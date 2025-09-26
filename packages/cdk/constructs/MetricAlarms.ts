import {Fn, Duration} from "aws-cdk-lib"
import {Construct} from "constructs"
import {
  Alarm,
  Metric,
  ComparisonOperator,
  TreatMissingData
} from "aws-cdk-lib/aws-cloudwatch"
import {Topic} from "aws-cdk-lib/aws-sns"

type AlarmDefinition = {
  name: string
  metric: string
  description: string
  threshold?: number
}

export interface MetricAlarmsProps {
  readonly stackName: string
  readonly enableAlerts: boolean
  readonly namespace: string
  readonly alarmDefinitions: Array<AlarmDefinition>
}

export class MetricAlarms extends Construct {
  alarms: {[key: string]: Alarm}

  public constructor(scope: Construct, id: string, props: MetricAlarmsProps){
    super(scope, id)

    // Imports
    const slackAlertTopic = Topic.fromTopicArn(this, "SlackAlertTopic",
      Fn.importValue("lambda-resources:SlackAlertsSnsTopicArn"))

    const metricFunction = (metricName: string) =>
      new Metric({
        namespace: props.namespace,
        metricName,
        statistic: "Sum",
        period: Duration.minutes(1)
      })

    for (const a of props.alarmDefinitions) {
      const alarm =new Alarm(this, `${a.name}Alarm`, {
        alarmName: `${props.stackName}-${a.name}`,
        metric: metricFunction(a.metric),
        threshold: a.threshold ?? 0,
        evaluationPeriods: 1,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        alarmDescription: a.description,
        actionsEnabled: props.enableAlerts
      })
      alarm.addAlarmAction({
        bind: () => ({alarmActionArn: slackAlertTopic.topicArn})
      })
      alarm.addOkAction({
        bind: () => ({alarmActionArn: slackAlertTopic.topicArn})
      })
      alarm.addInsufficientDataAction({
        bind: () => ({alarmActionArn: slackAlertTopic.topicArn})
      })
      this.alarms = {...this.alarms, [a.name]: alarm}
    }

  }
}
