import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import {
  checkAllowedEnvironment,
  checkRequiredKeys,
  getAccessToken,
  getRealmURL,
  Proxygen,
  proxygenErrorHandler
} from "./helpers"
import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"
import axios from "axios"

const logger = new Logger({serviceName: "proxygenSpecPublish"})

const lambdaHandler = async (event: Proxygen) => {
  checkRequiredKeys(event, ["environment", "specDefinition"])

  checkAllowedEnvironment(event.environment)

  const accessToken = await getAccessToken(event, getRealmURL())

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
      logger: (request) => {
        if (request.response) {
          logger.debug(request)
        } else {
          logger.info(request)
        }
      }
    })
  )
