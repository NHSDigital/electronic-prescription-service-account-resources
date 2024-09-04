/* eslint-disable @typescript-eslint/consistent-type-assertions */
import {jest} from "@jest/globals"
import fetchMock from "jest-fetch-mock"
import {generateMockAlarmEvent} from "./utils/testUtils"
import {populateCloudWatchAlertMessageContent} from "../src/slackMessageTemplates"
import {handler} from "../src/slackAlerter"
import {Context, SQSEvent, SQSBatchResponse} from "aws-lambda"

fetchMock.enableMocks()

describe("Slack Alerter", () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  // Happy Path
  const testCases = [
    {
      description: "posts a correctly formatted message to slack when called with a valid SQS event",
      alarmName: "psu_TestLambda_Errors",
      expected: {
        header: ":red_circle: TestLambda Errors",
        stack: "psu"
      }
    },
    {
      description: "posts a correctly formatted message to slack when called with a non standard alarm name",
      alarmName: "TestLambda",
      expected: {
        header: ":red_circle: TestLambda",
        stack: "unknown"
      }
    },
    {
      description: "posts a correctly formatted message to slack when called with a non standard alarm name",
      alarmName: "TestLambda_Errors",
      expected: {
        header: ":red_circle: TestLambda_Errors",
        stack: "unknown"
      }
    }
  ]
  testCases.forEach(({description, alarmName, expected}) => {
    it(description, async() => {
      fetchMock
        .once(JSON.stringify({
          Name: "account-resources-SlackWebhookUrl",
          SecretString: "www.slack.com/webhook"
        }))
        .once(JSON.stringify({ok: true}))

      const mockSQSEvent = generateMockAlarmEvent([{
        name: alarmName,
        description: "Count of TestLambda errors",
        id: "record1"
      }]) as SQSEvent
      const context = {} as Context
      const callback = jest.fn()

      await handler(mockSQSEvent, context, callback)

      const expectedRequest = [
        "www.slack.com/webhook",
        {
          body: JSON.stringify(populateCloudWatchAlertMessageContent({
            header: expected.header,
            timestamp: "2024-07-09T12:01:37.700+0000",
            stack: expected.stack,
            environment: "dev",
            region: "eu-west-2",
            description: "Count of TestLambda errors",
            reason: `Threshold Crossed: 1 out of the last 1 datapoints [2.0 (09/07/24 11:51:00)] was greater than the \
threshold (1.0) (minimum 1 datapoint for OK -> ALARM transition).`,
            trigger: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 5 minutes.",
            oldState: ":black_circle: INSUFFICIENT_DATA",
            newState: ":red_circle: ALARM",
            moreInfoUrl: `https://console.aws.amazon.com/cloudwatch/home?\
region=eu-west-2#alarm:alarmFilter=ANY;name=${alarmName}`
          }
          )),
          headers: {
            "Content-Type": "application/json"
          },
          method: "POST"
        }
      ]
      expect(fetchMock.mock.calls[1]).toEqual(expectedRequest)
    })
  })

  it("posts multiple message to slack when called with a valid SQS event containing multiple records", async () => {
    fetchMock
      .once(JSON.stringify({
        Name: "account-resources-SlackWebhookUrl",
        SecretString: "www.slack.com/webhook"
      }))
      .once(JSON.stringify({ok: true}))
      .once(JSON.stringify({
        Name: "account-resources-SlackWebhookUrl",
        SecretString: "www.slack.com/webhook"
      }))
      .once(JSON.stringify({ok: true}))

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
    const callback = jest.fn()

    await handler(mockSQSEvent, context, callback)

    const expectedRequest1 = [
      "www.slack.com/webhook",
      {
        body: JSON.stringify(populateCloudWatchAlertMessageContent({
          header: ":red_circle: TestLambda Errors",
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
        )),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      }
    ]
    const expectedRequest2 = [
      "www.slack.com/webhook",
      {
        body: JSON.stringify(populateCloudWatchAlertMessageContent({
          header: ":red_circle: TestLambda2 Errors",
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
        )),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      }
    ]

    expect(fetchMock.mock.calls.length).toEqual(4)
    expect(fetchMock.mock.calls[1]).toEqual(expectedRequest1)
    expect(fetchMock.mock.calls[3]).toEqual(expectedRequest2)
  })

  it("gets secrets when posting a message to slack", async () => {
    fetchMock
      .once(JSON.stringify({
        Name: "account-resources-SlackWebhookUrl",
        SecretString: "www.slack.com/webhook"
      }))
      .once(JSON.stringify({ok: true}))

    const mockSQSEvent = generateMockAlarmEvent([{
      name: "psu_TestLambda_Errors",
      description: "Count of TestLambda errors",
      id: "record1"
    }]) as SQSEvent
    const context = {} as Context
    const callback = jest.fn()

    await handler(mockSQSEvent, context, callback)

    const expectedRequest = [
      "http://localhost:2773/secretsmanager/get?secretId=account-resources-SlackWebhookUrl",
      {
        headers: {
          "X-Aws-Parameters-Secrets-Token": "76b6033a-232c-4b5c-8d92-39760202b2d8"
        },
        method: "GET"
      }
    ]
    expect(fetchMock.mock.calls[0]).toEqual(expectedRequest)
  })

  it("returns no failures when when called with a valid SQS event", async () => {
    fetchMock
      .once(JSON.stringify({
        Name: "account-resources-SlackWebhookUrl",
        SecretString: "www.slack.com/webhook"
      }))
      .once(JSON.stringify({ok: true}))

    const mockSQSEvent = generateMockAlarmEvent([{
      name: "psu_TestLambda_Errors",
      description: "Count of TestLambda errors",
      id: "record1"
    }]) as SQSEvent
    const context = {} as Context
    const callback = jest.fn()

    const actual = await handler(mockSQSEvent, context, callback)

    const expectedResponse = {
      batchItemFailures: []
    }
    expect(actual).toEqual(expectedResponse)
  })

  // Errors processing SNS Message
  it("Returns batchItemFailures when SNS message contains invalid json", async () => {
    fetchMock
      .once(JSON.stringify({
        Name: "account-resources-SlackWebhookUrl",
        SecretString: "www.slack.com/webhook"
      }))
      .once(JSON.stringify({ok: true}))

    const mockSQSEvent = {
      Records: [
        {
          body: "",
          messageId: "record1"
        }
      ]
    } as SQSEvent
    const context = {} as Context
    const callback = jest.fn()

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
      fetchMock
        .once(JSON.stringify({
          Name: "account-resources-SlackWebhookUrl",
          SecretString: "www.slack.com/webhook"
        }))
        .once(JSON.stringify({ok: true}))
        .once(JSON.stringify({
          Name: "account-resources-SlackWebhookUrl",
          SecretString: "www.slack.com/webhook"
        }))
        .mockRejectOnce(new Error("Mock fetch error"))

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
      const callback = jest.fn()

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
    fetchMock
      .once(JSON.stringify({
        Name: "account-resources-SlackWebhookUrl",
        SecretString: "www.slack.com/webhook"
      }))
      .mockRejectOnce(new Error("Mock fetch error"))

    const mockSQSEvent = generateMockAlarmEvent([{
      name: "psu_TestLambda_Errors",
      description: "Count of TestLambda errors",
      id: "record1"
    }]) as SQSEvent
    const context = {} as Context
    const callback = jest.fn()

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

  it("Returns batchItemFailures when an error response is received from slack", async () => {
    fetchMock
      .once(JSON.stringify({
        Name: "account-resources-SlackWebhookUrl",
        SecretString: "www.slack.com/webhook"
      }))
      .once(JSON.stringify({ok: false, error: "invalid_payload"}), {status: 400})

    const mockSQSEvent = generateMockAlarmEvent([{
      name: "psu_TestLambda_Errors",
      description: "Count of TestLambda errors",
      id: "record1"
    }]) as SQSEvent
    const context = {} as Context
    const callback = jest.fn()

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
})
