import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest"
import {Logger} from "@aws-lambda-powertools/logger"
import {lambdaHandler} from "../src/suppressionReporter"

const {mockedGetSecrets, mockedPostSlackMessage} = vi.hoisted(() => ({
  mockedGetSecrets: vi.fn(),
  mockedPostSlackMessage: vi.fn()
}))

vi.mock("../src/secrets", () => ({
  getSecrets: mockedGetSecrets
}))

vi.mock("../src/helpers", () => ({
  postSlackMessage: mockedPostSlackMessage
}))

let loggerErrorSpy: ReturnType<typeof vi.spyOn>
let loggerInfoSpy: ReturnType<typeof vi.spyOn>

describe("lambdaHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loggerErrorSpy = vi.spyOn(Logger.prototype, "error")
    loggerInfoSpy = vi.spyOn(Logger.prototype, "info")
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
    mockedPostSlackMessage.mockRejectedValue(new Error("Slack error"))

    await expect(lambdaHandler()).rejects.toThrow("Slack error")
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      "Lambda execution failed:",
      expect.objectContaining({error: expect.any(Error)})
    )
  })
})
