import {Logger} from "@aws-lambda-powertools/logger"
import {SNSEvent, SNSHandler, SNSEventRecord} from "aws-lambda"
import {
  formatHeader,
  formatTrigger,
  formatState,
  formatMoreInfoUrl
} from "./contentFormatting"
import {populateCloudWatchAlertMessageContent} from "./slackMessageTemplates"
import {getSecrets} from "./secrets"
import {CloudWatchAlarm, CloudWatchAlertContentValues, CloudWatchAlertMessageContent} from "./types"

const ENV: string = process.env.ENV || "not-set"

const logger: Logger = new Logger({serviceName: "slackAlerter"})

export const handler: SNSHandler = async(event: SNSEvent): Promise<void> => {
  logger.info("Received SNS message...")

  const totalRecords: number = event.Records.length
  logger.info(`${totalRecords} record(s) to process...`)
  for (const [index, record] of event.Records.entries()){
    logger.info(`Processing record...`, {recordNo: index, totalRecords: totalRecords})
    await processRecord(record)
    logger.info(`Processing complete.`, {recordNo: index, totalRecords: totalRecords})
  }
  logger.info("Processing SNS message complete.")
}

const processRecord = async (record: SNSEventRecord): Promise<void> => {
  let cloudWatchAlarm: CloudWatchAlarm
  try {
    cloudWatchAlarm = JSON.parse(record.Sns.Message)
  } catch (err) {
    logger.info("Invalid JSON in SNS Message", {error: err})
    throw err
  }

  logger.info("Generating slack message content for alert...")
  const slackMessageContent = generateSlackMessageContent(cloudWatchAlarm)

  logger.info("Posting slack message...")
  await postSlackMessage(slackMessageContent)
  logger.info("Message successfully posted.")
}

const generateSlackMessageContent = (cloudWatchMessage: CloudWatchAlarm): CloudWatchAlertMessageContent => {
  let stack, alarmName
  if (cloudWatchMessage.AlarmName.includes(" - ")){
    const parts = cloudWatchMessage.AlarmName.split("-")
    stack = parts[0].trim()
    alarmName = parts[1].trim()
  } else {
    stack = "unknown"
    alarmName = cloudWatchMessage.AlarmName
  }
  
  const header: string = formatHeader(alarmName, cloudWatchMessage.NewStateValue)
  const region: string = cloudWatchMessage.AlarmArn.split(":")[3]
  const trigger: string = formatTrigger(cloudWatchMessage.Trigger)
  const oldState: string = formatState(cloudWatchMessage.OldStateValue)
  const newState: string = formatState(cloudWatchMessage.NewStateValue)
  const moreInfoUrl: string = formatMoreInfoUrl(region, cloudWatchMessage.AlarmName)

  const contentValues: CloudWatchAlertContentValues = {
    header: header,
    timestamp: cloudWatchMessage.StateChangeTime,
    stack: stack,
    environment: ENV,
    region: region,
    description: cloudWatchMessage.AlarmDescription || "No description",
    reason: cloudWatchMessage.NewStateReason,
    trigger: trigger,
    oldState: oldState,
    newState: newState,
    moreInfoUrl: moreInfoUrl
  }

  logger.info("Populating content for CloudWatch Alert message...")
  const slackMessageContent: CloudWatchAlertMessageContent = populateCloudWatchAlertMessageContent(contentValues)
  return slackMessageContent
}

const postSlackMessage = async (slackMessageContent: CloudWatchAlertMessageContent): Promise<void> => {
  const options: RequestInit = {
    method: "POST",
    body: JSON.stringify(slackMessageContent),
    headers: {
      "Content-Type": "application/json"
    }
  }

  logger.info("Getting slack web hook url...")
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
