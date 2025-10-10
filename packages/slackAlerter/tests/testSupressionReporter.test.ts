import {jest} from "@jest/globals"
import {Logger} from "@aws-lambda-powertools/logger"

const mockedGetSecrets = jest.fn()
const mockedPostSlackMessage = jest.fn()

jest.unstable_mockModule("../src/secrets", () => ({
  getSecrets: mockedGetSecrets
}))

jest.unstable_mockModule("../src/helpers", () => ({
  postSlackMessage: mockedPostSlackMessage
}))

const lambdaHandlerModule = await import("../src/suppressionReporter")
const {lambdaHandler} = lambdaHandlerModule

const loggerErrorSpy = jest.spyOn(Logger.prototype, "error")
const loggerInfoSpy = jest.spyOn(Logger.prototype, "info")

describe("lambdaHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("posts a slack message when suppressions exist", async () => {
    mockedGetSecrets.mockImplementation(() => {
      return {
        "monitoring-alertSuppressions": JSON.stringify([
          {alarmName: "TestAlarm", stack: "psu"},
          {alarmName: "AnotherAlarm", stack: "dev"}
        ])
      }
    })
    const expectedMessage =
      "Please confirm the current alert suppressions are still valid:\n" +
      "- Alarm Name: TestAlarm, Stack: psu\n- Alarm Name: AnotherAlarm, Stack: dev"

    await lambdaHandler()

    expect(mockedGetSecrets).toHaveBeenCalledWith(["monitoring-alertSuppressions"], "parameterStore")
    expect(mockedPostSlackMessage).toHaveBeenCalledWith(expectedMessage, expect.any(Logger))
    expect(loggerInfoSpy).toHaveBeenCalledWith(
      "Found 2 alert suppression(s):",
      {suppressions: [
        {alarmName: "TestAlarm", stack: "psu"},
        {alarmName: "AnotherAlarm", stack: "dev"}
      ]}
    )
  })

  it("logs info when no suppressions found", async () => {
    mockedGetSecrets.mockImplementation(() => {
      return {
        "monitoring-alertSuppressions": JSON.stringify([])
      }
    })

    await lambdaHandler()

    expect(mockedGetSecrets).toHaveBeenCalledWith(["monitoring-alertSuppressions"], "parameterStore")
    expect(mockedPostSlackMessage).not.toHaveBeenCalled()
    expect(loggerInfoSpy).toHaveBeenCalledWith("No alert suppressions found.")
  })

  it("throws error if parameter is missing", async () => {
    mockedGetSecrets.mockImplementation(() => {
      return {
        "monitoring-alertSuppressions": undefined
      }
    })

    await expect(lambdaHandler()).rejects.toThrow("Parameter 'monitoring-alertSuppressions' is undefined or not found.")
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      "Lambda execution failed:",
      expect.objectContaining({error: expect.any(Error)})
    )
  })

  it("throws error if parameter is not valid JSON", async () => {
    mockedGetSecrets.mockImplementation(() => {
      return {
        "monitoring-alertSuppressions": "not a json"
      }
    })

    await expect(lambdaHandler()).rejects.toThrow()
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      "Lambda execution failed:",
      expect.objectContaining({error: expect.any(Error)})
    )
  })

  it("logs error and throws if postSlackMessage throws", async () => {
    mockedGetSecrets.mockImplementation(() => {
      return {
        "monitoring-alertSuppressions": JSON.stringify([
          {alarmName: "TestAlarm", stack: "psu"},
          {alarmName: "AnotherAlarm", stack: "dev"}
        ])
      }
    })
    mockedPostSlackMessage.mockRejectedValue(new Error("Slack error") as never)

    await expect(lambdaHandler()).rejects.toThrow("Slack error")
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      "Lambda execution failed:",
      expect.objectContaining({error: expect.any(Error)})
    )
  })
})
