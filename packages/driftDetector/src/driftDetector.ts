import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"

const logger = new Logger({serviceName: "driftDetector"})

//eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const lambdaHandler = async (event: any) => {
  try {
    logger.info("Lambda execution started.")
    logger.info("Lambda execution completed.")
  } catch (error) {
    logger.error("Lambda execution failed:", {error})
    throw error
  }
}

export const handler = middy(lambdaHandler)
  .use(injectLambdaContext(logger, {clearState: true}))
  .use(
    inputOutputLogger({
      logger: (request) => {
        if (request.response) {
          logger.debug(request)
        } else {
          logger.info(request)
        }
      }
    })
  )
