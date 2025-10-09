import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"
import {getSecrets} from "./secrets"
import {postSlackMessage} from "./helpers"

const logger = new Logger({serviceName: "supressionReporter"})

export const lambdaHandler = async () => {
  try {
    const secrets = await getSecrets(["monitoring-alertSuppressions"], "parameterStore")
    const parameter = secrets["monitoring-alertSuppressions"]
    if (!parameter) {
      throw new Error("Parameter 'monitoring-alertSuppressions' is undefined or not found.")
    }
    const suppressions = JSON.parse(parameter) as Array<{alarmName: string, stack: string}>

    if (suppressions.length === 0) {
      logger.info("No alert suppressions found.")
    } else {
      logger.info(`Found ${suppressions.length} alert suppression(s):`, {suppressions})
      const suppressionsList = suppressions.map(s => `- Alarm Name: ${s.alarmName}, Stack: ${s.stack}`).join("\n")
      const message = `Please confirm the current alert suppressions are still valid:\n${suppressionsList}`
      await postSlackMessage(message, logger)
    }
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
