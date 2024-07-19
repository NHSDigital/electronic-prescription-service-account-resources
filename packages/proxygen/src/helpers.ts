import jwt, {Secret} from "jsonwebtoken"
import {v4 as uuidv4} from "uuid"
import axios from "axios"
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager"

const realm_url = "https://identity.prod.api.platform.nhs.uk/realms/api-producers"
const secretsClient = new SecretsManagerClient({})
const ALLOWED_ENVIRONMENTS = process.env["ALLOWED_ENVIRONMENTS"]?.split(",")

function createSignedJWT(privateKey: Secret, kid: string, apiName: string) {
  const header = {
    typ: "JWT",
    alg: "RS512",
    kid: kid
  }
  const jti_value = uuidv4()

  const currentTimestamp = Math.floor(Date.now() / 1000)
  const data = {
    sub: `${apiName}-client`,
    iss: `${apiName}-client`,
    jti: jti_value,
    aud: realm_url,
    exp: currentTimestamp + 180 // expiry time is 180 seconds from time of creation
  }

  const signedJWT = jwt.sign(JSON.stringify(data), privateKey, {algorithm: "RS512", header: header})
  return signedJWT
}

async function getSecret(apiName: string): Promise<jwt.Secret> {
  let secretName

  switch (apiName) {
    case "prescription-status-update-api":
      secretName = "account-resources-PSU-ProxygenPrivateKey"
      break
    case "custom-prescription-status-update-api":
      secretName = "account-resources-CPSU-ProxygenPrivateKey"
      break
  }

  const input = {
    SecretId: secretName
  }
  const getSecretCommand = new GetSecretValueCommand(input)

  const secretResponse = await secretsClient.send(getSecretCommand)
  const privateKey = secretResponse.SecretString
  return privateKey as Secret
}

export async function getAccessToken(kid: string, apiName: string) {
  const privateKey = await getSecret(apiName)
  const signedJWT = createSignedJWT(privateKey, kid, apiName)
  const payload = {
    grant_type: "client_credentials",
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: signedJWT
  }
  const auth_url = `${realm_url}/protocol/openid-connect/token`
  const response = await axios.post(auth_url, payload, {headers: {"content-type": "application/x-www-form-urlencoded"}})
  return response.data
}

export function checkAllowedEnvironment(environment: string) {
  if (ALLOWED_ENVIRONMENTS?.includes(environment)) {
    return
  }
  throw new Error("environment is invalid")
}
