function pluralize(value: number, singular: string, plural = `${singular}s`) {
    return `${value}${singular === 'm' || singular === 'h' || singular === 's' ? singular : ` ${value === 1 ? singular : plural}`}`
}

export function formatClockTime(timestamp: number) {
    return new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    }).format(timestamp)
}

export function formatDayLabel(timestamp: number) {
    return new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    }).format(timestamp)
}

export function formatDuration(ms: number, includeSeconds = false) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const parts: string[] = []

    if (hours > 0) {
        parts.push(pluralize(hours, 'h'))
    }

    if (minutes > 0 || hours > 0) {
        parts.push(pluralize(minutes, 'm'))
    }

    if (includeSeconds && (seconds > 0 || parts.length === 0)) {
        parts.push(pluralize(seconds, 's'))
    }

    if (parts.length === 0) {
        return '0m'
    }

    return parts.slice(0, includeSeconds ? 3 : 2).join(' ')
}

export function getDayWindow(now: number) {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    return {
        start: start.getTime(),
        end: end.getTime(),
    }
}

export function overlapsWindow(
    startedAt: number,
    endedAt: number,
    windowStart: number,
    windowEnd: number,
) {
    return startedAt < windowEnd && endedAt > windowStart
}

export function clampDurationToWindow(
    startedAt: number,
    endedAt: number,
    windowStart: number,
    windowEnd: number,
) {
    const effectiveStart = Math.max(startedAt, windowStart)
    const effectiveEnd = Math.min(endedAt, windowEnd)

    return Math.max(0, effectiveEnd - effectiveStart)
}