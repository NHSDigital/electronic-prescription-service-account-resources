import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import {LogItemMessage} from "@aws-lambda-powertools/logger/lib/cjs/types/Logger"
import {
  checkAllowedEnvironment,
  checkRequiredKeys,
  getAccessToken,
  getProxygenURL,
  getRealmURL,
  Proxygen,
  proxygenErrorHandler
} from "./helpers"
import middy, {Request} from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"
import axios from "axios"

const logger = new Logger({serviceName: "proxygenInstanceGet"})

const lambdaHandler = async (event: Proxygen) => {
  checkRequiredKeys(event, ["environment"])

  checkAllowedEnvironment(event.environment)

  const accessToken = await getAccessToken(event, getRealmURL(event.environment))

  const path = `${getProxygenURL(event.environment)}/apis/${event.apiName}/environments/${event.environment}/instances`
  try {
    const response = await axios.get(path, {
      headers: {"content-type": "application/json", Authorization: `Bearer ${accessToken}`}
    })
    return response.data
  } catch (error: unknown) {
    proxygenErrorHandler(error, logger)
  }
}

export const handler = middy(lambdaHandler)
  .use(injectLambdaContext(logger, {clearState: true}))
  .use(
    inputOutputLogger({
      logger: (request: unknown) => {
        if ((request as Request).response) {
          logger.debug(request as LogItemMessage)
        } else {
          logger.info(request as LogItemMessage)
        }
      }
    })
  )
