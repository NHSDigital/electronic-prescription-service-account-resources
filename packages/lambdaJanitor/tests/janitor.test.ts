import {Logger} from "@aws-lambda-powertools/logger"
import {listPaginatedVersionNumbers} from "../src/janitor"
import {mockHandler} from "./utils"
import {Lambda} from "@aws-sdk/client-lambda"

describe("listPaginatedVersionNumbers", () => {
  it("fetches a single page of version numbers", async () => {
    const {logger, lambda_sdk} = mockHandler("", 1)
    lambda_sdk.listVersionsByFunction.mockReturnValueOnce(Promise.resolve({
      Versions: [{Version: "1"}, {Version: "2"}]
    }))

    const versions = await listPaginatedVersionNumbers(
      logger as unknown as Logger,
      lambda_sdk as unknown as Lambda,
      "some_arn"
    )

    expect(versions).toEqual([1, 2])
    expect(logger.info).toHaveBeenCalledWith("Found versions: 1, 2")
  })

  it("fetches multiple pages of version numbers", async () => {
    const {logger, lambda_sdk} = mockHandler("", 1)
    lambda_sdk.listVersionsByFunction.mockReturnValueOnce(Promise.resolve({
      Versions: [{Version: "1"}, {Version: "2"}],
      NextMarker: "next"
    })
    ).mockReturnValueOnce(Promise.resolve({
      Versions: [{Version: "3"}, {Version: "4"}]
    }))

    const versions = await listPaginatedVersionNumbers(
      logger as unknown as Logger,
      lambda_sdk as unknown as Lambda,
      "some_arn"
    )

    expect(versions).toEqual([1, 2, 3, 4])
    expect(logger.info).toHaveBeenCalledWith("Found versions: 1, 2")
    expect(logger.info).toHaveBeenCalledWith("Found versions: 3, 4")
  })
})

describe("janitor", () => {
  it("should fail if FUNCTION_ARN is not set", async () => {
    const {logger, handler} = mockHandler("", 1)
    await handler()
    expect(logger.error).toHaveBeenCalledWith("FUNCTION_ARN not set")
  })

  it("should retain default value if VERSIONS_TO_KEEP is not set", async () => {
    const {logger, lambda_sdk, handler} = mockHandler("some_arn", undefined)
    lambda_sdk.listVersionsByFunction.mockReturnValueOnce(Promise.resolve({}))

    await handler()
    expect(logger.info).toHaveBeenCalledWith("VERSIONS_TO_KEEP not set. Retaining default value of 3")
  })

  it("should not delete versions if there are none to delete", async () => {
    const {logger, lambda_sdk, handler} = mockHandler("some_arn", 2)
    lambda_sdk.listVersionsByFunction.mockReturnValueOnce(Promise.resolve({
      Versions: [{Version: "1"}, {Version: "2"}]
    }))

    await handler()
    expect(logger.info).toHaveBeenCalledWith("Keeping versions: 2, 1")
    expect(logger.info).toHaveBeenCalledWith("No versions to delete")
  })

  it("should delete versions if there are any to delete", async () => {
    const {logger, lambda_sdk, handler} = mockHandler("some_arn", 1)
    lambda_sdk.listVersionsByFunction.mockReturnValueOnce(Promise.resolve({
      Versions: [{Version: "1"}, {Version: "2"}]
    }))

    await handler()
    expect(lambda_sdk.deleteFunction).toHaveBeenCalledWith({FunctionName: "some_arn", Qualifier: "1"})
    expect(logger.info).toHaveBeenCalledWith(
      `Deleting Lambda version with parameters ${JSON.stringify({FunctionName: "some_arn", Qualifier: "1"})}`
    )
  })

  it("should delete versions in descending order", async () => {
    const {logger, lambda_sdk, handler} = mockHandler("some_arn", 1)
    lambda_sdk.listVersionsByFunction.mockReturnValueOnce(Promise.resolve({
      Versions: [{Version: "2"}, {Version: "1"}]
    }))

    await handler()
    expect(lambda_sdk.deleteFunction).toHaveBeenCalledWith({FunctionName: "some_arn", Qualifier: "1"})
    expect(logger.info).toHaveBeenCalledWith(
      `Deleting Lambda version with parameters ${JSON.stringify({FunctionName: "some_arn", Qualifier: "1"})}`
    )
  })

  it("should not filter out latest version", async () => {
    const {logger, lambda_sdk, handler} = mockHandler("some_arn", 1)
    lambda_sdk.listVersionsByFunction.mockReturnValueOnce(Promise.resolve({
      Versions: [{Version: "1"}, {Version: "$LATEST"}]
    }))

    await handler()
    expect(logger.info).toHaveBeenCalledWith("Found versions: 1")
  })

  it("should pass a happy path test", async () => {
    const {logger, lambda_sdk, handler} = mockHandler("some_arn", 2)
    lambda_sdk.listVersionsByFunction.mockReturnValueOnce(Promise.resolve({
      Versions: [{Version: "1"}, {Version: "2"}, {Version: "$LATEST"}],
      NextMarker: "next"
    })).mockReturnValueOnce(Promise.resolve({
      Versions: [{Version: "4"}, {Version: "3"}]
    }))

    await handler()

    expect(logger.info).toHaveBeenCalledWith("Starting lambda janitor")
    expect(logger.info).toHaveBeenCalledWith("Found versions: 1, 2")
    expect(logger.info).toHaveBeenCalledWith("Found versions: 4, 3")
    expect(logger.info).toHaveBeenCalledWith("Keeping versions: 4, 3")
    expect(logger.info).toHaveBeenCalledWith(
      `Deleting Lambda version with parameters ${JSON.stringify({FunctionName: "some_arn", Qualifier: "2"})}`
    )
    expect(lambda_sdk.deleteFunction).toHaveBeenCalledWith({FunctionName: "some_arn", Qualifier: "2"})
    expect(logger.info).toHaveBeenCalledWith(
      `Deleting Lambda version with parameters ${JSON.stringify({FunctionName: "some_arn", Qualifier: "1"})}`
    )
    expect(lambda_sdk.deleteFunction).toHaveBeenCalledWith({FunctionName: "some_arn", Qualifier: "1"})
    expect(logger.info).toHaveBeenCalledWith("Lambda janitor complete")
  })
})
