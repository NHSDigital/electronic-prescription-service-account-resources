const {transformLogEvent} = require("../src/splunkProcessor.js")
const {describe, it, expect} = globalThis

/* eslint-disable  max-len */

describe("transformLogEvent tests for ecs log groups", () => {

  it("should parse a simple json log event", async () => {
    const logEvent = {
      message: JSON.stringify({
        field1: "foo",
        field2: "bar"
      }),
      id: 1
    }
    const logGroup = "/aws/ecs/foo"
    const logStream = "ecs/container_name/task_id"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, logStream, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/ecs/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: {
          field1: "foo",
          field2: "bar",
          containerName: "container_name",
          ecsTaskId: "task_id",
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
    const logGroup = "/aws/ecs/foo"
    const logStream = "ecs/container_name/task_id"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, logStream, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/ecs/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: {
          message: "this is not JSON",
          containerName: "container_name",
          ecsTaskId: "task_id"
        }
      }
    }

    expect(transformedLogEvent).toEqual(JSON.stringify(expectedResult))
  })

  it("should parse an unknown container name", async () => {
    const logEvent = {
      message: JSON.stringify({
        field1: "foo",
        field2: "bar"
      }),
      id: 1
    }
    const logGroup = "/aws/ecs/foo"
    const logStream = "ecs"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, logStream, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/ecs/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: {
          field1: "foo",
          field2: "bar",
          containerName: "unknown",
          ecsTaskId: "unknown",
          }
      }
    }

    expect(transformedLogEvent).toEqual(JSON.stringify(expectedResult))
  })

  it("should parse an unknown task id", async () => {
    const logEvent = {
      message: JSON.stringify({
        field1: "foo",
        field2: "bar"
      }),
      id: 1
    }
    const logGroup = "/aws/ecs/foo"
    const logStream = "ecs/container_name"
    const accountNumber = 1234
    const transformedLogEvent = await transformLogEvent(logEvent, logGroup, logStream, accountNumber)
    const expectedResult = {
      host: "AWS:AccountNumber:1234",
      source: "AWS:LogGroup:/aws/ecs/foo",
      sourcetype: "aws:cloudwatch",
      event: {
        id: 1,
        message: {
          field1: "foo",
          field2: "bar",
          containerName: "container_name",
          ecsTaskId: "unknown",
          }
      }
    }

    expect(transformedLogEvent).toEqual(JSON.stringify(expectedResult))
  })

})
