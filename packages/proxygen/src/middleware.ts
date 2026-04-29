import inputOutputLogger from "@middy/input-output-logger"
import {LogItemMessage} from "@aws-lambda-powertools/logger/types"
import {Logger} from "@aws-lambda-powertools/logger"
import {Request} from "@middy/core"

const SENSITIVE_REQUEST_KEYS: ReadonlySet<string> = new Set([
  "specDefinition",
  "secretKey",
  "secretCert"
])

const removeSensitiveRequestKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => removeSensitiveRequestKeys(item))
  }

  if (value !== null && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (accumulator, [key, nestedValue]) => {
        if (!SENSITIVE_REQUEST_KEYS.has(key)) {
          accumulator[key] = removeSensitiveRequestKeys(nestedValue)
        }

        return accumulator
      },
      {}
    )
  }

  return value
}

export const iOLogger = (logger: Logger) => inputOutputLogger({
  logger: (request: unknown) => {
    const sanitizedRequest = removeSensitiveRequestKeys(request)

    if ((request as Request).response) {
      logger.debug(sanitizedRequest as LogItemMessage)
    } else {
      logger.info(sanitizedRequest as LogItemMessage)
    }
  }
})
