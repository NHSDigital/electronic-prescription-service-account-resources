const splunkProcessor = require("../src/splunkProcessor.js")
const helpers = require("../src/helpers.js")

const {expect, describe, it} = require("@jest/globals")
const {Firehose} = require("@aws-sdk/client-firehose")
const {Kinesis} = require("@aws-sdk/client-kinesis")
const {Logger} = require("@aws-lambda-powertools/logger")

jest.mock("@aws-sdk/client-kinesis")
jest.mock("@aws-sdk/client-firehose")

describe("reingestRecordBatches", () => {
  beforeEach(() => {
    // Mock the putRecordsToKinesisStream and putRecordsToFirehoseStream functions
    jest
      .spyOn(helpers, "putRecordsToKinesisStream")
      // eslint-disable-next-line no-unused-vars
      .mockImplementation((streamName, records, client, resolve, reject, attemptsMade, maxAttempts, logger) => {
        resolve("")
      })
    jest
      .spyOn(helpers, "putRecordsToFirehoseStream")
      // eslint-disable-next-line no-unused-vars
      .mockImplementation((streamName, records, client, resolve, reject, attemptsMade, maxAttempts, logger) => {
        resolve("")
      })
    process.env.ENV = "test"
  })
  afterEach(() => {
    jest.clearAllMocks()
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
    expect(Kinesis).toHaveBeenCalledWith({region: "us-east-1"})
    expect(helpers.putRecordsToKinesisStream).toHaveBeenCalledWith(
      "my-kinesis-stream",
      putRecordBatches[0],
      expect.any(Kinesis),
      expect.any(Function),
      expect.any(Function),
      0,
      20,
      expect.any(Logger)
    )
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
    expect(Firehose).toHaveBeenCalledWith({region: "us-east-1"})
    expect(helpers.putRecordsToFirehoseStream).toHaveBeenCalledWith(
      "my-firehose-stream",
      putRecordBatches[0],
      expect.any(Firehose),
      expect.any(Function),
      expect.any(Function),
      0,
      20,
      expect.any(Logger)
    )
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
    jest
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
