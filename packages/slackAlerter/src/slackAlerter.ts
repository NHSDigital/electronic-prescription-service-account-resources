import {Logger} from "@aws-lambda-powertools/logger"
import {
  SQSEvent,
  SQSHandler,
  SQSRecord,
  SQSBatchResponse,
  SQSBatchItemFailure
} from "aws-lambda"
import {
  formatHeader,
  formatTrigger,
  formatState,
  formatMoreInfoUrl
} from "./contentFormatting"
import {populateCloudWatchAlertMessageContent} from "./slackMessageTemplates"
import {getSecrets} from "./secrets"
import {CloudWatchAlarm, CloudWatchAlertContentValues, CloudWatchAlertMessageContent} from "./types"
import {postSlackMessage} from "./helpers"

const ENV: string = process.env.ENV || "not-set"

const logger: Logger = new Logger({serviceName: "slackAlerter"})

export const handler: SQSHandler = async(event: SQSEvent, context): Promise<SQSBatchResponse> => {
  logger.addContext(context)
  logger.resetKeys()
  logger.info("Received SQS message...")
  const batchItemFailures: Array<SQSBatchItemFailure> = []

  const totalRecords: number = event.Records.length
  logger.info(`${totalRecords} record(s) to process...`)
  for (const [index, record] of event.Records.entries()){
    logger.info("Processing record...", {recordNo: index, totalRecords: totalRecords})
    try{
      await processRecord(record)
    } catch (error) {
      logger.info(
        "Error processing record, returning as failed",
        {recordNo: index, totalRecords: totalRecords, error: error}
      )
      batchItemFailures.push({itemIdentifier: record.messageId})
    }
    logger.info("Processing complete.", {recordNo: index, totalRecords: totalRecords})
  }
  logger.info("Processing SQS message complete.")

  return {batchItemFailures}
}

const processRecord = async (record: SQSRecord): Promise<void> => {
  let cloudWatchAlarm: CloudWatchAlarm
  try {
    cloudWatchAlarm = JSON.parse(record.body)
  } catch (err) {
    logger.info("Invalid JSON in SNS Message", {error: err})
    throw err
  }

  logger.info("Generating slack message content for alert...")
  const {slackMessageContent, alarmName, stack} = generateSlackMessageContent(cloudWatchAlarm)
  let suppressions: Array<{alarmName: string, stack: string, jiraReference: string}> = []
  try {
    const secrets = await getSecrets(["monitoring-alertSuppressions"], "parameterStore")
    const parameter = secrets["monitoring-alertSuppressions"]
    if (parameter) {
      suppressions = JSON.parse(parameter) as Array<{alarmName: string, stack: string, "jiraReference": string}>
    }
  } catch (error) {
    logger.info("Error retrieving or parsing suppressions, proceeding to post Slack message.", {error})
  }
  logger.debug("Current suppressions:", {suppressions: suppressions, alarmName: alarmName, stack: stack})
  const isSuppressed = suppressions.some(
    (s) => s.alarmName === alarmName && s.stack === stack
  )
  if (isSuppressed) {
    logger.info("Alert is suppressed, not posting to slack.", {alarmName: alarmName, stack: stack})
  } else {
    logger.info("Posting slack message...")
    await postSlackMessage(slackMessageContent, logger)
    logger.info("Message successfully posted.")
  }
}

const generateSlackMessageContent = (cloudWatchMessage: CloudWatchAlarm):
  {slackMessageContent: CloudWatchAlertMessageContent, alarmName: string, stack: string} => {
  // To fully populate the message, alarm names should be in the format "<StackName>_<ResourceName>_<Metric>"
  // e.g. "psu-pr-123_TestLambda_Errors".
  let stack, alarmName
  let level = cloudWatchMessage.NewStateValue
  if (cloudWatchMessage.AlarmName.includes("_")){
    const parts = cloudWatchMessage.AlarmName.split("_")
    if (parts.length === 3) {
      stack = parts[0]
      alarmName = `${parts[1]} ${parts[2]}`
    } else if (parts.length === 4) {
      stack = parts[0]
      alarmName = `${parts[1]} ${parts[2]}`
      level = parts[3]
    } else {
      stack = "unknown"
      alarmName = cloudWatchMessage.AlarmName
    }
  } else {
    stack = "unknown"
    alarmName = cloudWatchMessage.AlarmName
  }

  const header: string = formatHeader(alarmName, cloudWatchMessage.NewStateValue, level)
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
  return {slackMessageContent, alarmName, stack}
}
