import {Logger} from "@aws-lambda-powertools/logger"
import {getSecrets} from "./secrets"
import {CloudWatchAlertMessageContent} from "./types"

const postSlackMessage = async (
  slackMessageContent: CloudWatchAlertMessageContent | string, logger: Logger): Promise<void> => {
  // eslint-disable-next-line no-undef
  const options: RequestInit = {
    method: "POST",
    body: typeof slackMessageContent === "string"
      ? slackMessageContent
      : JSON.stringify(slackMessageContent),
    headers: {
      "Content-Type": "application/json"
    }
  }

  logger.info("Getting slack web hook url...")
  // Gets the appropriate webhook to post into the prod or non-prod alert channels in slack.
  // Whilst signed into the NHSE slack you can find the values under the "Incoming Webhooks"
  // section of the eps-alerts app configuration.
  const secrets = await getSecrets(["account-resources-SlackWebhookUrl"], "secretsManager")
  const url = secrets["account-resources-SlackWebhookUrl"]

  logger.info("Sending request to slack webhook url...")
  try {
    const response: Response = await fetch(url, options)
    if (!response.ok) {
      logger.error("Error response received from slack", {statusCode: response.status, res: response.body})
      throw new Error("Error response received from slack")
    }
  } catch (err) {
    logger.error("Failed to post message to slack", {error: err})
    throw err
  }
}

export {postSlackMessage}
