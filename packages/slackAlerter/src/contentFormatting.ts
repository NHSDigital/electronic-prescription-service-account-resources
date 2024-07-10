const statusToEmojiMap = {
    INSUFFICIENT_DATA: ":black_circle:",
    ALARM: ":red_circle:",
    OK: ":green_circle:"
}

export const formatTitle = (alarmName: string, status: string): string => {
    const formattedTitle = ""
    return formattedTitle
}

export const formatPeriod = (periodInSeconds: number): string => {
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
