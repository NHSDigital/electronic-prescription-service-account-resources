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

export interface MetricAlarmProps {
  readonly stackName: string
  readonly enableAlerts: boolean
  readonly namespace: string
  readonly alarmDefinition: AlarmDefinition
  readonly slackAlertTopic: ITopic
}

export class MetricAlarm extends Construct {
  alarms: {[key: string]: Alarm}

  public constructor(scope: Construct, id: string, props: MetricAlarmProps){
    super(scope, id)

    const metricFunction = (metricName: string) =>
      new Metric({
        namespace: props.namespace,
        metricName,
        statistic: "Sum",
        period: Duration.minutes(1)
      })

    const alarm =new Alarm(this, `${props.alarmDefinition.name}Alarm`, {
      alarmName: `${props.stackName}-${props.alarmDefinition.name}-new`,
      metric: metricFunction(props.alarmDefinition.metric),
      threshold: props.alarmDefinition.threshold ?? 0,
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
      alarmDescription: props.alarmDefinition.description,
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
    this.alarms = {...this.alarms, [props.alarmDefinition.name]: alarm}

  }
}
