import {generateMockTrigger} from "./utils/testUtils"
import {
  formatHeader,
  formatTrigger,
  formatState,
  formatMoreInfoUrl
} from "../src/contentFormatting"

describe("formatHeader", () => {
  it("returns a correctly formatted header when called", () => {
    const expected = ":red_circle: Test Alarm"
    const actual = formatHeader("Test Alarm", "ALARM")
    expect(actual).toEqual(expected)
  })
})

describe("formatTrigger", () => {
  const testCases = [
    {
      description: "returns a correctly formatted trigger when called",
      mockTrigger: generateMockTrigger(90061),
      expected: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 1 day, 1 hour, 1 minute, 1 second."
    },
    {
      description: "returns correctly formatted day in period when called",
      mockTrigger: generateMockTrigger(86400),
      expected: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 1 day."
    },
    {
      description: "returns correctly formatted days in period when called",
      mockTrigger: generateMockTrigger(172800),
      expected: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 2 days."
    },
    {
      description: "returns correctly formatted hour in period when called",
      mockTrigger: generateMockTrigger(3600),
      expected: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 1 hour."
    },
    {
      description: "returns correctly formatted hours in period when called",
      mockTrigger: generateMockTrigger(7200),
      expected: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 2 hours."
    },
    {
      description: "returns correctly formatted minute in period when called",
      mockTrigger: generateMockTrigger(60),
      expected: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 1 minute."
    },
    {
      description: "returns correctly formatted minutes in period when called",
      mockTrigger: generateMockTrigger(120),
      expected: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 2 minutes."
    },
    {
      description: "returns correctly formatted second in period when called",
      mockTrigger: generateMockTrigger(1),
      expected: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 1 second."
    },
    {
      description: "returns correctly formatted seconds in period when called",
      mockTrigger: generateMockTrigger(2),
      expected: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 2 seconds."
    },
    {
      description: "returns a correctly formatted period when called with mixed units",
      mockTrigger: generateMockTrigger(86460),
      expected: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 1 day, 1 minute."
    },
    {
      description: "returns a correctly formatted period when called with mixed units",
      mockTrigger: generateMockTrigger(3601),
      expected: "SUM Errors GreaterThanThreshold 1 for 1 period(s) of 1 hour, 1 second."
    }
  ]
  testCases.forEach(({description, mockTrigger, expected}) => {
    it(description, () => {
      const actual = formatTrigger(mockTrigger)
      expect(actual).toEqual(expected)
    })
  })
})

describe("formatState", () => {
  const testCases = [
    {
      description: "returns a correctly formatted state when called with INSUFFICIENT_DATA",
      state: "INSUFFICIENT_DATA",
      expected: ":black_circle: INSUFFICIENT_DATA"
    },
    {
      description: "returns a correctly formatted state when called with ALARM",
      state: "ALARM",
      expected: ":red_circle: ALARM"
    },
    {
      description: "returns a correctly formatted state when called with OK",
      state: "OK",
      expected: ":green_circle: OK"
    }
  ]
  testCases.forEach(({description, state, expected}) => {
    it(description, () => {
      const actual = formatState(state)
      expect(actual).toEqual(expected)
    })
  })
})

describe("formatMoreInfoUrl", () => {
  it("returns a correctly formatted url when called", () => {
    const expected =`https://console.aws.amazon.com/cloudwatch/home?\
region=eu-west-2#alarm:alarmFilter=ANY;name=PSU%20-%20Test%20Alarm`
    const actual = formatMoreInfoUrl("eu-west-2", "PSU - Test Alarm")
    expect(actual).toEqual(expected)
  })
})
