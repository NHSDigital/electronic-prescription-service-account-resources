import {Construct} from "constructs"
import {Alarm} from "aws-cdk-lib/aws-cloudwatch"
import {MetricAlarms} from "../constructs/MetricAlarms"
import {ITopic} from "aws-cdk-lib/aws-sns"

export interface AlarmsProps {
  readonly stackName: string
  readonly enableAlerts: boolean
  readonly lambdaConcurrencyThreshold: number
  readonly lambdaConcurrencyWarningThreshold: number
  readonly slackAlertTopicArn: ITopic
}

export class Alarms extends Construct {
  stepFunctionAlarms: Array<{[key: string]: Alarm}>
  lambdaAlarms: Array<{[key: string]: Alarm}>

  public constructor(scope: Construct, id: string, props: AlarmsProps){
    super(scope, id)

    const stepFunctionAlarmDefinitions = [
      {
        name: `Account_StepFunction_Errors`,
        metric: "ExecutionsFailed",
        // eslint-disable-next-line max-len
        description: "Failed executions during invocation of step functions has occurred in the EPS account. Please investigate."
      },
      {
        name: `Account_StepFunction_ExecutionsAborted`,
        metric: "ExecutionsAborted",
        // eslint-disable-next-line max-len
        description: "Aborted executions during invocation of step functions has occurred in the EPS account. Please investigate."
      },
      {
        name: `Account_StepFunction_ExecutionsTimedOut`,
        metric: "ExecutionsTimedOut",
        // eslint-disable-next-line max-len
        description: "Execution timeout during invocation of step functions has occurred in the EPS account. Please investigate."
      },
      {
        name: `Account_StepFunction_ExecutionsThrottled`,
        metric: "ExecutionsThrottled",
        // eslint-disable-next-line max-len
        description: "Execution throttled during invocation of step functions has occurred in the EPS account. Please investigate."
      }
    ]

    const stepFunctionAlarms = new MetricAlarms(this, "StepFunctionAlarms", {
      stackName: props.stackName,
      enableAlerts: props.enableAlerts,
      namespace: "AWS/States",
      alarmDefinitions: stepFunctionAlarmDefinitions,
      slackAlertTopic: props.slackAlertTopicArn
    })

    const lambdaAlarmDefinitions = [
      {
        name: "Account_Lambda_Errors",
        metric: "Errors",
        description: "Unhandled error during invocation of lambdas has occurred in the EPS account. Please investigate."
      },
      {
        name: "Account_Lambda_Throttles",
        metric: "Throttles",
        description: "Throttling of lambdas has occurred in the EPS account. Please investigate."
      },
      {
        name: "Account_Lambda_Concurrency",
        metric: "ConcurrentExecutions",
        // eslint-disable-next-line max-len
        description: "Concurrency of all lambdas running in the EPS account has breached 90% threshold. There may be throttling occurring soon",
        threshold: props.lambdaConcurrencyThreshold
      },
      {
        name: "Account_Lambda_Concurrency_WARNING",
        metric: "ConcurrentExecutions",
        // eslint-disable-next-line max-len
        description: "WARNING - concurrency of all lambdas running the EPS account has breached warning threshold. No immediate action is required",
        threshold: props.lambdaConcurrencyWarningThreshold
      }
    ]

    const lambdaAlarms = new MetricAlarms(this, "LambdaAlarms", {
      stackName: props.stackName,
      enableAlerts: props.enableAlerts,
      namespace: "AWS/Lambda",
      alarmDefinitions: lambdaAlarmDefinitions,
      slackAlertTopic: props.slackAlertTopicArn
    })

    this.stepFunctionAlarms = [stepFunctionAlarms.alarms]
    this.lambdaAlarms = [lambdaAlarms.alarms]
  }
}
