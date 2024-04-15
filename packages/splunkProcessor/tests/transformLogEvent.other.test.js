const {transformLogEvent} = require("../src/splunkProcessor.js")
const {expect, describe, it} = require("@jest/globals")

/* eslint-disable  max-len */

describe("transformLogEvent tests for other log groups", () => {

  it("should parse a simple json log event", async () => {
    const logEvent = {
      message: JSON.stringify({
        field1: "foo",
        field2: "bar"
      }),
      id: 1
    }
    const logGroup = "/aws/foo"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: {
          field1: "foo",
          field2: "bar"
        }
      }
    }

    expect(transformedLogEvent).toEqual(JSON.stringify(expectedResult))
  })

  it("should parse a non json log event", async () => {
    const logEvent = {
      message: "this is not JSON",
      id: 1
    }
    const logGroup = "/aws/foo"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: "this is not JSON"
      }
    }

    expect(transformedLogEvent).toEqual(JSON.stringify(expectedResult))
  })

})
