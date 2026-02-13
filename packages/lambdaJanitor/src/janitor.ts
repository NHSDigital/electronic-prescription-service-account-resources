import {Logger} from "@aws-lambda-powertools/logger"
import {LogLevel} from "@aws-lambda-powertools/logger/types"
import {Lambda, DeleteFunctionCommandInput, ListVersionsByFunctionCommandInput} from "@aws-sdk/client-lambda"

const LOG_LEVEL = (process.env.LOG_LEVEL ?? "info") as LogLevel
const FUNCTION_ARN = process.env.FUNCTION_ARN ?? ""
const DEFAULT_VERSIONS_TO_KEEP = "3"
const VERSIONS_TO_KEEP = parseInt(process.env.VERSIONS_TO_KEEP ?? DEFAULT_VERSIONS_TO_KEEP)

export type HandlerParams = {
  logger: Logger,
  lambda_sdk: Lambda,
  function_arn: string,
  versions_to_keep: number
}
export const eventHandler = async (handler_params: HandlerParams) => {
  const {logger, lambda_sdk, function_arn, versions_to_keep} = handler_params

  logger.info("Starting lambda janitor")

  if (!function_arn) {
    logger.error("FUNCTION_ARN not set")
    return
  }

  if (!versions_to_keep) {
    logger.info(`VERSIONS_TO_KEEP not set. Retaining default value of ${DEFAULT_VERSIONS_TO_KEEP}`)
  }

  const versions = await listPaginatedVersionNumbers(logger, lambda_sdk, function_arn)

  const descending_sort = (a: number, b: number) => b - a
  versions.sort(descending_sort)

  const versions_to_delete = versions.slice(versions_to_keep)

  logger.info(`Keeping versions: ${versions.slice(0, versions_to_keep).join(", ")}`)

  if (versions_to_delete.length === 0) {
    logger.info("No versions to delete")
  }

  for(const version of versions_to_delete) {
    await deleteVersion(logger, lambda_sdk, function_arn, version)
  }

  logger.info("Lambda janitor complete")
}

export const listPaginatedVersionNumbers = async (
  logger: Logger,
  lambda_sdk: Lambda,
  function_arn: string,
  accumulator: Array<number> = [],
  marker?: string
): Promise<Array<number>> => {
  const params: ListVersionsByFunctionCommandInput = {
    FunctionName: function_arn,
    Marker: marker,
    MaxItems: 20
  }

  const result = await lambda_sdk.listVersionsByFunction(params)

  const version_numbers = result.Versions
    ?.filter((version) => version.Version && version.Version !== "$LATEST")
    .map((version) => parseInt(version.Version as string)) || []
  logger.info(`Found versions: ${version_numbers.join(", ")}`)

  const new_accumulator = accumulator.concat(version_numbers)

  if (result.NextMarker) {
    return listPaginatedVersionNumbers(logger, lambda_sdk, function_arn, new_accumulator, result.NextMarker)
  }
  return new_accumulator
}

export const deleteVersion = async (logger: Logger, lambda_sdk: Lambda, function_arn: string, version: number) => {
  const params: DeleteFunctionCommandInput = {
    FunctionName: function_arn,
    Qualifier: String(version)
  }

  logger.info(`Deleting Lambda version with parameters ${JSON.stringify(params)}`)
  await lambda_sdk.deleteFunction(params)
}

export const handler = () => {
  const logger = new Logger({serviceName: "lambda_janitor", logLevel: LOG_LEVEL})
  const lambda_sdk = new Lambda()

  const params = {logger, lambda_sdk, function_arn: FUNCTION_ARN, versions_to_keep: VERSIONS_TO_KEEP}
  return eventHandler(params)
}
