import {vi} from "vitest"
import {Logger} from "@aws-lambda-powertools/logger"
import {eventHandler, HandlerParams} from "../src/janitor"
import {Lambda} from "@aws-sdk/client-lambda"

export const mockHandler = (function_arn: string, versions_to_keep: number | undefined) => {
  const logger= {
    info: vi.fn(),
    error: vi.fn()
  }
  const lambda_sdk = {
    listVersionsByFunction: vi.fn().mockReturnValue({
      promise: vi.fn()
    }),
    deleteFunction: vi.fn().mockReturnValue({
      promise: vi.fn()
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
