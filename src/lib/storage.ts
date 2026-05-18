import {STORAGE_KEYS} from './constants'
import type {ActiveMeetingSession, ExtensionSnapshot, MeetingSession,} from '../types/meeting'

function sortCompletedSessions(sessions: MeetingSession[]) {
    return [...sessions].sort((left, right) => right.startedAt - left.startedAt)
}

function sortActiveSessions(sessions: ActiveMeetingSession[]) {
    return [...sessions].sort((left, right) => right.startedAt - left.startedAt)
}

export async function getCompletedSessions() {
    const result = await chrome.storage.local.get(STORAGE_KEYS.sessions)
    const sessions = result[STORAGE_KEYS.sessions]

    return Array.isArray(sessions) ? sortCompletedSessions(sessions) : []
}

export async function setCompletedSessions(sessions: MeetingSession[]) {
    await chrome.storage.local.set({
        [STORAGE_KEYS.sessions]: sortCompletedSessions(sessions),
    })
}

export async function getActiveSessions() {
    const result = await chrome.storage.session.get(STORAGE_KEYS.activeSessions)
    const sessions = result[STORAGE_KEYS.activeSessions]

    return Array.isArray(sessions) ? sortActiveSessions(sessions) : []
}

export async function setActiveSessions(sessions: ActiveMeetingSession[]) {
    await chrome.storage.session.set({
        [STORAGE_KEYS.activeSessions]: sortActiveSessions(sessions),
    })
}

export async function getExtensionSnapshot(): Promise<ExtensionSnapshot> {
    const [sessions, activeSessions] = await Promise.all([
        getCompletedSessions(),
        getActiveSessions(),
    ])

    return {
        sessions,
        activeSessions,
    }
}