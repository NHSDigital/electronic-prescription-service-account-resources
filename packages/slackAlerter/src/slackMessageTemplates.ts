import { CloudWatchAlertContentValues, CloudWatchAlertMessageContent } from "./types"

export const populateCloudWatchAlertMessageContent = (contentValues: CloudWatchAlertContentValues): CloudWatchAlertMessageContent => {
    return {
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": contentValues.header,
                    "emoji": true
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": "*Timestamp*"
                    },
                    {
                        "type": "mrkdwn",
                        "text": "*Stack*"
                    },
                    {
                        "type": "plain_text",
                        "text": contentValues.timestamp,
                        "emoji": true
                    },
                    {
                        "type": "plain_text",
                        "text": contentValues.stack,
                        "emoji": true
                    }
                ]
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": "*Environment*"
                    },
                    {
                        "type": "mrkdwn",
                        "text": "*Region*"
                    },
                    {
                        "type": "plain_text",
                        "text": contentValues.environment,
                        "emoji": true
                    },
                    {
                        "type": "plain_text",
                        "text": contentValues.region,
                        "emoji": true
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
                "type": "rich_text",
                "elements": [
                    {
                        "type": "rich_text_section",
                        "elements": [
                            {
                                "type": "text",
                                "text": "Description: ",
                                "style": {
                                    "bold": true
                                }
                            },
                            {
                                "type": "text",
                                "text": `${contentValues.description}\n\n`
                            },
                            {
                                "type": "text",
                                "text": "Reason: ",
                                "style": {
                                    "bold": true
                                }
                            },
                            {
                                "type": "text",
                                "text": `${contentValues.reason}\n\n`
                            },
                            {
                                "type": "text",
                                "text": "Trigger: ",
                                "style": {
                                    "bold": true
                                }
                            },
                            {
                                "type": "text",
                                "text": contentValues.trigger
                            }
                        ]
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": "*Old State*"
                    },
                    {
                        "type": "mrkdwn",
                        "text": "*Current State*"
                    },
                    {
                        "type": "plain_text",
                        "text": contentValues.oldState,
                        "emoji": true
                    },
                    {
                        "type": "plain_text",
                        "text": contentValues.newState,
                        "emoji": true
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "More info",
                            "emoji": true
                        },
                        "style": "primary",
                        "url": contentValues.moreInfoUrl
                    }
                ]
            }
        ]
    }
}
