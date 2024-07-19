import {SecretsManagerClient, GetSecretValueCommand} from "@aws-sdk/client-secrets-manager"
import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import {getAccessToken} from "./helpers"
import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"
import axios from "axios"
import {Secret} from "jsonwebtoken"

const secretsClient = new SecretsManagerClient({})

const logger = new Logger({serviceName: "certificateChecker"})

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const lambdaHandler = async (event: any) => {
  try {
    const apiName = event.apiName
    const environment = event.environment
    const specDefinition = event.specDefinition
    const instance = event.instance

    const input = {
      SecretId: "account-resources-PSU-ProxygenPrivateKey"
    }
    const getSecretCommand = new GetSecretValueCommand(input)

    const secretResponse = await secretsClient.send(getSecretCommand)
    const privateKey = secretResponse.SecretString
    const accessTokenResponse = await getAccessToken(privateKey as Secret)
    const accessToken = accessTokenResponse.access_token
    const path = `https://proxygen.prod.api.platform.nhs.uk/apis/${apiName}/environments/${environment}/instances/${instance}`
    const response = await axios.put(path, specDefinition, {
      headers: {"content-type": "application/json", Authorization: `Bearer: ${accessToken}`}
    })
    return response.data
  } catch (error) {
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
