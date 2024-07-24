import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import {
  checkAllowedEnvironment,
  checkRequiredKeys,
  getAccessToken,
  getRealmURL,
  Proxygen
} from "./helpers"
import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"
import axios from "axios"

const logger = new Logger({serviceName: "proxygenMTLSSecretPut"})

const lambdaHandler = async (event: Proxygen) => {
  checkRequiredKeys(event, ["environment", "secretName", "secretKey", "secretCert"])

  checkAllowedEnvironment(event.environment)

  const accessToken = await getAccessToken(event, getRealmURL())

  const body = {
    key: event.secretKey,
    cert: event.secretCert
  }

  //eslint-disable-next-line max-len
  const path = `https://proxygen.prod.api.platform.nhs.uk/apis/${event.apiName}/environments/${event.environment}/secrets/mtls/${event.secretName}`
  const response = await axios.put(path, body, {
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
