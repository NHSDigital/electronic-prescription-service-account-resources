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
import {getSecret} from "./signingHelpers"
import {iOLogger} from "./middleware"

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

  const accessToken = await getAccessToken(event, getRealmURL(event))

  //eslint-disable-next-line max-len
  const path = `${getProxygenURL(event)}/apis/${event.apiName}/environments/${event.environment}/secrets/mtls/${event.secretName}`
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
  .use(iOLogger(logger))
