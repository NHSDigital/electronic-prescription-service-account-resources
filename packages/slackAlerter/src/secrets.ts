// Uses AWS Parameters & Secrets Lambda Extension: 
// https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html
// https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets_lambda.html
import { LambdaSecrets, SecretsStore, ParameterStoreParameter, SecretsManagerSecret } from "./types"

const AWS_SESSION_TOKEN: string  = process.env.AWS_SESSION_TOKEN || ""
const EXTENSION_HTTP_PORT: string = process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT || ""

export const getSecrets = async (secretNames: string[], secretsStore: SecretsStore): Promise<LambdaSecrets> => {
    checkSecretsExtensionConfig()
    
    let secrets: LambdaSecrets = {}

    for (const secretName of secretNames) {
        const secretValue: string = await getSecret(secretName, secretsStore)
        secrets[secretName] = secretValue
    }

    return secrets
}

const checkSecretsExtensionConfig = (): void => {
    if (!AWS_SESSION_TOKEN){
        throw new Error("AWS_SESSION_TOKEN not set")
    }

    if (!EXTENSION_HTTP_PORT){
        throw new Error("EXTENSION_HTTP_PORT not set")
    }
}

const getSecret = async (secretName: string, secretsStore: SecretsStore): Promise<string> => {
    
    const encodedSecretName = encodeURIComponent(secretName)
    
    let secretValue:string
    if (secretsStore == "parameterStore"){
        const secretData = await get(`/systemsmanager/parameters/get?name=${encodedSecretName}&withDecryption=true`) as ParameterStoreParameter
        secretValue = secretData.Parameter.Value
    } else if (secretsStore == "secretsManager") {
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
            throw new Error("Failed to retrieve secret")
        }
    } catch (err) {
        throw err
    }

    const data: Promise<ParameterStoreParameter | SecretsManagerSecret> = await response.json()
    return data
}
