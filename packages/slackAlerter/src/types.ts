export interface CloudWatchMessage {
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
    AlarmActions: []
    InsufficientDataActions: []
    Trigger: {
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
}
