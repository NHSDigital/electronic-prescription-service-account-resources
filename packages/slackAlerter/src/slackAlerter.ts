import { Logger } from "@aws-lambda-powertools/logger"
import { SNSEvent, Context, SNSHandler, SNSEventRecord } from "aws-lambda"
import { formatPeriod } from "./contentFormatting"
import { CloudWatchMessage } from "./types"

const logger = new Logger({serviceName: "slackAlerter"})

export const handler: SNSHandler = async(event: SNSEvent, context: Context): Promise<void> => {
    // log start up
    // log received message
    for (const record of event.Records){
        await processMessage(record)
    }
}

const processMessage= async (record: SNSEventRecord): Promise<any> => {
    // log processing message
    let cloudWatchMessage: CloudWatchMessage
    try {
        cloudWatchMessage = JSON.parse(record.Sns.Message)
    } catch (err) {
        // log error
        throw err
    }
    // log generating message
    const slackMessageContent = generateSlackAlertContent(cloudWatchMessage)

    // log sending message
    // send slack message

    // handle response
    // log response
}

const generateSlackAlertContent = (cloudWatchMessage: CloudWatchMessage) => {
    const region = cloudWatchMessage.AlarmArn.split(":")[3]
    const period = formatPeriod(cloudWatchMessage.Trigger.Period)
    const trigger = `${cloudWatchMessage.Trigger.Statistic} ${cloudWatchMessage.Trigger.MetricName} ${cloudWatchMessage.Trigger.ComparisonOperator} ${cloudWatchMessage.Trigger.Threshold} for ${cloudWatchMessage.Trigger.EvaluationPeriods} period(s) of `
    
    let messageValues = {
        alarmName: cloudWatchMessage.AlarmName,
        environment: "",
        region: region,
        description: cloudWatchMessage.AlarmDescription,
        reason: cloudWatchMessage.NewStateReason,
    }

    // need header - AlarmName > needs NewStateValue for emoji
    // need env & region > env from env var, region could be from env var but safer to 
    // need description - AlarmDescription
    // Reason - NewStateReason
    // Trigger > built up from Statistic, MetricName, ComparisonOperator, Threshold, EvaluationPeriods,Period
    // old state - OldStateValue
    // new state - NewStateValue
    // button > built up from region & alarm name
}
