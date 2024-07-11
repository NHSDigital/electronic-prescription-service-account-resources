import { Logger } from "@aws-lambda-powertools/logger"
import { SNSEvent, Context, SNSHandler, SNSEventRecord } from "aws-lambda"
import { formatHeader, formatTrigger,  formatState, formatMoreInfoUrl } from "./contentFormatting"
import { populateCloudWatchAlertMessageContent } from "./slackMessageTemplates"
import { CloudWatchMessage, CloudWatchAlertContentValues, CloudWatchAlertMessageContent } from "./types"

const ENV: string = process.env.ENV || "not-set"
let SLACK_WEBHOOK_URL: string

const logger = new Logger({serviceName: "slackAlerter"})

export const handler: SNSHandler = async(event: SNSEvent, context: Context): Promise<void> => {
    // log start up
    // log received message
    SLACK_WEBHOOK_URL = "" // go get secret
    for (const record of event.Records){
        await processMessage(record)
    }
    // log complete
}

const processMessage = async (record: SNSEventRecord): Promise<void> => {
    // log processing message
    let cloudWatchMessage: CloudWatchMessage
    try {
        cloudWatchMessage = JSON.parse(record.Sns.Message)
    } catch (err) {
        // log error
        throw err
    }
    // log generating message
    const slackMessageContent = generateSlackMessageContent(cloudWatchMessage)

    // log sending message
    await postSlackMessage(slackMessageContent)
    //log complete
}

const generateSlackMessageContent = (cloudWatchMessage: CloudWatchMessage): CloudWatchAlertMessageContent => {
    const header: string = formatHeader(cloudWatchMessage.AlarmArn, cloudWatchMessage.NewStateValue)
    const region: string = cloudWatchMessage.AlarmArn.split(":")[3]
    const trigger: string = formatTrigger(cloudWatchMessage.Trigger)
    const oldState: string = formatState(cloudWatchMessage.OldStateValue)
    const newState: string = formatState(cloudWatchMessage.NewStateValue)
    const moreInfoUrl: string = formatMoreInfoUrl(region, cloudWatchMessage.AlarmName)
    
    const contentValues: CloudWatchAlertContentValues = {
        header: header,
        timestamp: cloudWatchMessage.StateChangeTime,
        stack: cloudWatchMessage.AlarmName.split("-")[0].trim(),
        environment: ENV,
        region: region,
        description: cloudWatchMessage.AlarmDescription || "No description",
        reason: cloudWatchMessage.NewStateReason,
        trigger: trigger,
        oldState: oldState,
        newState: newState,
        moreInfoUrl: moreInfoUrl
    }

    const slackMessageContent: CloudWatchAlertMessageContent = populateCloudWatchAlertMessageContent(contentValues)
    return slackMessageContent
}

const postSlackMessage = async (slackMessageContent: CloudWatchAlertMessageContent): Promise<void> => {
    const headers = new Headers()
    headers.append("Content-Type", "application/json")
    
    const options: RequestInit = {
        method: "POST",
        body: JSON.stringify(slackMessageContent),
        headers: headers
    }

    try {
        // log posting message
        const response: Response = await fetch(SLACK_WEBHOOK_URL, options)
        if (!response.ok) {
            // log response
            throw new Error("some message")
        }
    } catch (err) {
        //log error
        throw err
    }
    // log ok
}
