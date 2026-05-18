export interface MeetPresencePayload {
    meetCode: string
    title: string
    url: string
    detectedAt: number
}

export interface MeetingSession {
    id: string
    meetCode: string
    title: string
    url: string
    startedAt: number
    endedAt: number
    source: 'automatic'
}

export interface ActiveMeetingSession {
    id: string
    tabId: number
    meetCode: string
    title: string
    url: string
    startedAt: number
    lastHeartbeatAt: number
    source: 'automatic'
}

export interface ExtensionSnapshot {
    sessions: MeetingSession[]
    activeSessions: ActiveMeetingSession[]
}

export type TrackerMessage =
    | { type: 'MEET_JOINED'; payload: MeetPresencePayload }
    | { type: 'MEET_HEARTBEAT'; payload: MeetPresencePayload }
    | { type: 'MEET_LEFT'; payload: MeetPresencePayload }