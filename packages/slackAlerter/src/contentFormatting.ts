import { StateToEmojiMap as StateToEmojiMap, Trigger} from "./types"

const stateToEmojiMap: StateToEmojiMap = {
    INSUFFICIENT_DATA: ":black_circle:",
    ALARM: ":red_circle:",
    OK: ":green_circle:"
}

export const formatHeader = (alarmName: string, state: string): string => {
    const stateEmoji: string = stateToEmojiMap[state as keyof typeof stateToEmojiMap]
    const headerContent: string = alarmName.split("-")[1].trim()
    const formattedHeader = `${stateEmoji} ${headerContent}`
    
    return formattedHeader
}

const formatPeriod = (periodInSeconds: number): string => {
    const minInSeconds: number = 60
    const hourInSeconds: number = minInSeconds * 60
    const dayInSeconds: number = hourInSeconds * 24

    const days = Math.floor(periodInSeconds / dayInSeconds)
    const hours = Math.floor(periodInSeconds % dayInSeconds / hourInSeconds)
    const mins = Math.floor(periodInSeconds % hourInSeconds / minInSeconds)
    const secs = Math.floor(periodInSeconds % minInSeconds)

    const formattedDays = days ? (days == 1 ? `${days} day` : `${days} days`) : ""
    const formattedHours = hours ? (hours == 1 ? `${hours} hour` : `${hours} hours`) : ""
    const formattedMins = mins ? (mins == 1 ? `${mins} minute`: `${mins} minutes`): ""
    const formattedSecs = secs ? (secs == 1 ? `${secs} second` : `${secs} seconds`): ""
    
    let formattedPeriod = ""
    for (const formattedUnit of [formattedDays, formattedHours, formattedMins, formattedSecs]){
        formattedPeriod = formattedPeriod && formattedUnit ? `${formattedPeriod}, ${formattedUnit}` : `${formattedPeriod}${formattedUnit}`
    }
    return formattedPeriod
}

export const formatTrigger = (trigger: Trigger): string => {
    const period: string = formatPeriod(trigger.Period)
    const formattedTrigger: string = `${trigger.Statistic} ${trigger.MetricName} ${trigger.ComparisonOperator} ${trigger.Threshold} for ${trigger.EvaluationPeriods} period(s) of ${period}.`
    
    return formattedTrigger
}

export const formatState = (state: string): string => {
    const stateEmoji: string = stateToEmojiMap[state as keyof typeof stateToEmojiMap]
    const formattedState = `${stateEmoji} ${state}`

    return formattedState
}

export const formatMoreInfoUrl = (region: string, alarmName: string): string => {
    const encodedAlarmName = encodeURIComponent(alarmName)
    const formattedUrl =  `https://console.aws.amazon.com/cloudwatch/home?region=${region}#alarm:alarmFilter=ANY;name=${encodedAlarmName}`

    return formattedUrl
}
