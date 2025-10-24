import axios from "axios"
import {createSignedJWT, getSecret} from "./signingHelpers"
import {Logger} from "@aws-lambda-powertools/logger"

export function getRealmURL() {
  return "https://identity.ptlrestored.api.platform.nhs.uk/realms/api-producers"
}

export async function getAccessToken(event: Proxygen, realm_url: string) {
  const privateKey = await getSecret(event.proxygenSecretName)
  const signedJWT = createSignedJWT(privateKey, event.kid, event.apiName, realm_url)
  const payload = {
    grant_type: "client_credentials",
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: signedJWT
  }
  const auth_url = `${realm_url}/protocol/openid-connect/token`
  const response = await axios.post(auth_url, payload, {headers: {"content-type": "application/x-www-form-urlencoded"}})
  return response.data.access_token
}

export function checkAllowedEnvironment(environment: string | undefined) {
  const ALLOWED_ENVIRONMENTS = process.env["ALLOWED_ENVIRONMENTS"]?.split(",")

  if (environment === undefined) {
    throw new Error("environment is invalid")
  }
  if (ALLOWED_ENVIRONMENTS?.includes(environment)) {
    return
  }
  throw new Error(`environment ${environment} is invalid. Allowed environments: ${ALLOWED_ENVIRONMENTS}`)
}

export function checkRequiredKeys(obj: Proxygen, requiredKeys: Array<string>) {
  const completeRequiredKeys = ["apiName", "proxygenSecretName", "kid"].concat(requiredKeys)
  const checkAllKeys = completeRequiredKeys.every((i) => Object.prototype.hasOwnProperty.call(obj, i))

  if (checkAllKeys) {
    return
  }

  throw new Error(`Input is one of missing required keys: ${completeRequiredKeys}. Input keys: ${Object.keys(obj)}`)
}

export function proxygenErrorHandler(error: unknown, logger: Logger) {
  if (axios.isAxiosError(error)) {
    const axiosError = {
      code: error.code,
      status: error.status,
      stack: error.stack,
      message: error.message,
      config: {
        data: (error.config?.data ?? "").toString().slice(0, 255), // limit to first 255 chars as it may be full spec
        headers: error.config?.headers,
        method: error.config?.method,
        url: error.config?.url
      },
      request: {
        headers: error.request?.headers,
        method: error.request.method,
        path: error.request.path
      },
      response: {
        data: error.response?.data,
        headers: error.response?.headers,
        status: error.response?.status,
        statusText: error.response?.statusText
      }
    }
    if (error.response) {
      // handle a non 2xx response
      logger.error("Error in response to call to proxygen", {axiosError})
    } else if (error.request) {
      // handle errors where no response received
      logger.error("Error in request to call to proxygen", {axiosError})
    } else {
      // handle errors setting up the request
      logger.error("General axios error in request to proxygen", {axiosError})
    }
    // throw an error so lambda exits
    throw (new Error(
      `Axios error. Status code: ${error.response?.status}. Response body: ${JSON.stringify(error.response?.data)}`
    ))
  } else {
    if (error instanceof Error) {
      // its a non axios error, so make sure it is logged nicely
      logger.error("General error in request to proxygen", {
        stack: error.stack,
        errorMessage: error.message
      })
      throw (new Error("General error"))
    }
    // we should never reach here (as it should be AxiosError or Error) but leaving it in just in case
    throw (error)
  }
}

export interface Proxygen {
  apiName: string
  proxygenSecretName: string
  environment?: string
  specDefinition?: object
  kid: string
  instance?: string
  secretName?: string
  secretKey?: string
  secretCert?: string
}
