import jwt, {Secret} from "jsonwebtoken"
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager"
import {returnUuid} from "./uuidHelper"
const secretsClient = new SecretsManagerClient({})

export function createSignedJWT(privateKey: Secret, kid: string, apiName: string, realm_url: string) {
  const header = {
    typ: "JWT",
    alg: "RS512",
    kid: kid
  }
  const jti_value = returnUuid()

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

export async function getSecret(proxygenSecretName: string): Promise<jwt.Secret> {
  const input = {
    SecretId: proxygenSecretName
  }
  const getSecretCommand = new GetSecretValueCommand(input)

  const secretResponse = await secretsClient.send(getSecretCommand)
  const privateKey = secretResponse.SecretString
  return privateKey as Secret
}
