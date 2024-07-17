// Uses AWS Parameters & Secrets Lambda Extension:
// https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html
// https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets_lambda.html
import {Logger} from "@aws-lambda-powertools/logger"
import {
  LambdaSecrets,
  SecretsStore,
  ParameterStoreParameter,
  SecretsManagerSecret
} from "./types"

const logger: Logger = new Logger({serviceName: "slackAlerter"})

let AWS_SESSION_TOKEN: string
let EXTENSION_HTTP_PORT: string

export const getSecrets = async (secretNames: string[], secretsStore: SecretsStore): Promise<LambdaSecrets> => {
  checkSecretsExtensionConfig()

  const secrets: LambdaSecrets = {}

  for (const secretName of secretNames) {
    const secretValue: string = await getSecret(secretName, secretsStore)
    secrets[secretName] = secretValue
  }

  return secrets
}

const checkSecretsExtensionConfig = (): void => {
  AWS_SESSION_TOKEN = process.env.AWS_SESSION_TOKEN as string
  if (!AWS_SESSION_TOKEN){
    throw new Error("AWS_SESSION_TOKEN not set")
  }

  EXTENSION_HTTP_PORT = process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT as string
  if (!EXTENSION_HTTP_PORT){
    throw new Error("EXTENSION_HTTP_PORT not set")
  }
}

const getSecret = async (secretName: string, secretsStore: SecretsStore): Promise<string> => {

  const encodedSecretName = encodeURIComponent(secretName)

  let secretValue:string
  if (secretsStore === "parameterStore"){
    const secretData = await get(
      `/systemsmanager/parameters/get?name=${encodedSecretName}&withDecryption=true`) as ParameterStoreParameter
    secretValue = secretData.Parameter.Value
  } else if (secretsStore === "secretsManager") {
    const secretData = await get(`/secretsmanager/get?secretId=${encodedSecretName}`) as SecretsManagerSecret
    secretValue = secretData.SecretString
  } else {
    throw new Error("Invalid secrets store")
  }

  return secretValue
}

const get = async(secretUrl: string): Promise<ParameterStoreParameter | SecretsManagerSecret> => {
  const options: RequestInit = {
    method: "GET",
    headers: {
      "X-Aws-Parameters-Secrets-Token": AWS_SESSION_TOKEN
    }
  }

  const url = `http://localhost:${EXTENSION_HTTP_PORT}${secretUrl}`

  let response: Response
  try {
    response = await fetch(url, options)
    if (!response.ok) {
      throw new Error("Error response received from secrets extension")
    }
  } catch (err) {
    logger.error("Failed to request secrets from extension", {error: err})
    throw err
  }

  const data: Promise<ParameterStoreParameter | SecretsManagerSecret> = await response.json()
  return data
}
