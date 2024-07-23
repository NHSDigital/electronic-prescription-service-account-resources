import axios from "axios"
import {createSignedJWT, getSecret} from "./signingHelpers"

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

export interface Proxygen {
  apiName: string
  proxygenSecretName: string
  environment?: string
  specDefinition?: string
  kid: string
  instance?: string
  secretName?: string
  secretValue?: string
}
