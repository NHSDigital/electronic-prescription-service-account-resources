import {Logger} from "@aws-lambda-powertools/logger"
import {eventHandler, HandlerParams} from "../src/janitor"
import {Lambda} from "@aws-sdk/client-lambda"
import {jest} from "@jest/globals"

export const mockHandler = (function_arn: string, versions_to_keep: number | undefined) => {
  const logger= {
    info: jest.fn(),
    error: jest.fn()
  }
  const lambda_sdk = {
    listVersionsByFunction: jest.fn().mockReturnValue({
      promise: jest.fn()
    }),
    deleteFunction: jest.fn().mockReturnValue({
      promise: jest.fn()
    })
  }

  const params: HandlerParams = {
    logger: logger as unknown as Logger,
    lambda_sdk: lambda_sdk as unknown as Lambda,
    function_arn,
    versions_to_keep: versions_to_keep as number
  }
  const handler = () => {
    return eventHandler(params)
  }

  return {
    logger,
    lambda_sdk,
    handler
  }
}
