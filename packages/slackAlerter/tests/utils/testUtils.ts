/* eslint-disable @typescript-eslint/consistent-type-assertions */
import {SQSEvent, SQSRecord} from "aws-lambda"
import {CloudWatchAlarm, Trigger} from "../../src/types"

interface Alarm {
    name: string
    description: string
    id: string
}

export const generateMockAlarmEvent = (alarms: Array<Alarm>): Partial<SQSEvent> => {

  const records: Array<Partial<SQSRecord>> = []
  for (const alarm of alarms){
    const record = {
      body: JSON.stringify(generateMockAlarm(alarm)),
      messageId: alarm.id
    } as Partial<SQSRecord>
    records.push(record)
  }

  return {
    Records: records
  } as SQSEvent
}

const generateMockAlarm = (alarmDetails: Alarm): CloudWatchAlarm => {
  return {
    "AlarmName": alarmDetails.name,
    "AlarmDescription": alarmDetails.description,
    "AWSAccountId": "123456789012",
    "AlarmConfigurationUpdatedTimestamp": "2024-07-09T12:01:00.460+0000",
    "NewStateValue": "ALARM",
    "NewStateReason": `Threshold Crossed: 1 out of the last 1 datapoints [2.0 (09/07/24 11:51:00)] was greater than \
the threshold (1.0) (minimum 1 datapoint for OK -> ALARM transition).`,
    "StateChangeTime": "2024-07-09T12:01:37.700+0000",
    "Region": "EU (London)",
    "AlarmArn": `arn:aws:cloudwatch:eu-west-2:123456789012:alarm:${alarmDetails.name}`,
    "OldStateValue": "INSUFFICIENT_DATA",
    "OKActions": [

    ],
    "AlarmActions": [
      "arn:aws:sns:eu-west-2:123456789012:testTopic"
    ],
    "InsufficientDataActions": [

    ],
    "Trigger": generateMockTrigger(300)
  }
}

export const generateMockTrigger = (period: number): Trigger => {
  return {
    "MetricName": "Errors",
    "Namespace": "AWS/Lambda",
    "StatisticType": "Statistic",
    "Statistic": "SUM",
    "Unit": null,
    "Dimensions": [
      {
        "value": "TestLambda",
        "name": "FunctionName"
      }
    ],
    "Period": period,
    "EvaluationPeriods": 1,
    "DatapointsToAlarm": 1,
    "ComparisonOperator": "GreaterThanThreshold",
    "Threshold": 1.0,
    "TreatMissingData": "missing",
    "EvaluateLowSampleCountPercentile": ""
  }
}
