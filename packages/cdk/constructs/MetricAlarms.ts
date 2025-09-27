import {Duration} from "aws-cdk-lib"
import {Construct} from "constructs"
import {
  Alarm,
  Metric,
  ComparisonOperator,
  TreatMissingData
} from "aws-cdk-lib/aws-cloudwatch"
import {ITopic} from "aws-cdk-lib/aws-sns"

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
  readonly slackAlertTopic: ITopic
}

export class MetricAlarms extends Construct {
  alarms: {[key: string]: Alarm}

  public constructor(scope: Construct, id: string, props: MetricAlarmsProps){
    super(scope, id)

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
        bind: () => ({alarmActionArn: props.slackAlertTopic.topicArn})
      })
      alarm.addOkAction({
        bind: () => ({alarmActionArn: props.slackAlertTopic.topicArn})
      })
      alarm.addInsufficientDataAction({
        bind: () => ({alarmActionArn: props.slackAlertTopic.topicArn})
      })
      this.alarms = {...this.alarms, [a.name]: alarm}
    }

  }
}
