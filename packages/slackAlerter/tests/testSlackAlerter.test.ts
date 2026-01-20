/* eslint-disable @typescript-eslint/consistent-type-assertions */
import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest"
import {generateMockAlarmEvent} from "./utils/testUtils"
import {populateCloudWatchAlertMessageContent} from "../src/slackMessageTemplates"
import {Context, SQSEvent, SQSBatchResponse} from "aws-lambda"
import {Logger} from "@aws-lambda-powertools/logger"

const mockedGetSecrets = vi.fn()
const mockedPostSlackMessage = vi.fn()

vi.mock("../src/secrets", () => ({
  getSecrets: mockedGetSecrets
}))

vi.mock("../src/helpers", () => ({
  postSlackMessage: mockedPostSlackMessage
}))

const slackAlerterModule = await import("../src/slackAlerter")
const {handler} = slackAlerterModule

describe("Slack Alerter", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Happy Path
  const testCases = [
    {
      description: "posts a correctly formatted message to slack when called with a valid SQS event",
      alarmName: "psu_TestLambda_Errors",
      expected: {
        header: ":red_circle: TestLambda Errors ALARM",
        stack: "psu"
      }
    },
    {
      description: "posts a correctly formatted message to slack when called with a non standard alarm name",
      alarmName: "TestLambda",
      expected: {
        header: ":red_circle: TestLambda ALARM",
        stack: "unknown"
      }
    },
    {
      description: "posts a correctly formatted message to slack when called with a non standard alarm name",
      alarmName: "TestLambda_Errors",
      expected: {
        header: ":red_circle: TestLambda_Errors ALARM",
        stack: "unknown"
      }
    },
    {
      description: "posts a correctly formatted message to slack when called with a warning alert name",
      alarmName: "psu_TestLambda_TestWarning_WARNING",
      expected: {
        header: ":large_orange_circle: TestLambda TestWarning WARNING",
        stack: "psu"
      }
    }
  ]
  testCases.forEach(({description, alarmName, expected}) => {
    it(description, async() => {
      mockedGetSecrets.mockImplementation(() => {
        return {
          "monitoring-alertSuppressions": JSON.stringify([
            {alarmName: "TestAlarm", stack: "psu"},
            {alarmName: "AnotherAlarm", stack: "dev"}
          ])
        }
      })

      const mockSQSEvent = generateMockAlarmEvent([{
        name: alarmName,
        description: "Count of TestLambda errors",
        id: "record1"
      }]) as SQSEvent
      const context = {} as Context
      const callback = vi.fn()

      await handler(mockSQSEvent, context, callback)
      const expectedCall = populateCloudWatchAlertMessageContent({
        header: expected.header,
        timestamp: "2024-07-09T12:01:37.700+0000",
        stack: expected.stack,
        environment: "dev",
        region: "eu-west-2",
        description: "Count of TestLambda errors",
        // eslint-disable-next-line max-len
        reason: `Threshold Crossed: 1 out of the last 1 datapoints [2.0 (09/07/24 11:51:00)] was greater than the threshold (1.0) (minimum 1 datapoint for OK -> ALARM transition).`,
        trigger: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 5 minutes.",
        oldState: ":black_circle: INSUFFICIENT_DATA",
        newState: ":red_circle: ALARM",
        // eslint-disable-next-line max-len
        moreInfoUrl: `https://console.aws.amazon.com/cloudwatch/home?region=eu-west-2#alarm:alarmFilter=ANY;name=${alarmName}`
      })
      expect(mockedPostSlackMessage).toHaveBeenCalledWith(expectedCall, expect.any(Logger))
    })
  })

  it("posts multiple message to slack when called with a valid SQS event containing multiple records", async () => {
    mockedGetSecrets.mockImplementation(() => {
      return {
        "monitoring-alertSuppressions": JSON.stringify([
          {alarmName: "TestAlarm", stack: "psu"},
          {alarmName: "AnotherAlarm", stack: "dev"}
        ])
      }
    })

    const mockSQSEvent = generateMockAlarmEvent([
      {
        name: "psu_TestLambda_Errors",
        description: "Count of TestLambda errors",
        id: "record1"
      },
      {
        name: "psu_TestLambda2_Errors",
        description: "Count of TestLambda2 errors",
        id: "record2"
      }
    ]) as SQSEvent
    const context = {} as Context
    const callback = vi.fn()

    await handler(mockSQSEvent, context, callback)

    const expectedRequest1 = populateCloudWatchAlertMessageContent({
      header: ":red_circle: TestLambda Errors ALARM",
      timestamp: "2024-07-09T12:01:37.700+0000",
      stack: "psu",
      environment: "dev",
      region: "eu-west-2",
      description: "Count of TestLambda errors",
      reason: `Threshold Crossed: 1 out of the last 1 datapoints [2.0 (09/07/24 11:51:00)] was greater than the \
threshold (1.0) (minimum 1 datapoint for OK -> ALARM transition).`,
      trigger: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 5 minutes.",
      oldState: ":black_circle: INSUFFICIENT_DATA",
      newState: ":red_circle: ALARM",
      moreInfoUrl: `https://console.aws.amazon.com/cloudwatch/home?\
region=eu-west-2#alarm:alarmFilter=ANY;name=psu_TestLambda_Errors`
    }
    )
    const expectedRequest2 = populateCloudWatchAlertMessageContent({
      header: ":red_circle: TestLambda2 Errors ALARM",
      timestamp: "2024-07-09T12:01:37.700+0000",
      stack: "psu",
      environment: "dev",
      region: "eu-west-2",
      description: "Count of TestLambda2 errors",
      reason: `Threshold Crossed: 1 out of the last 1 datapoints [2.0 (09/07/24 11:51:00)] was greater than the \
threshold (1.0) (minimum 1 datapoint for OK -> ALARM transition).`,
      trigger: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 5 minutes.",
      oldState: ":black_circle: INSUFFICIENT_DATA",
      newState: ":red_circle: ALARM",
      moreInfoUrl: `https://console.aws.amazon.com/cloudwatch/home?\
region=eu-west-2#alarm:alarmFilter=ANY;name=psu_TestLambda2_Errors`
    })

    expect(mockedPostSlackMessage).toHaveBeenCalledWith(expectedRequest1, expect.any(Logger))
    expect(mockedPostSlackMessage).toHaveBeenCalledWith(expectedRequest2, expect.any(Logger))
  })

  it("returns no failures when when called with a valid SQS event", async () => {
    mockedGetSecrets.mockImplementation(() => {
      return {
        "monitoring-alertSuppressions": JSON.stringify([
          {alarmName: "TestAlarm", stack: "psu"},
          {alarmName: "AnotherAlarm", stack: "dev"}
        ])
      }
    })

    const mockSQSEvent = generateMockAlarmEvent([{
      name: "psu_TestLambda_Errors",
      description: "Count of TestLambda errors",
      id: "record1"
    }]) as SQSEvent
    const context = {} as Context
    const callback = vi.fn()

    const actual = await handler(mockSQSEvent, context, callback)

    const expectedResponse = {
      batchItemFailures: []
    }
    expect(actual).toEqual(expectedResponse)
  })

  // Errors processing SNS Message
  it("Returns batchItemFailures when SNS message contains invalid json", async () => {
    mockedGetSecrets.mockImplementation(() => {
      return {
        "monitoring-alertSuppressions": JSON.stringify([
          {alarmName: "TestAlarm", stack: "psu"},
          {alarmName: "AnotherAlarm", stack: "dev"}
        ])
      }
    })

    const mockSQSEvent = {
      Records: [
        {
          body: "",
          messageId: "record1"
        }
      ]
    } as SQSEvent
    const context = {} as Context
    const callback = vi.fn()

    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        {
          itemIdentifier: "record1"
        }
      ]
    }
    const actual = await handler(mockSQSEvent, context, callback)
    expect(actual).toEqual(expectedResponse)
  })

  it("Returns only failed records when called with an SQS message containing a mix of valid and invalid records",
    async () => {
      mockedGetSecrets.mockImplementation(() => {
        return {
          "monitoring-alertSuppressions": JSON.stringify([
          ])
        }
      })
      mockedPostSlackMessage
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("Slack error"))

      const mockSQSEvent = generateMockAlarmEvent([
        {
          name: "psu_TestLambda_Errors",
          description: "Count of TestLambda errors",
          id: "record1"
        },
        {
          name: "psu_TestLambda2_Errors",
          description: "Count of TestLambda2 errors",
          id: "record2"
        }
      ]) as SQSEvent

      const context = {} as Context
      const callback = vi.fn()

      const expectedResponse: SQSBatchResponse = {
        batchItemFailures: [
          {
            itemIdentifier: "record2"
          }
        ]
      }
      const actual = await handler(mockSQSEvent, context, callback)
      expect(actual).toEqual(expectedResponse)
    })

  // Errors posting to Slack
  it("Returns batchItemFailures when an error occurs posting to slack", async () => {
    mockedGetSecrets.mockImplementation(() => {
      return {
        "monitoring-alertSuppressions": JSON.stringify([
          {alarmName: "TestAlarm", stack: "psu"},
          {alarmName: "AnotherAlarm", stack: "dev"}
        ])
      }
    })
    mockedPostSlackMessage.mockRejectedValue(new Error("Slack error"))

    const mockSQSEvent = generateMockAlarmEvent([{
      name: "psu_TestLambda_Errors",
      description: "Count of TestLambda errors",
      id: "record1"
    }]) as SQSEvent
    const context = {} as Context
    const callback = vi.fn()

    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        {
          itemIdentifier: "record1"
        }
      ]
    }
    const actual = await handler(mockSQSEvent, context, callback)
    expect(actual).toEqual(expectedResponse)
  })

  it("suppresses single alert correctly", async () => {
    mockedGetSecrets.mockImplementation(() => {
      return {
        "monitoring-alertSuppressions": JSON.stringify([
          {alarmName: "TestLambda Errors", stack: "psu", "jiraReference": "JIRA-123"}
        ])
      }
    })

    const mockSQSEvent = generateMockAlarmEvent([
      {
        name: "psu_TestLambda_Errors",
        description: "Count of TestLambda errors",
        id: "record1"
      }
    ]) as SQSEvent
    const context = {} as Context
    const callback = vi.fn()

    await handler(mockSQSEvent, context, callback)
    expect(mockedPostSlackMessage).not.toHaveBeenCalled()
  })

  it("suppresses multiple alerts correctly", async () => {
    mockedGetSecrets.mockImplementation(() => {
      return {
        "monitoring-alertSuppressions": JSON.stringify([
          {alarmName: "TestLambda Errors", stack: "psu", "jiraReference": "JIRA-123"}
        ])
      }
    })

    const mockSQSEvent = generateMockAlarmEvent([
      {
        name: "psu_TestLambda_Errors",
        description: "Count of TestLambda errors",
        id: "record1"
      },
      {
        name: "psu_TestLambda2_Errors",
        description: "Count of TestLambda2 errors",
        id: "record2"
      }
    ]) as SQSEvent
    const context = {} as Context
    const callback = vi.fn()

    await handler(mockSQSEvent, context, callback)

    const expectedRequest = populateCloudWatchAlertMessageContent({
      header: ":red_circle: TestLambda2 Errors ALARM",
      timestamp: "2024-07-09T12:01:37.700+0000",
      stack: "psu",
      environment: "dev",
      region: "eu-west-2",
      description: "Count of TestLambda2 errors",
      reason: `Threshold Crossed: 1 out of the last 1 datapoints [2.0 (09/07/24 11:51:00)] was greater than the \
threshold (1.0) (minimum 1 datapoint for OK -> ALARM transition).`,
      trigger: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 5 minutes.",
      oldState: ":black_circle: INSUFFICIENT_DATA",
      newState: ":red_circle: ALARM",
      moreInfoUrl: `https://console.aws.amazon.com/cloudwatch/home?\
region=eu-west-2#alarm:alarmFilter=ANY;name=psu_TestLambda2_Errors`
    }
    )

    expect(mockedPostSlackMessage).toHaveBeenCalledTimes(1)
    expect(mockedPostSlackMessage).toHaveBeenCalledWith(expectedRequest, expect.any(Logger))
  })

  it("does not suppresses when param is not json", async () => {
    mockedGetSecrets.mockImplementation(() => {
      return {
        "monitoring-alertSuppressions": "this is not json"
      }
    })

    const mockSQSEvent = generateMockAlarmEvent([
      {
        name: "psu_TestLambda_Errors",
        description: "Count of TestLambda errors",
        id: "record1"
      }
    ]) as SQSEvent
    const context = {} as Context
    const callback = vi.fn()

    await handler(mockSQSEvent, context, callback)

    const expectedRequest = populateCloudWatchAlertMessageContent({
      header: ":red_circle: TestLambda Errors ALARM",
      timestamp: "2024-07-09T12:01:37.700+0000",
      stack: "psu",
      environment: "dev",
      region: "eu-west-2",
      description: "Count of TestLambda errors",
      reason: `Threshold Crossed: 1 out of the last 1 datapoints [2.0 (09/07/24 11:51:00)] was greater than the \
threshold (1.0) (minimum 1 datapoint for OK -> ALARM transition).`,
      trigger: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 5 minutes.",
      oldState: ":black_circle: INSUFFICIENT_DATA",
      newState: ":red_circle: ALARM",
      moreInfoUrl: `https://console.aws.amazon.com/cloudwatch/home?\
region=eu-west-2#alarm:alarmFilter=ANY;name=psu_TestLambda_Errors`
    }
    )
    expect(mockedPostSlackMessage).toHaveBeenCalledTimes(1)
    expect(mockedPostSlackMessage).toHaveBeenCalledWith(expectedRequest, expect.any(Logger))
  })

})
