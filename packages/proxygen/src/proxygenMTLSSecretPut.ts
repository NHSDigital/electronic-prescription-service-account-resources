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
import {getSecret} from "./signingHelpers"

const logger = new Logger({serviceName: "proxygenMTLSSecretPut"})

const lambdaHandler = async (event: Proxygen) => {
  checkRequiredKeys(event, ["environment", "secretName"])

  checkAllowedEnvironment(event.environment)

  const formData = new FormData()
  if (event.secretCert && event.secretKey) {
    formData.append("cert", new Blob([event.secretCert as string]))
    formData.append("key", new Blob([event.secretKey as string]))
  } else if (event.secretCertName && event.secretKeyName) {
    const cert = await getSecret(event.secretCertName)
    const key = await getSecret(event.secretKeyName)
    formData.append("cert", new Blob([cert]))
    formData.append("key", new Blob([key]))
  } else {
    throw new Error("Either secretCert and secretKey or secretCertName and secretKeyName must be provided")
  }

  const accessToken = await getAccessToken(event, getRealmURL(event.environment))

  //eslint-disable-next-line max-len
  const path = `${getProxygenURL(event.environment)}/apis/${event.apiName}/environments/${event.environment}/secrets/mtls/${event.secretName}`
  try {
    const response = await axios.putForm(path, formData, {
      headers: {Authorization: `Bearer ${accessToken}`}
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
