import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import {checkAllowedEnvironment, getAccessToken, Proxygen} from "./helpers"
import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"
import axios from "axios"

const logger = new Logger({serviceName: "proxygenInstanceGet"})

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const lambdaHandler = async (event: Proxygen) => {
  checkAllowedEnvironment(event.environment)

  const accessToken = await getAccessToken(event)

  //eslint-disable-next-line max-len
  const path = `https://proxygen.prod.api.platform.nhs.uk/apis/${event.apiName}/environments/${event.environment}/instances`
  const response = await axios.get(path, {
    headers: {"content-type": "application/json", Authorization: `Bearer ${accessToken}`}
  })
  return response.data
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
