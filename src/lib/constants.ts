export const STORAGE_KEYS = {
    sessions: 'gmeet-time:sessions',
    activeSessions: 'gmeet-time:active-sessions',
} as const

export const RECONCILE_ALARM = 'gmeet-time:reconcile'
export const HEARTBEAT_INTERVAL_MS = 15_000
export const DETECTION_POLL_MS = 2_000
export const STALE_SESSION_MS = 45_000
export const MAX_STORED_SESSIONS = 2_000