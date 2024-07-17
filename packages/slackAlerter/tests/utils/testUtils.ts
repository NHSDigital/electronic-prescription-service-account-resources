import {SNSEvent, SNSMessage} from "aws-lambda"
import {CloudWatchAlarm, Trigger} from "../../src/types"

interface Alarm {
    name: string
    description: string
}

export const generateMockAlarmEvent = (alarms: Alarm[]): Partial<SNSEvent> => {

  const records: Partial<SNSMessage>[] = []
  for (const alarm of alarms){
    const message = {
      Sns: {
        Message: JSON.stringify(generateMockAlarm(alarm))
      }
    } as Partial<SNSMessage>
    records.push(message)
  }

  return {
    Records: records
  } as SNSEvent
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
    "MetricName": "Invocations",
    "Namespace": "AWS/Lambda",
    "StatisticType": "Statistic",
    "Statistic": "SUM",
    "Unit": null,
    "Dimensions": [
      {
        "value": "snsTest",
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
