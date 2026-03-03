const {describe, it, expect, vi, beforeEach, afterEach} = globalThis
const {Logger} = require("@aws-lambda-powertools/logger")
const splunkProcessor = require("../src/splunkProcessor.js")
const helpers = require("../src/helpers.js")

describe("reingestRecordBatches", () => {
  beforeEach(() => {
    // Mock the putRecordsToKinesisStream and putRecordsToFirehoseStream functions
    vi
      .spyOn(helpers, "putRecordsToKinesisStream")
      // eslint-disable-next-line no-unused-vars
      .mockImplementation((streamName, records, client, resolve, reject, attemptsMade, maxAttempts, logger) => {
        resolve("")
      })
    vi
      .spyOn(helpers, "putRecordsToFirehoseStream")
      // eslint-disable-next-line no-unused-vars
      .mockImplementation((streamName, records, client, resolve, reject, attemptsMade, maxAttempts, logger) => {
        resolve("")
      })
    process.env.ENV = "test"
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should reingest records to Kinesis when isSas is true", async () => {
    const putRecordBatches = [{records: ["record1", "record2"]}]
    const isSas = true
    const totalRecordsToBeReingested = 2
    const event = {
      sourceKinesisStreamArn: "arn:aws:kinesis:us-east-1:123456789012:stream/my-kinesis-stream",
      records: putRecordBatches
    }

    const result = "Success"

    const response = await splunkProcessor.reingestRecordBatches(putRecordBatches, isSas, totalRecordsToBeReingested, event, result)
    
    expect(response.statusCode).toBe(200)
    expect(response.body).toBe(result)
    expect(helpers.putRecordsToKinesisStream).toHaveBeenCalledWith(
      "my-kinesis-stream",
      putRecordBatches[0],
      expect.any(Object),
      expect.any(Function),
      expect.any(Function),
      0,
      20,
      expect.any(Logger)
    )
    const kinesisClient = helpers.putRecordsToKinesisStream.mock.calls[0][2]
    const kinesisRegion =
      typeof kinesisClient.config.region === "function"
        ? await kinesisClient.config.region()
        : kinesisClient.config.region
    expect(kinesisRegion).toBe("us-east-1")
  })

  it("should reingest records to Firehose when isSas is false", async () => {
    const putRecordBatches = [{records: ["record1", "record2"]}]
    const isSas = false
    const totalRecordsToBeReingested = 2
    const event = {
      deliveryStreamArn: "arn:aws:firehose:us-east-1:123456789012:deliverystream/my-firehose-stream",
      records: putRecordBatches
    }
    const result = "Success"

    const response = await splunkProcessor.reingestRecordBatches(putRecordBatches, isSas, totalRecordsToBeReingested, event, result)

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe(result)
    expect(helpers.putRecordsToFirehoseStream).toHaveBeenCalledWith(
      "my-firehose-stream",
      putRecordBatches[0],
      expect.any(Object),
      expect.any(Function),
      expect.any(Function),
      0,
      20,
      expect.any(Logger)
    )
    const firehoseClient = helpers.putRecordsToFirehoseStream.mock.calls[0][2]
    const firehoseRegion =
      typeof firehoseClient.config.region === "function"
        ? await firehoseClient.config.region()
        : firehoseClient.config.region
    expect(firehoseRegion).toBe("us-east-1")
  })

  it("should handle failure", async () => {
    const putRecordBatches = [{records: ["record1", "record2"]}]
    const isSas = true
    const totalRecordsToBeReingested = 2
    const event = {
      sourceKinesisStreamArn: "arn:aws:kinesis:us-east-1:123456789012:stream/my-kinesis-stream",
      records: putRecordBatches
    }
    const result = "Success"

    // Mock a rejected promise for putRecordsToKinesisStream
    vi
      .spyOn(helpers, "putRecordsToKinesisStream")
      // eslint-disable-next-line no-unused-vars
      .mockImplementation((streamName, records, client, resolve, reject, attemptsMade, maxAttempts) => {
        reject("Some error")
      })

    const response = await splunkProcessor.reingestRecordBatches(putRecordBatches, isSas, totalRecordsToBeReingested, event, result)
    
    expect(response.statusCode).toBe(500)
    expect(response.body).toBe("Some error")
  })
})
