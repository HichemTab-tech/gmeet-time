const MEET_CODE_PATTERN = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i
const GENERIC_MEET_TITLES = new Set([
    'Google Meet',
    'Meet',
    'Meeting details - Google Meet',
])

export function isMeetUrl(url: string) {
    try {
        return new URL(url).hostname === 'meet.google.com'
    } catch {
        return false
    }
}

export function parseMeetCode(url: string) {
    try {
        const pathname = new URL(url).pathname
        const segments = pathname.split('/').filter(Boolean)

        for (const segment of segments) {
            if (MEET_CODE_PATTERN.test(segment)) {
                return segment.toLowerCase()
            }
        }
    } catch {
        return 'unknown'
    }

    return 'unknown'
}

export function normalizeMeetingTitle(title: string, meetCode: string) {
    const cleaned = title.replace(/\s*-\s*Google Meet$/i, '').trim()

    if (!cleaned || GENERIC_MEET_TITLES.has(cleaned)) {
        return meetCode === 'unknown' ? 'Untitled meeting' : `Meet ${meetCode}`
    }

    return cleaned
}

export function getMeetingLabel(title: string, meetCode: string) {
    return title && title !== 'Untitled meeting'
        ? title
        : meetCode === 'unknown'
            ? 'Untitled meeting'
            : `Meet ${meetCode}`
}