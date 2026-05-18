import {ArrowUpRight, ChevronDown, Clock3, Radio, Timer, X} from 'lucide-react'
import {useEffect, useMemo, useState} from 'react'
import {getExtensionSnapshot} from '../lib/storage'
import {clampDurationToWindow, formatDayLabel, formatDuration, getDayWindow, overlapsWindow,} from '../lib/time'
import type {ExtensionSnapshot} from '../types/meeting'
import {ActiveSessionCard} from './components/active-session-card'
import {TimelineItem} from './components/timeline-item'

const GITHUB_URL = 'https://github.com/HichemTab-tech/gmeet-time'
const PRIVACY_POLICY_URL = 'https://github.com/HichemTab-tech/gmeet-time/blob/master/PRIVACY.md'
const BRAND_NAME = 'HichemTab-tech'

const EMPTY_SNAPSHOT: ExtensionSnapshot = {
    sessions: [],
    activeSessions: [],
}

function App() {
    const [snapshot, setSnapshot] = useState<ExtensionSnapshot>(EMPTY_SNAPSHOT)
    const [loading, setLoading] = useState(true)
    const [now, setNow] = useState(() => Date.now())
    const [aboutOpen, setAboutOpen] = useState(false)

    useEffect(() => {
        let mounted = true

        async function loadSnapshot() {
            const nextSnapshot = await getExtensionSnapshot()

            if (!mounted) {
                return
            }

            setSnapshot(nextSnapshot)
            setLoading(false)
        }

        void loadSnapshot()

        const handleStorageChange = (
            _: Record<string, chrome.storage.StorageChange>,
            areaName: string,
        ) => {
            if (areaName === 'local' || areaName === 'session') {
                void loadSnapshot()
            }
        }

        chrome.storage.onChanged.addListener(handleStorageChange)

        return () => {
            mounted = false
            chrome.storage.onChanged.removeListener(handleStorageChange)
        }
    }, [])

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(Date.now())
        }, 1000)

        return () => {
            window.clearInterval(timer)
        }
    }, [])

    const today = useMemo(() => {
        const dayWindow = getDayWindow(now)
        const completed = snapshot.sessions.filter((session) =>
            overlapsWindow(session.startedAt, session.endedAt, dayWindow.start, dayWindow.end),
        )
        const active = snapshot.activeSessions.filter((session) =>
            overlapsWindow(session.startedAt, now, dayWindow.start, dayWindow.end),
        )

        const completedDurations = completed.map((session) =>
            clampDurationToWindow(
                session.startedAt,
                session.endedAt,
                dayWindow.start,
                dayWindow.end,
            ),
        )

        const activeDurations = active.map((session) =>
            clampDurationToWindow(session.startedAt, now, dayWindow.start, dayWindow.end),
        )

        const allDurations = [...completedDurations, ...activeDurations]

        return {
            completed,
            active,
            totalMeetingMs: [...completedDurations, ...activeDurations].reduce(
                (sum, value) => sum + value,
                0,
            ),
            meetingCount: completed.length + active.length,
            longestSessionMs: allDurations.length > 0 ? Math.max(...allDurations) : 0,
            label: formatDayLabel(now),
        }
    }, [now, snapshot.activeSessions, snapshot.sessions])

    return (
        <main className="min-h-screen bg-[#f3f1ec] px-2.5 py-2.5 text-slate-900">
            <div className="rounded-[18px] border border-[#ddd8cf] bg-[#f7f5f0] p-2.5 shadow-[0_10px_24px_rgba(60,46,26,0.08)]">
                <header className="mb-3 flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-[21px] font-medium tracking-tighter text-slate-950">
                            gmeet-time
                        </h1>
                        <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                            {today.label}
                        </p>
                    </div>
                    <details className="group relative">
                        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-[10px] border border-[#d9d3c8] bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-700 shadow-[0_1px_0_rgba(255,255,255,0.6)] transition hover:bg-[#fbfaf8]">
                            More
                            <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180"/>
                        </summary>
                        <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-[#d9d3c8] bg-white p-2 shadow-[0_12px_28px_rgba(60,46,26,0.12)]">
                            <a
                                className="flex items-center justify-between rounded-[10px] px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-600 transition hover:bg-[#f6f3ee] hover:text-slate-950"
                                href={GITHUB_URL}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span>Repository</span>
                                <ArrowUpRight className="h-3.5 w-3.5"/>
                            </a>
                            <button
                                type="button"
                                className="flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left text-xs font-medium uppercase tracking-[0.14em] text-slate-600 transition hover:bg-[#f6f3ee] hover:text-slate-950"
                                onClick={() => setAboutOpen((current) => !current)}
                            >
                                <span>About</span>
                                <ChevronDown className={`h-3.5 w-3.5 transition ${aboutOpen ? 'rotate-180' : ''}`}/>
                            </button>
                            <a
                                className="flex items-center justify-between rounded-[10px] px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-600 transition hover:bg-[#f6f3ee] hover:text-slate-950"
                                href={PRIVACY_POLICY_URL}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span>Privacy policy</span>
                                <ArrowUpRight className="h-3.5 w-3.5"/>
                            </a>
                        </div>
                    </details>
                </header>

                {aboutOpen ? (
                    <section className="mb-4 rounded-xl border border-[#ddd7cd] bg-[#ebe7df] px-4 py-3.5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-[13px] font-medium text-slate-950">
                                    About gmeet-time
                                </div>
                                <p className="mt-1.5 text-[13px] leading-5 text-slate-700">
                                    This extension automatically detects and tracks the time spent in active Google Meet
                                    sessions, building a daily timeline. No data is sent to external servers.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="rounded-full p-1 text-slate-500 transition hover:text-slate-950"
                                onClick={() => setAboutOpen(false)}
                                aria-label="Close about panel"
                            >
                                <X className="h-3.5 w-3.5"/>
                            </button>
                        </div>
                    </section>
                ) : null}

                {today.active.length > 0 ? (
                    <section className="mb-5 space-y-3">
                        {today.active.map((session) => (
                            <ActiveSessionCard key={session.id} session={session} now={now}/>
                        ))}
                    </section>
                ) : (
                    <section className="mb-5 rounded-xl border border-[#ddd7cd] bg-white px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.7)]">
                        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                            Current meet
                        </div>
                        <div className="mt-2 text-sm text-slate-700">
                            No active meeting detected right now.
                        </div>
                    </section>
                )}

                <section className="mb-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-[15px] font-medium tracking-[-0.03em] text-slate-950">Timeline</h2>
                            <p className="mt-0.5 text-[13px] text-slate-600">Today&apos;s meetings</p>
                        </div>
                        <div className="font-mono text-xs text-slate-500">{today.completed.length} items</div>
                    </div>

                    {loading ? (
                        <div
                            className="rounded-xl border border-dashed border-[#d3cdc3] bg-white/75 px-4 py-8 text-center text-sm text-slate-500">
                            Loading timeline…
                        </div>
                    ) : today.completed.length > 0 ? (
                        <div className="space-y-3">
                            {today.completed.map((session) => (
                                <TimelineItem key={session.id} session={session}/>
                            ))}
                        </div>
                    ) : (
                        <div
                            className="rounded-xl border border-dashed border-[#d3cdc3] bg-white/75 px-4 py-8 text-center text-sm text-slate-500">
                            No completed Meet sessions yet today. Join a meeting and the timeline will populate
                            automatically.
                        </div>
                    )}
                </section>

                <section className="mb-4 grid grid-cols-3 gap-2.5">
                    <div className="rounded-[10px] border border-[#d9d3c8] bg-white px-3 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.7)]">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                            <Timer className="h-3.5 w-3.5"/>
                            Total
                        </div>
                        <div className="font-mono mt-1.5 text-center text-[15px] text-slate-950">{formatDuration(today.totalMeetingMs)}</div>
                    </div>
                    <div className="rounded-[10px] border border-[#d9d3c8] bg-white px-3 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.7)]">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                            <Radio className="h-3.5 w-3.5"/>
                            Count
                        </div>
                        <div className="font-mono mt-1.5 text-center text-[15px] text-slate-950">{today.meetingCount}</div>
                    </div>
                    <div className="rounded-[10px] border border-[#d9d3c8] bg-white px-3 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.7)]">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                            <Clock3 className="h-3.5 w-3.5"/>
                            Longest
                        </div>
                        <div className="font-mono mt-1.5 text-center text-[15px] text-slate-950">{formatDuration(today.longestSessionMs)}</div>
                    </div>
                </section>

                <footer className="px-0.5 pt-1">
                    <div className="flex items-center justify-between gap-3 text-[12px] text-slate-600">
                        <span>Built by {BRAND_NAME}</span>
                        <a
                            className="inline-flex items-center gap-1.5 transition hover:text-slate-950"
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <ArrowUpRight className="h-3.5 w-3.5"/>
                            GitHub
                        </a>
                    </div>
                </footer>
            </div>
        </main>
    )
}

export default App