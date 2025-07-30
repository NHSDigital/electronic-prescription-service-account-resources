import {Logger} from "@aws-lambda-powertools/logger"
import {injectLambdaContext} from "@aws-lambda-powertools/logger/middleware"
import { CloudFormationClient, DescribeStackResourceDriftsCommand } from "@aws-sdk/client-cloudformation"
import middy from "@middy/core"
import inputOutputLogger from "@middy/input-output-logger"

const logger = new Logger({serviceName: "driftDetector"})
const cloudFormationClient = new CloudFormationClient()

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const lambdaHandler = async (event: any) => {
  try {
    const details = {
      awsAccountId: event.detail?.awsAccountId,
      awsRegion: event.detail?.awsRegion,
      complianceType: event.detail?.newEvaluationResult?.complianceType,
      resourceId: event.detail?.resourceId
    }
    if (details.complianceType === "COMPLIANT") {
      logger.info("No stack drift detected", {details})
    } else {
      logger.error("Stack drift detected", {details})
      const driftDetailsResponse = await cloudFormationClient.send(
        new DescribeStackResourceDriftsCommand({
          StackName: details.resourceId,
          StackResourceDriftStatusFilters: ["MODIFIED", "DELETED", "NOT_CHECKED", "IN_SYNC"]
        })
      )
      logger.error("Drift details", {
        drifts: driftDetailsResponse.StackResourceDrifts
      })
      for (const drift of driftDetailsResponse.StackResourceDrifts || []) {
        logger.error("Drift resource details", {
          resource: drift.LogicalResourceId,
          status: drift.StackResourceDriftStatus
        })
      }
    }
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
