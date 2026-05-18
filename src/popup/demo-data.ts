import type {ActiveMeetingSession, ExtensionSnapshot, MeetingSession} from '../types/meeting'

const MINUTE = 60_000

function createCompletedSession(
    id: string,
    title: string,
    meetCode: string,
    now: number,
    startedMinutesAgo: number,
    durationMinutes: number,
): MeetingSession {
    const startedAt = now - startedMinutesAgo * MINUTE
    const endedAt = startedAt + durationMinutes * MINUTE

    return {
        id,
        title,
        meetCode,
        url: `https://meet.google.com/${meetCode}`,
        startedAt,
        endedAt,
        source: 'automatic',
    }
}

function createActiveSession(
    id: string,
    title: string,
    meetCode: string,
    now: number,
    startedMinutesAgo: number,
): ActiveMeetingSession {
    const startedAt = now - startedMinutesAgo * MINUTE

    return {
        id,
        tabId: -1,
        title,
        meetCode,
        url: `https://meet.google.com/${meetCode}`,
        startedAt,
        lastHeartbeatAt: now,
        source: 'automatic',
    }
}

export function getDemoSnapshot(now: number): ExtensionSnapshot {
    return {
        sessions: [
            createCompletedSession(
                'demo-session-1',
                'Daily product sync',
                'abc-defg-hij',
                now,
                255,
                46,
            ),
            createCompletedSession(
                'demo-session-2',
                'Client kickoff review',
                'kno-pqrs-tuv',
                now,
                172,
                38,
            ),
            createCompletedSession(
                'demo-session-3',
                'Frontend handoff',
                'wxy-zabc-def',
                now,
                104,
                27,
            ),
            createCompletedSession(
                'demo-session-4',
                'Weekly planning',
                'ghi-jklm-nop',
                now,
                62,
                19,
            ),
            createCompletedSession(
                'demo-session-5',
                'Hiring panel interview',
                'rst-uvwx-yza',
                now,
                38,
                24,
            ),
            createCompletedSession(
                'demo-session-6',
                'Engineering office hours',
                'bcd-efgh-ijk',
                now,
                12,
                8,
            ),
        ],
        activeSessions: [
            createActiveSession(
                'demo-active-1',
                'Design review',
                'qrs-tuvw-xyz',
                now,
                31,
            ),
        ],
    }
}