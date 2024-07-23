import {jest} from "@jest/globals"
import fetchMock from "jest-fetch-mock"
import {generateMockAlarmEvent} from "./utils/testUtils"
import {populateCloudWatchAlertMessageContent} from "../src/slackMessageTemplates"
import {handler} from "../src/slackAlerter"
import {Context, SNSEvent} from "aws-lambda"

fetchMock.enableMocks()

describe("Slack Alerter", () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  // Happy Path
  it("posts a correctly formatted message to slack when called with a valid SNS event", async () => {
    fetchMock
      .once(JSON.stringify({
        Name: "account-resources-SlackWebhookUrl",
        SecretString: "www.slack.com/webhook"
      }))
      .once(JSON.stringify({ok: true}))

    const mockSNSEvent = generateMockAlarmEvent([{
      name: "PSU - Test Alarm 1",
      description: "Test alarm for some test lambda"
    }]) as SNSEvent
    const context = {} as Context
    const callback = jest.fn()

    await handler(mockSNSEvent, context, callback)

    const expectedRequest = [
      "www.slack.com/webhook",
      {
        body: JSON.stringify(populateCloudWatchAlertMessageContent({
          header: ":red_circle: Test Alarm 1",
          timestamp: "2024-07-09T12:01:37.700+0000",
          stack: "PSU",
          environment: "dev",
          region: "eu-west-2",
          description: "Test alarm for some test lambda",
          reason: `Threshold Crossed: 1 out of the last 1 datapoints [2.0 (09/07/24 11:51:00)] was greater than the \
threshold (1.0) (minimum 1 datapoint for OK -> ALARM transition).`,
          trigger: "SUM Invocations GreaterThanThreshold 1 for 1 period(s) of 5 minutes.",
          oldState: ":black_circle: INSUFFICIENT_DATA",
          newState: ":red_circle: ALARM",
          moreInfoUrl: `https://console.aws.amazon.com/cloudwatch/home?\
region=eu-west-2#alarm:alarmFilter=ANY;name=PSU%20-%20Test%20Alarm%201`
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

  it("posts a correctly formatted message to slack when called with a valid SNS event a non standard alarm name", async () => {
    fetchMock
      .once(JSON.stringify({
        Name: "account-resources-SlackWebhookUrl",
        SecretString: "www.slack.com/webhook"
      }))
      .once(JSON.stringify({ok: true}))

    const mockSNSEvent = generateMockAlarmEvent([{
      name: "Test Alarm 1",
      description: "Test alarm for some test lambda"
    }]) as SNSEvent
    const context = {} as Context
    const callback = jest.fn()

    await handler(mockSNSEvent, context, callback)

    const expectedRequest = [
      "www.slack.com/webhook",
      {
        body: JSON.stringify(populateCloudWatchAlertMessageContent({
          header: ":red_circle: Test Alarm 1",
          timestamp: "2024-07-09T12:01:37.700+0000",
          stack: "unknown",
          environment: "dev",
          region: "eu-west-2",
          description: "Test alarm for some test lambda",
          reason: `Threshold Crossed: 1 out of the last 1 datapoints [2.0 (09/07/24 11:51:00)] was greater than the \
threshold (1.0) (minimum 1 datapoint for OK -> ALARM transition).`,
          trigger: "SUM Invocations GreaterThanThreshold 1 for 1 period(s) of 5 minutes.",
          oldState: ":black_circle: INSUFFICIENT_DATA",
          newState: ":red_circle: ALARM",
          moreInfoUrl: `https://console.aws.amazon.com/cloudwatch/home?\
region=eu-west-2#alarm:alarmFilter=ANY;name=Test%20Alarm%201`
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

  it("posts multiple message to slack when called with a valid SNS event containing multiple records", async () => {
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

    const mockSNSEvent = generateMockAlarmEvent([
      {
        name: "PSU - Test Alarm 1",
        description: "Test alarm for some test lambda"
      },
      {
        name: "PSU - Test Alarm 2",
        description: "Test alarm 2 for some test lambda"
      }
    ]) as SNSEvent
    const context = {} as Context
    const callback = jest.fn()

    await handler(mockSNSEvent, context, callback)

    const expectedRequest1 = [
      "www.slack.com/webhook",
      {
        body: JSON.stringify(populateCloudWatchAlertMessageContent({
          header: ":red_circle: Test Alarm 1",
          timestamp: "2024-07-09T12:01:37.700+0000",
          stack: "PSU",
          environment: "dev",
          region: "eu-west-2",
          description: "Test alarm for some test lambda",
          reason: `Threshold Crossed: 1 out of the last 1 datapoints [2.0 (09/07/24 11:51:00)] was greater than the \
threshold (1.0) (minimum 1 datapoint for OK -> ALARM transition).`,
          trigger: "SUM Invocations GreaterThanThreshold 1 for 1 period(s) of 5 minutes.",
          oldState: ":black_circle: INSUFFICIENT_DATA",
          newState: ":red_circle: ALARM",
          moreInfoUrl: `https://console.aws.amazon.com/cloudwatch/home?\
region=eu-west-2#alarm:alarmFilter=ANY;name=PSU%20-%20Test%20Alarm%201`
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
          header: ":red_circle: Test Alarm 2",
          timestamp: "2024-07-09T12:01:37.700+0000",
          stack: "PSU",
          environment: "dev",
          region: "eu-west-2",
          description: "Test alarm 2 for some test lambda",
          reason: `Threshold Crossed: 1 out of the last 1 datapoints [2.0 (09/07/24 11:51:00)] was greater than the \
threshold (1.0) (minimum 1 datapoint for OK -> ALARM transition).`,
          trigger: "SUM Invocations GreaterThanThreshold 1 for 1 period(s) of 5 minutes.",
          oldState: ":black_circle: INSUFFICIENT_DATA",
          newState: ":red_circle: ALARM",
          moreInfoUrl: `https://console.aws.amazon.com/cloudwatch/home?\
region=eu-west-2#alarm:alarmFilter=ANY;name=PSU%20-%20Test%20Alarm%202`
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

    const mockSNSEvent = generateMockAlarmEvent([{
      name: "PSU - Test Alarm 1",
      description: "Test alarm for some test lambda"
    }]) as SNSEvent
    const context = {} as Context
    const callback = jest.fn()

    await handler(mockSNSEvent, context, callback)

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

  // Errors processing SNS Message
  it("Throws SyntaxError when SNS record contains invalid json", async () => {
    fetchMock
      .once(JSON.stringify({
        Name: "account-resources-SlackWebhookUrl",
        SecretString: "www.slack.com/webhook"
      }))
      .once(JSON.stringify({ok: true}))

    const mockSNSEvent = {
      Records: [
        {
          Sns: {
            Message: ""
          }
        }
      ]
    } as SNSEvent

        generateMockAlarmEvent([{
          name: "PSU - Test Alarm 1",
          description: "Test alarm for some test lambda"
        }]) as SNSEvent
        const context = {} as Context
        const callback = jest.fn()

        expect(async () =>
          await handler(mockSNSEvent, context, callback)
        ).rejects.toThrow(SyntaxError)
  })

  // Errors posting to Slack
  it("Throws Error when an error occurs posting to slack", async () => {
    fetchMock
      .once(JSON.stringify({
        Name: "account-resources-SlackWebhookUrl",
        SecretString: "www.slack.com/webhook"
      }))
      .mockRejectOnce(new Error("Mock fetch error"))

    const mockSNSEvent = generateMockAlarmEvent([{
      name: "PSU - Test Alarm 1",
      description: "Test alarm for some test lambda"
    }]) as SNSEvent
    const context = {} as Context
    const callback = jest.fn()

    expect(async () =>
      await handler(mockSNSEvent, context, callback)
    ).rejects.toThrow("Mock fetch error")
  })

  it("Throws Error when an error response is received from slack", async () => {
    fetchMock
      .once(JSON.stringify({
        Name: "account-resources-SlackWebhookUrl",
        SecretString: "www.slack.com/webhook"
      }))
      .once(JSON.stringify({ok: false, error: "invalid_payload"}), {status: 400})

    const mockSNSEvent = generateMockAlarmEvent([{
      name: "PSU - Test Alarm 1",
      description: "Test alarm for some test lambda"
    }]) as SNSEvent
    const context = {} as Context
    const callback = jest.fn()

    expect(async () =>
      await handler(mockSNSEvent, context, callback)
    ).rejects.toThrow("Error response received from slack")
  })
})
