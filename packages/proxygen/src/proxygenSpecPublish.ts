import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import {LogItemMessage} from "@aws-lambda-powertools/logger/lib/cjs/types/Logger"
import {
  checkAllowedEnvironment,
  checkRequiredKeys,
  getAccessToken,
  getRealmURL,
  Proxygen,
  proxygenErrorHandler
} from "./helpers"
import middy, {Request} from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"
import axios from "axios"

const logger = new Logger({serviceName: "proxygenSpecPublish"})

const lambdaHandler = async (event: Proxygen) => {
  checkRequiredKeys(event, ["environment", "specDefinition"])

  checkAllowedEnvironment(event.environment)

  const accessToken = await getAccessToken(event, getRealmURL(event.environment))

  let path
  if (event.environment === "uat") {
    path = `https://proxygen.prod.api.platform.nhs.uk/apis/${event.apiName}/spec/uat`
  } else if (event.environment === "prod") {
    path = `https://proxygen.prod.api.platform.nhs.uk/apis/${event.apiName}/spec`
  } else {
    throw new Error("Environment is not uat or prod")
  }

  try {
    const response = await axios.put(path, event.specDefinition, {
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
