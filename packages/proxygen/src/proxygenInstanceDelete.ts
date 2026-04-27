import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import {
  checkAllowedEnvironment,
  checkRequiredKeys,
  getAccessToken,
  getProxygenURL,
  getRealmURL,
  Proxygen,
  proxygenErrorHandler
} from "./helpers"
import middy from "@middy/core"
import axios from "axios"
import {iOLogger} from "./middleware"

const logger = new Logger({serviceName: "proxygenInstanceDelete"})

const lambdaHandler = async (event: Proxygen) => {

  checkRequiredKeys(event, ["environment", "instance"])
  checkAllowedEnvironment(event.environment)

  const accessToken = await getAccessToken(event, getRealmURL(event))
  //eslint-disable-next-line max-len
  const path = `${getProxygenURL(event)}/apis/${event.apiName}/environments/${event.environment}/instances/${event.instance}`
  try {
    const response = await axios.delete(path, {
      headers: {"content-type": "application/json", Authorization: `Bearer ${accessToken}`}
    })
    return response.data
  } catch (error: unknown) {
    proxygenErrorHandler(error, logger)
  }
}

export const handler = middy(lambdaHandler)
  .use(injectLambdaContext(logger, {clearState: true}))
  .use(iOLogger(logger))
