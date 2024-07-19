import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import {checkAllowedEnvironment, getAccessToken} from "./helpers"
import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"
import axios from "axios"

const logger = new Logger({serviceName: "proxygenInstanceDelete"})

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const lambdaHandler = async (event: any) => {
  try {
    const apiName = event.apiName
    const environment = event.environment
    const instance = event.instance
    const kid = event.kid

    checkAllowedEnvironment(environment)

    const accessTokenResponse = await getAccessToken(kid, apiName)
    const accessToken = accessTokenResponse.access_token
    const path = `https://proxygen.prod.api.platform.nhs.uk/apis/${apiName}/environments/${environment}/instances/${instance}`
    const response = await axios.delete(path, {
      headers: {"content-type": "application/json", Authorization: `Bearer ${accessToken}`}
    })
    return response.data
  } catch (error) {
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
