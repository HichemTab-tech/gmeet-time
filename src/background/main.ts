import {MAX_STORED_SESSIONS, RECONCILE_ALARM, STALE_SESSION_MS,} from '../lib/constants'
import {isMeetUrl, normalizeMeetingTitle, parseMeetCode} from '../lib/meet'
import {getActiveSessions, getCompletedSessions, setActiveSessions, setCompletedSessions,} from '../lib/storage'
import type {ActiveMeetingSession, MeetingSession, MeetPresencePayload, TrackerMessage,} from '../types/meeting'

const activeSessions = new Map<number, ActiveMeetingSession>()

const hydrated = hydrateActiveSessions()

void bootstrap()

chrome.runtime.onInstalled.addListener(() => {
    void bootstrap()
})

chrome.runtime.onStartup.addListener(() => {
    void bootstrap()
})

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== RECONCILE_ALARM) {
        return
    }

    void reconcileStaleSessions()
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabId = sender.tab?.id

    if (!tabId || !isTrackerMessage(message)) {
        sendResponse({ok: false})
        return false
    }

    void handleTrackerMessage(tabId, message)
        .then(() => sendResponse({ok: true}))
        .catch((error: unknown) => {
            const reason = error instanceof Error ? error.message : 'Unknown tracker error'
            console.error('[gmeet-time] background message failed', reason)
            sendResponse({ok: false, reason})
        })

    return true
})

async function bootstrap() {
    await hydrated
    await ensureReconcileAlarm()
    await updateBadge()
}

async function hydrateActiveSessions() {
    const persistedSessions = await getActiveSessions()
    activeSessions.clear()

    for (const session of persistedSessions) {
        activeSessions.set(session.tabId, session)
    }
}

async function ensureReconcileAlarm() {
    const existingAlarm = await chrome.alarms.get(RECONCILE_ALARM)

    if (!existingAlarm) {
        await chrome.alarms.create(RECONCILE_ALARM, {
            periodInMinutes: 1,
        })
    }
}

async function handleTrackerMessage(tabId: number, message: TrackerMessage) {
    await hydrated

    if (!isMeetUrl(message.payload.url)) {
        return
    }

    switch (message.type) {
        case 'MEET_JOINED':
        case 'MEET_HEARTBEAT':
            await upsertActiveSession(tabId, message.payload)
            return
        case 'MEET_LEFT':
            await finalizeActiveSession(tabId, message.payload.detectedAt)
    }
}

async function upsertActiveSession(tabId: number, payload: MeetPresencePayload) {
    const meetCode = payload.meetCode === 'unknown' ? parseMeetCode(payload.url) : payload.meetCode
    const title = normalizeMeetingTitle(payload.title, meetCode)
    const current = activeSessions.get(tabId)

    if (current && current.meetCode === meetCode && current.url === payload.url) {
        activeSessions.set(tabId, {
            ...current,
            title,
            url: payload.url,
            lastHeartbeatAt: payload.detectedAt,
        })

        await persistActiveSessions()
        return
    }

    if (current) {
        await finalizeActiveSession(tabId, payload.detectedAt)
    }

    activeSessions.set(tabId, {
        id: `${tabId}-${payload.detectedAt}`,
        tabId,
        meetCode,
        title,
        url: payload.url,
        startedAt: payload.detectedAt,
        lastHeartbeatAt: payload.detectedAt,
        source: 'automatic',
    })

    await persistActiveSessions()
}

async function finalizeActiveSession(tabId: number, endedAt: number) {
    const current = activeSessions.get(tabId)

    if (!current) {
        return
    }

    activeSessions.delete(tabId)
    await persistActiveSessions()

    const completedSession: MeetingSession = {
        id: current.id,
        meetCode: current.meetCode,
        title: current.title,
        url: current.url,
        startedAt: current.startedAt,
        endedAt: Math.max(endedAt, current.startedAt),
        source: 'automatic',
    }

    await storeCompletedSession(completedSession)
}

async function storeCompletedSession(nextSession: MeetingSession) {
    const sessions = await getCompletedSessions()
    const deduped = sessions.filter((session) => session.id !== nextSession.id)

    deduped.push(nextSession)
    deduped.sort((left, right) => right.startedAt - left.startedAt)

    await setCompletedSessions(deduped.slice(0, MAX_STORED_SESSIONS))
}

async function persistActiveSessions() {
    await setActiveSessions([...activeSessions.values()])
    await updateBadge()
}

async function reconcileStaleSessions() {
    await hydrated
    const staleAt = Date.now() - STALE_SESSION_MS
    const staleTabs = [...activeSessions.entries()]
        .filter(([, session]) => session.lastHeartbeatAt <= staleAt)
        .map(([tabId]) => tabId)

    for (const tabId of staleTabs) {
        const session = activeSessions.get(tabId)
        await finalizeActiveSession(tabId, session?.lastHeartbeatAt ?? Date.now())
    }
}

async function updateBadge() {
    const count = activeSessions.size

    await chrome.action.setBadgeBackgroundColor({color: '#0f766e'})
    await chrome.action.setBadgeText({text: count > 0 ? `${Math.min(count, 9)}${count > 9 ? '+' : ''}` : ''})
    await chrome.action.setTitle({
        title:
            count > 0
                ? `gmeet-time · ${count} active meeting${count === 1 ? '' : 's'}`
                : 'gmeet-time',
    })
}

function isTrackerMessage(value: unknown): value is TrackerMessage {
    if (!value || typeof value !== 'object') {
        return false
    }

    const candidate = value as Partial<TrackerMessage>
    const type = candidate.type

    if (
        type !== 'MEET_JOINED' &&
        type !== 'MEET_HEARTBEAT' &&
        type !== 'MEET_LEFT'
    ) {
        return false
    }

    return isMeetPresencePayload(candidate.payload)
}

function isMeetPresencePayload(value: unknown): value is MeetPresencePayload {
    if (!value || typeof value !== 'object') {
        return false
    }

    const candidate = value as Partial<MeetPresencePayload>

    return (
        typeof candidate.meetCode === 'string' &&
        typeof candidate.title === 'string' &&
        typeof candidate.url === 'string' &&
        typeof candidate.detectedAt === 'number'
    )
}