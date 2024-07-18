const {transformLogEvent} = require("../src/splunkProcessor.js")
const {expect, describe, it} = require("@jest/globals")

/* eslint-disable  max-len */


describe("transformLogEvent tests for stepFunctions log groups", () => {

  it("should parse correctly for stepfunctions when correlation fields do exist", async () => {
    const logEvent = {
      message: JSON.stringify({
        field1: "foo",
        field2: "bar",
        details: {
          input: JSON.stringify({
            body: "foo",
            headers: {
              "apigw-request-id": "ac9ddfe0-030a-4bcd-b63b-d4d1a32381a0",
              "X-Amzn-Trace-Id": "Root=1-6613feca-23ef52160d128597232a4c97",
              "x-correlation-id": "b9156b99-13cc-4719-b832-73905e07e760",
              "x-request-id": "a22cc83d-b40b-43a1-b5f7-71944cd498bc"
            }
          })
        }
      }),
      id: 1
    }
    const logGroup = "/aws/stepfunctions/foo"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/stepfunctions/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: {
          field1: "foo",
          field2: "bar",
          details: {
            input: "redacted"
          },
          "apigw-request-id": "ac9ddfe0-030a-4bcd-b63b-d4d1a32381a0",
          "X-Amzn-Trace-Id": "Root=1-6613feca-23ef52160d128597232a4c97",
          "x-correlation-id": "b9156b99-13cc-4719-b832-73905e07e760",
          "x-request-id": "a22cc83d-b40b-43a1-b5f7-71944cd498bc",
        }
      }
    }

    expect(transformedLogEvent).toEqual(JSON.stringify(expectedResult))
  })

  it("should parse correctly for stepfunctions when all correlation fields do not exist", async () => {
    const logEvent = {
      message: JSON.stringify({
        field1: "foo",
        field2: "bar",
        details: {
          input: JSON.stringify({
            body: "foo"
          })
        }
      }),
      id: 1
    }
    const logGroup = "/aws/stepfunctions/foo"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/stepfunctions/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: {
          field1: "foo",
          field2: "bar",
          details: {
            input: "redacted"
          }
        }
      }
    }

    expect(transformedLogEvent).toEqual(JSON.stringify(expectedResult))
  })

  it("should parse correctly for stepfunctions when some correlation fields do not exist", async () => {
    const logEvent = {
      message: JSON.stringify({
        field1: "foo",
        field2: "bar",
        details: {
          input: JSON.stringify({
            body: "foo",
            headers: {
              "x-correlation-id": "b9156b99-13cc-4719-b832-73905e07e760",
              "x-request-id": "a22cc83d-b40b-43a1-b5f7-71944cd498bc"
            }
          })
        }
      }),
      id: 1
    }
    const logGroup = "/aws/stepfunctions/foo"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/stepfunctions/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: {
          field1: "foo",
          field2: "bar",
          details: {
            input: "redacted"
          },
          "x-correlation-id": "b9156b99-13cc-4719-b832-73905e07e760",
          "x-request-id": "a22cc83d-b40b-43a1-b5f7-71944cd498bc",
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
    const logGroup = "/aws/stepfunctions/foo"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/stepfunctions/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: "this is not JSON"
      }
    }

    expect(transformedLogEvent).toEqual(JSON.stringify(expectedResult))
  })

  it("should parse correctly for stepfunctions when correlation fields do exist and are mixed case", async () => {
    const logEvent = {
      message: JSON.stringify({
        field1: "foo",
        field2: "bar",
        details: {
          input: JSON.stringify({
            body: "foo",
            headers: {
              "apigw-request-id": "ac9ddfe0-030a-4bcd-b63b-d4d1a32381a0",
              "X-Amzn-Trace-Id": "Root=1-6613feca-23ef52160d128597232a4c97",
              "X-correlation-id": "b9156b99-13cc-4719-b832-73905e07e760",
              "X-request-id": "a22cc83d-b40b-43a1-b5f7-71944cd498bc"
            }
          })
        }
      }),
      id: 1
    }
    const logGroup = "/aws/stepfunctions/foo"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/stepfunctions/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: {
          field1: "foo",
          field2: "bar",
          details: {
            input: "redacted"
          },
          "apigw-request-id": "ac9ddfe0-030a-4bcd-b63b-d4d1a32381a0",
          "X-Amzn-Trace-Id": "Root=1-6613feca-23ef52160d128597232a4c97",
          "x-correlation-id": "b9156b99-13cc-4719-b832-73905e07e760",
          "x-request-id": "a22cc83d-b40b-43a1-b5f7-71944cd498bc",
        }
      }
    }

    expect(transformedLogEvent).toEqual(JSON.stringify(expectedResult))
  })

  it("should redact input for stepfunctions", async () => {
    const logEvent = {
      message: JSON.stringify({
        field1: "foo",
        field2: "bar",
        details: {
          input: JSON.stringify({
            body: "foo"
          })
        }
      }),
      id: 1
    }
    const logGroup = "/aws/stepfunctions/foo"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/stepfunctions/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: {
          field1: "foo",
          field2: "bar",
          details: {
            input: "redacted"
          }
        }
      }
    }

    expect(transformedLogEvent).toEqual(JSON.stringify(expectedResult))
  })

  it("should redact parameters for stepfunctions", async () => {
    const logEvent = {
      message: JSON.stringify({
        field1: "foo",
        field2: "bar",
        details: {
          parameters: JSON.stringify({
            body: "foo"
          })
        }
      }),
      id: 1
    }
    const logGroup = "/aws/stepfunctions/foo"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/stepfunctions/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: {
          field1: "foo",
          field2: "bar",
          details: {
            parameters: "redacted"
          }
        }
      }
    }

    expect(transformedLogEvent).toEqual(JSON.stringify(expectedResult))
  })

  it("should redact output for stepfunctions", async () => {
    const logEvent = {
      message: JSON.stringify({
        field1: "foo",
        field2: "bar",
        details: {
          output: JSON.stringify({
            body: "foo"
          })
        }
      }),
      id: 1
    }
    const logGroup = "/aws/stepfunctions/foo"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/stepfunctions/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: {
          field1: "foo",
          field2: "bar",
          details: {
            output: "redacted"
          }
        }
      }
    }

    expect(transformedLogEvent).toEqual(JSON.stringify(expectedResult))
  })

  it("should parse correctly for stepfunctions when nothing needs redacting", async () => {
    const logEvent = {
      message: JSON.stringify({
        field1: "foo",
        field2: "bar",
        details: {
        }
      }),
      id: 1
    }
    const logGroup = "/aws/stepfunctions/foo"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/stepfunctions/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: {
          field1: "foo",
          field2: "bar",
          details: {},
        }
      }
    }

    expect(transformedLogEvent).toEqual(JSON.stringify(expectedResult))
  })


})
