const splunkProcessor = require("../src/splunkProcessor.js")
const {describe, it, expect, beforeEach, afterEach, vi} = globalThis
const zlib = require("node:zlib")

vi.mock("../src/helpers.js", () => ({
  putRecordsToKinesisStream: vi.fn(),
  putRecordsToFirehoseStream: vi.fn()
}))
const helpers = require("../src/helpers.js")

describe("handler", () => {
  const mockContext = {
    functionName: "test-function",
    functionVersion: "1",
    invokedFunctionArn: "arn:aws:lambda:us-east-1:123456789012:function:test-function",
    memoryLimitInMB: "128",
    awsRequestId: "test-request-id",
    logGroupName: "/aws/lambda/test-function",
    logStreamName: "2024/01/01/[$LATEST]test"
  }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ENV = "test"
    process.env.LOG_LEVEL = "INFO"

    // Mock helper functions
    helpers.putRecordsToKinesisStream = vi.fn((streamName, records, client, resolve, reject) => {
      resolve()
    })
    helpers.putRecordsToFirehoseStream = vi.fn((streamName, records, client, resolve, reject) => {
      resolve()
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should process DATA_MESSAGE records successfully", async () => {
    const logData = {
      messageType: "DATA_MESSAGE",
      owner: "123456789012",
      logGroup: "/aws/lambda/test-function",
      logStream: "2024/01/01/[$LATEST]test",
      subscriptionFilters: ["test-filter"],
      logEvents: [
        {
          id: "12345678901234567890123456789012345678901234567890",
          timestamp: 1510109208016,
          message: JSON.stringify({level: "INFO", message: "Test log message"})
        }
      ]
    }

    const compressedData = zlib.gzipSync(JSON.stringify(logData))
    const base64Data = compressedData.toString("base64")

    const event = {
      records: [
        {
          recordId: "record1",
          data: base64Data
        }
      ]
    }

    const response = await splunkProcessor.handler(event, mockContext)

    expect(response.records).toHaveLength(1)
    expect(response.records[0].recordId).toBe("record1")
    expect(response.records[0].result).toBe("Ok")
    expect(response.records[0].data).toBeDefined()
  })

  it("should drop CONTROL_MESSAGE records", async () => {
    const logData = {
      messageType: "CONTROL_MESSAGE",
      owner: "123456789012"
    }

    const compressedData = zlib.gzipSync(JSON.stringify(logData))
    const base64Data = compressedData.toString("base64")

    const event = {
      records: [
        {
          recordId: "record1",
          data: base64Data
        }
      ]
    }

    const response = await splunkProcessor.handler(event, mockContext)

    expect(response.records).toHaveLength(1)
    expect(response.records[0].recordId).toBe("record1")
    expect(response.records[0].result).toBe("Dropped")
  })

  it("should mark records as ProcessingFailed when decompression fails", async () => {
    const event = {
      records: [
        {
          recordId: "record1",
          data: "invalid-base64-gzip-data"
        }
      ]
    }

    const response = await splunkProcessor.handler(event, mockContext)

    expect(response.records).toHaveLength(1)
    expect(response.records[0].recordId).toBe("record1")
    expect(response.records[0].result).toBe("ProcessingFailed")
  })

  it("should mark records as ProcessingFailed when logGroup is missing", async () => {
    const logData = {
      messageType: "DATA_MESSAGE",
      owner: "123456789012",
      logStream: "2024/01/01/[$LATEST]test",
      logEvents: [
        {
          id: "12345678901234567890123456789012345678901234567890",
          timestamp: 1510109208016,
          message: "Test message"
        }
      ]
    }

    const compressedData = zlib.gzipSync(JSON.stringify(logData))
    const base64Data = compressedData.toString("base64")

    const event = {
      records: [
        {
          recordId: "record1",
          data: base64Data
        }
      ]
    }

    const response = await splunkProcessor.handler(event, mockContext)

    expect(response.records).toHaveLength(1)
    expect(response.records[0].recordId).toBe("record1")
    expect(response.records[0].result).toBe("ProcessingFailed")
  })

  it("should mark records as ProcessingFailed when owner is missing", async () => {
    const logData = {
      messageType: "DATA_MESSAGE",
      logGroup: "/aws/lambda/test-function",
      logStream: "2024/01/01/[$LATEST]test",
      logEvents: [
        {
          id: "12345678901234567890123456789012345678901234567890",
          timestamp: 1510109208016,
          message: "Test message"
        }
      ]
    }

    const compressedData = zlib.gzipSync(JSON.stringify(logData))
    const base64Data = compressedData.toString("base64")

    const event = {
      records: [
        {
          recordId: "record1",
          data: base64Data
        }
      ]
    }

    const response = await splunkProcessor.handler(event, mockContext)

    expect(response.records).toHaveLength(1)
    expect(response.records[0].recordId).toBe("record1")
    expect(response.records[0].result).toBe("ProcessingFailed")
  })

  it("should process multiple records", async () => {
    const logData1 = {
      messageType: "DATA_MESSAGE",
      owner: "123456789012",
      logGroup: "/aws/lambda/test-function",
      logStream: "2024/01/01/[$LATEST]test",
      logEvents: [
        {
          id: "12345678901234567890123456789012345678901234567890",
          timestamp: 1510109208016,
          message: "Test message 1"
        }
      ]
    }

    const logData2 = {
      messageType: "DATA_MESSAGE",
      owner: "123456789012",
      logGroup: "/aws/lambda/test-function2",
      logStream: "2024/01/01/[$LATEST]test",
      logEvents: [
        {
          id: "98765432109876543210987654321098765432109876543210",
          timestamp: 1510109208017,
          message: "Test message 2"
        }
      ]
    }

    const compressedData1 = zlib.gzipSync(JSON.stringify(logData1))
    const compressedData2 = zlib.gzipSync(JSON.stringify(logData2))

    const event = {
      records: [
        {
          recordId: "record1",
          data: compressedData1.toString("base64")
        },
        {
          recordId: "record2",
          data: compressedData2.toString("base64")
        }
      ]
    }

    const response = await splunkProcessor.handler(event, mockContext)

    expect(response.records).toHaveLength(2)
    expect(response.records[0].recordId).toBe("record1")
    expect(response.records[0].result).toBe("Ok")
    expect(response.records[1].recordId).toBe("record2")
    expect(response.records[1].result).toBe("Ok")
  })

  it("should handle exceptions and return 500 status code", async () => {
    const event = {
      records: [
        {
          recordId: "record1",
          // Missing data property to trigger an error
        }
      ]
    }

    await expect(splunkProcessor.handler(event, mockContext)).rejects.toThrow()
  })

  it("should process records with Kinesis stream (isSas=true)", async () => {
    const logData = {
      messageType: "DATA_MESSAGE",
      owner: "123456789012",
      logGroup: "/aws/lambda/test-function",
      logStream: "2024/01/01/[$LATEST]test",
      logEvents: [
        {
          id: "12345678901234567890123456789012345678901234567890",
          timestamp: 1510109208016,
          message: "Test message"
        }
      ]
    }

    const compressedData = zlib.gzipSync(JSON.stringify(logData))

    const event = {
      sourceKinesisStreamArn: "arn:aws:kinesis:us-east-1:123456789012:stream/test-stream",
      records: [
        {
          recordId: "record1",
          data: compressedData.toString("base64"),
          kinesisRecordMetadata: {
            partitionKey: "test-partition-key"
          }
        }
      ]
    }

    const response = await splunkProcessor.handler(event, mockContext)

    expect(response.records).toHaveLength(1)
    expect(response.records[0].result).toBe("Ok")
  })

  it("should process records with Firehose stream (isSas=false)", async () => {
    const logData = {
      messageType: "DATA_MESSAGE",
      owner: "123456789012",
      logGroup: "/aws/lambda/test-function",
      logStream: "2024/01/01/[$LATEST]test",
      logEvents: [
        {
          id: "12345678901234567890123456789012345678901234567890",
          timestamp: 1510109208016,
          message: "Test message"
        }
      ]
    }

    const compressedData = zlib.gzipSync(JSON.stringify(logData))

    const event = {
      deliveryStreamArn: "arn:aws:firehose:us-east-1:123456789012:deliverystream/test-stream",
      records: [
        {
          recordId: "record1",
          data: compressedData.toString("base64")
        }
      ]
    }

    const response = await splunkProcessor.handler(event, mockContext)

    expect(response.records).toHaveLength(1)
    expect(response.records[0].result).toBe("Ok")
  })

  it("should process lambda logs with JSON messages", async () => {
    const logData = {
      messageType: "DATA_MESSAGE",
      owner: "123456789012",
      logGroup: "/aws/lambda/test-function",
      logStream: "2024/01/01/[$LATEST]test",
      logEvents: [
        {
          id: "12345678901234567890123456789012345678901234567890",
          timestamp: 1510109208016,
          message: JSON.stringify({level: "INFO", msg: "Lambda function executed"})
        }
      ]
    }

    const compressedData = zlib.gzipSync(JSON.stringify(logData))

    const event = {
      records: [
        {
          recordId: "record1",
          data: compressedData.toString("base64")
        }
      ]
    }

    const response = await splunkProcessor.handler(event, mockContext)

    expect(response.records).toHaveLength(1)
    expect(response.records[0].result).toBe("Ok")
  })

  it("should process ECS logs", async () => {
    const logData = {
      messageType: "DATA_MESSAGE",
      owner: "123456789012",
      logGroup: "/aws/ecs/test-cluster",
      logStream: "ecs/test-container/abc123",
      logEvents: [
        {
          id: "12345678901234567890123456789012345678901234567890",
          timestamp: 1510109208016,
          message: "Container started"
        }
      ]
    }

    const compressedData = zlib.gzipSync(JSON.stringify(logData))

    const event = {
      records: [
        {
          recordId: "record1",
          data: compressedData.toString("base64")
        }
      ]
    }

    const response = await splunkProcessor.handler(event, mockContext)

    expect(response.records).toHaveLength(1)
    expect(response.records[0].result).toBe("Ok")
  })

  it("should process Step Functions logs", async () => {
    const logData = {
      messageType: "DATA_MESSAGE",
      owner: "123456789012",
      logGroup: "/aws/stepfunctions/test-state-machine",
      logStream: "test-stream",
      logEvents: [
        {
          id: "12345678901234567890123456789012345678901234567890",
          timestamp: 1510109208016,
          message: JSON.stringify({
            type: "ExecutionStarted",
            details: {
              input: JSON.stringify({
                headers: {
                  "x-correlation-id": "test-correlation-id",
                  "x-request-id": "test-request-id"
                }
              })
            }
          })
        }
      ]
    }

    const compressedData = zlib.gzipSync(JSON.stringify(logData))

    const event = {
      records: [
        {
          recordId: "record1",
          data: compressedData.toString("base64")
        }
      ]
    }

    const response = await splunkProcessor.handler(event, mockContext)

    expect(response.records).toHaveLength(1)
    expect(response.records[0].result).toBe("Ok")
  })
})
