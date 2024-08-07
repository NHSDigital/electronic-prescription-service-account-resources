// #region Secrets
export interface LambdaSecrets {
    [key: string]: string
}

export type SecretsStore = "parameterStore" | "secretsManager"

export interface ParameterStoreParameter {
    Parameter: {
        Name: string
        Type: "String" | "StringList" | "SecureString"
        Value: string
        Version: number
        Selector: string
        LastModifiedDate: string
        ARN: string
        DataType: string
    }
}

export interface SecretsManagerSecret {
    ARN: string
    Name: string
    VersionId: string
    SecretString: string
    VersionStages: string[]
    CreatedDate: EpochTimeStamp
}
// #endregion

// #region CloudWatch
export interface Trigger {
    MetricName: string
    Namespace: string
    StatisticType: string
    Statistic: string
    Unit: string | null
    Dimensions: [
        {
            value: string
            name: string
        }
    ]
    Period: number
    EvaluationPeriods: number
    DatapointsToAlarm: number
    ComparisonOperator: string
    Threshold: number
    TreatMissingData: string
    EvaluateLowSampleCountPercentile: string
}

export interface CloudWatchAlarm {
    AlarmName: string
    AlarmDescription: string | null
    AWSAccountId: string
    AlarmConfigurationUpdatedTimestamp: string
    NewStateValue: string
    NewStateReason: string
    StateChangeTime: string
    Region: string
    AlarmArn: string
    OldStateValue: string
    OKActions: []
    AlarmActions: string[]
    InsufficientDataActions: []
    Trigger: Trigger
}
// #endregion

// #region Slack
export interface StateToEmojiMap {
    INSUFFICIENT_DATA: string
    ALARM: string
    OK: string
}

export interface CloudWatchAlertContentValues {
    header: string
    timestamp: string
    stack: string
    environment: string
    region: string
    description: string
    reason: string
    trigger: string
    oldState: string
    newState: string
    moreInfoUrl: string
}

interface Text {
    type: "text" | "plain_text" | "mrkdwn"
    text: string
}

interface PlainText extends Text {
    type: "plain_text"
    emoji: boolean
}

interface RichText extends Text {
    type: "text"
    style?: {
        bold?: boolean
        italic?: boolean
        strike?: boolean
        code?: boolean
    }
}

interface Button {
    type: "button"
    text: PlainText
    style?: "primary" | "danger"
    url: string
}

interface RichTextSection {
    type: "rich_text_section"
    elements: RichText[]
}

interface MessageBlock {
    type: "header" | "divider" | "section" | "rich_text" | "actions"
}

interface HeaderBlock extends MessageBlock {
    type: "header"
    text: PlainText
}

interface DividerBlock extends MessageBlock {
    type: "divider"
}

interface SectionBlock extends MessageBlock {
    type: "section"
    fields: (Text | PlainText)[]
}

interface RichTextBlock extends MessageBlock {
    type: "rich_text"
    elements: RichTextSection[]
}

interface ActionBlock extends MessageBlock {
    type: "actions"
    elements: Button[]
}

export interface CloudWatchAlertMessageContent {
    blocks: [
        HeaderBlock,
        DividerBlock,
        SectionBlock,
        SectionBlock,
        DividerBlock,
        RichTextBlock,
        DividerBlock,
        SectionBlock,
        DividerBlock,
        ActionBlock
    ]
}
// #end region
