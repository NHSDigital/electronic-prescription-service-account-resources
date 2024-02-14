import {SecretsManagerClient, BatchGetSecretValueCommand} from "@aws-sdk/client-secrets-manager"
import {Logger, injectLambdaContext} from "@aws-lambda-powertools/logger"
import {checkCertificateExpiry} from "./helpers"
import {Secret} from "./helpers"
import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"

const secretsClient = new SecretsManagerClient({})

const logger = new Logger({serviceName: "certificateChecker"})
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCertificates = async (secretARNs: any): Promise<void> => {
  try {
    const batchGetSecretValueCommand = new BatchGetSecretValueCommand({
      SecretIdList: secretARNs
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

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const lambdaHandler = async (event: any) => {
  try {
    logger.info("Lambda execution started.")
    const secretARNs = event.secretARNs
    await getCertificates(secretARNs)

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
