import axios from "axios"
import {createSignedJWT, getSecret} from "./signingHelpers"
import {Logger} from "@aws-lambda-powertools/logger"

export function getRealmURL() {
  return "https://identity.prod.api.platform.nhs.uk/realms/api-producers"
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
    if (error.response) {
      logger.error("Error in response to call to proxygen", {
        response: {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        },
        request: {
          method: error.request.method,
          path: error.request.path,
          headers: error.request.headers,
          body: error.config?.data
        },
        stack: error.stack,
        errorMessage: error.message
      })
    } else if (error.request) {
      logger.error("Error in request to call to proxygen", {
        request: {
          method: error.request.method,
          path: error.request.path,
          headers: error.request.headers,
          body: error.request.body
        },
        stack: error.stack,
        errorMessage: error.message
      })
    } else {
      logger.error("General axios error in request to proxygen", {
        stack: error.stack,
        errorMessage: error.message
      })
    }
    throw (new Error("Axios error"))
  } else {
    if (error instanceof Error) {
      logger.error("General error in request to proxygen", {
        stack: error.stack,
        errorMessage: error.message
      })
      throw (new Error("General error"))
    }
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
