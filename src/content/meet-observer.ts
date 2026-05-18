import {DETECTION_POLL_MS, HEARTBEAT_INTERVAL_MS,} from '../lib/constants'
import {isMeetUrl, normalizeMeetingTitle, parseMeetCode} from '../lib/meet'
import type {MeetPresencePayload, TrackerMessage} from '../types/meeting'

const ACTIVE_CALL_SELECTORS = [
    '[aria-label*="Leave call"]',
    '[aria-label*="Leave meeting"]',
    '[aria-label*="Hang up"]',
    '[aria-label*="End call"]',
    '[data-tooltip*="Leave call"]',
    '[data-tooltip*="Hang up"]',
].join(',')

let meetingActive = false
let lastSignature = ''
let heartbeatTimer: number | undefined
let scanQueued = false

const observer = new MutationObserver(() => {
    scheduleScan()
})

observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
})

window.setInterval(() => {
    evaluateMeetingState()
}, DETECTION_POLL_MS)

document.addEventListener('visibilitychange', scheduleScan)
window.addEventListener('focus', scheduleScan)
window.addEventListener('pagehide', handleExit)
window.addEventListener('beforeunload', handleExit)

scheduleScan()

function scheduleScan() {
    if (scanQueued) {
        return
    }

    scanQueued = true
    window.requestAnimationFrame(() => {
        scanQueued = false
        evaluateMeetingState()
    })
}

function evaluateMeetingState() {
    const snapshot = getMeetingSnapshot()
    const signature = `${snapshot.active}:${snapshot.payload.meetCode}:${snapshot.payload.url}:${snapshot.payload.title}`

    if (snapshot.active) {
        if (!meetingActive) {
            meetingActive = true
            lastSignature = signature
            startHeartbeatLoop()
            void postTrackerMessage({type: 'MEET_JOINED', payload: snapshot.payload})
            return
        }

        if (lastSignature !== signature) {
            lastSignature = signature
            void postTrackerMessage({type: 'MEET_HEARTBEAT', payload: snapshot.payload})
        }

        return
    }

    if (meetingActive) {
        meetingActive = false
        lastSignature = ''
        stopHeartbeatLoop()
        void postTrackerMessage({type: 'MEET_LEFT', payload: snapshot.payload})
    }
}

function getMeetingSnapshot() {
    const url = window.location.href
    const meetCode = parseMeetCode(url)
    const title = normalizeMeetingTitle(document.title, meetCode)
    const hasActiveCallUi = Boolean(document.querySelector(ACTIVE_CALL_SELECTORS))

    return {
        active: isMeetUrl(url) && meetCode !== 'unknown' && hasActiveCallUi,
        payload: {
            meetCode,
            title,
            url,
            detectedAt: Date.now(),
        } satisfies MeetPresencePayload,
    }
}

function startHeartbeatLoop() {
    stopHeartbeatLoop()
    heartbeatTimer = window.setInterval(() => {
        const snapshot = getMeetingSnapshot()

        if (!snapshot.active) {
            evaluateMeetingState()
            return
        }

        void postTrackerMessage({type: 'MEET_HEARTBEAT', payload: snapshot.payload})
    }, HEARTBEAT_INTERVAL_MS)
}

function stopHeartbeatLoop() {
    if (heartbeatTimer) {
        window.clearInterval(heartbeatTimer)
    }

    heartbeatTimer = undefined
}

function handleExit() {
    if (!meetingActive) {
        return
    }

    const snapshot = getMeetingSnapshot()
    void postTrackerMessage({type: 'MEET_LEFT', payload: snapshot.payload})
}

async function postTrackerMessage(message: TrackerMessage) {
    try {
        await chrome.runtime.sendMessage(message)
    } catch {
        return
    }
}