import inputOutputLogger from "@middy/input-output-logger"
import {LogItemMessage} from "@aws-lambda-powertools/logger/types"
import {Logger} from "@aws-lambda-powertools/logger"
import {Request} from "@middy/core"

export const iOLogger = (logger: Logger) => inputOutputLogger({
  logger: (request: unknown) => {
    if ((request as Request).response) {
      logger.debug(request as LogItemMessage)
    } else {
      logger.info(request as LogItemMessage)
    }
  }
})
