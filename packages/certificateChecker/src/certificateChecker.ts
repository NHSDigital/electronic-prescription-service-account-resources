import {SecretsManagerClient, ListSecretsCommand, BatchGetSecretValueCommand} from "@aws-sdk/client-secrets-manager"
import {Logger, injectLambdaContext} from "@aws-lambda-powertools/logger"
import {checkCertificateExpiry} from "./helpers"
import {Secret} from "./helpers"
import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"

const secretsClient = new SecretsManagerClient({})

const logger = new Logger({serviceName: "splunkProcessor"})

const getCertificates = async (): Promise<void> => {
  try {
    const listSecretsCommand = new ListSecretsCommand({})
    const listSecretsResponse = await secretsClient.send(listSecretsCommand)

    const secretList = listSecretsResponse.SecretList || []

    if (secretList.length === 0) {
      logger.info("No 'cert' secrets found.")
      return
    }

    const secretIds = secretList.map(secret => secret && secret.ARN).filter(Boolean) as string[]

    const batchGetSecretValueCommand = new BatchGetSecretValueCommand({
      SecretIdList: secretIds
    })

    const batchGetSecretValueResponse = await secretsClient.send(batchGetSecretValueCommand)

    if (batchGetSecretValueResponse.SecretValues) {
      for (const secretValue of batchGetSecretValueResponse.SecretValues) {
        try {
          if (secretValue.SecretString) {
            const secret: Secret = {
              ARN: secretValue.ARN || "",
              CreatedDate: secretValue.CreatedDate ? new Date(secretValue.CreatedDate) : undefined,
              Name: secretValue.Name || "",
              SecretString: secretValue.SecretString,
              VersionId: secretValue.VersionId || "",
              VersionStages: secretValue.VersionStages || []
            }

            checkCertificateExpiry(secret, logger)
          }
        } catch (error) {
          logger.error(`Error processing secret ${secretValue.Name}: ${error}`)
        }
      }
    }
  } catch (error) {
    logger.error(`Error in getCertificates: ${error}`)
    throw error
  }
}

const lambdaHandler = async () => {
  try {
    logger.info("Lambda execution started.")

    await getCertificates()

    logger.info("Lambda execution completed.")
  } catch (error) {
    logger.error("Lambda execution failed:", {error})
    throw error
  }
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
