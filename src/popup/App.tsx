import {ArrowUpRight, ChevronDown, Clock3, Radio, Timer} from 'lucide-react'
import {useEffect, useMemo, useState} from 'react'
import {getExtensionSnapshot} from '../lib/storage'
import {clampDurationToWindow, formatDayLabel, formatDuration, getDayWindow, overlapsWindow,} from '../lib/time'
import type {ExtensionSnapshot} from '../types/meeting'
import {ActiveSessionCard} from './components/active-session-card'
import {TimelineItem} from './components/timeline-item'

const GITHUB_URL = 'https://github.com/HichemTab-tech/gmeet-time'
const BRAND_NAME = 'HichemTab-tech'

const EMPTY_SNAPSHOT: ExtensionSnapshot = {
    sessions: [],
    activeSessions: [],
}

function App() {
    const [snapshot, setSnapshot] = useState<ExtensionSnapshot>(EMPTY_SNAPSHOT)
    const [loading, setLoading] = useState(true)
    const [now, setNow] = useState(() => Date.now())

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
        <main className="min-h-screen px-3 py-3 text-slate-800">
            <div className="rounded-3xl border border-slate-200/80 bg-white/88 p-3.5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                <header className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-[22px] font-semibold tracking-[-0.06em] text-slate-950">
                            gmeet-time
                        </h1>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                            {today.label}
                        </p>
                    </div>
                    <details className="group relative">
                        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-slate-600 transition hover:border-slate-300 hover:text-slate-950">
                            More
                            <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180"/>
                        </summary>
                        <div className="absolute right-0 z-10 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_38px_rgba(15,23,42,0.12)]">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="rounded-2xl bg-slate-50 px-2 py-2.5">
                                    <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Total</div>
                                    <div className="font-mono mt-1 text-xs text-slate-950">{formatDuration(today.totalMeetingMs)}</div>
                                </div>
                                <div className="rounded-2xl bg-slate-50 px-2 py-2.5">
                                    <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Meetings</div>
                                    <div className="font-mono mt-1 text-xs text-slate-950">{today.meetingCount}</div>
                                </div>
                                <div className="rounded-2xl bg-slate-50 px-2 py-2.5">
                                    <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Longest</div>
                                    <div className="font-mono mt-1 text-xs text-slate-950">{formatDuration(today.longestSessionMs)}</div>
                                </div>
                            </div>
                            <a
                                className="mt-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-950"
                                href={GITHUB_URL}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <ArrowUpRight className="h-3.5 w-3.5"/>
                                Repository
                            </a>
                        </div>
                    </details>
                </header>

                {today.active.length > 0 ? (
                    <section className="mb-5 space-y-3">
                        {today.active.map((session) => (
                            <ActiveSessionCard key={session.id} session={session} now={now}/>
                        ))}
                    </section>
                ) : (
                    <section className="mb-5 rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4">
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
                            <h2 className="text-base font-semibold tracking-[-0.03em] text-slate-950">Timeline</h2>
                            <p className="mt-1 text-sm text-slate-500">Today&apos;s meetings.</p>
                        </div>
                        <div className="font-mono text-xs text-slate-500">{today.completed.length} items</div>
                    </div>

                    {loading ? (
                        <div
                            className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
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
                            className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
                            No completed Meet sessions yet today. Join a meeting and the timeline will populate
                            automatically.
                        </div>
                    )}
                </section>

                <section className="mb-4 grid grid-cols-3 gap-2.5">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                            <Timer className="h-3.5 w-3.5"/>
                            Total
                        </div>
                        <div className="font-mono mt-2 text-sm text-slate-950">{formatDuration(today.totalMeetingMs)}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                            <Radio className="h-3.5 w-3.5"/>
                            Count
                        </div>
                        <div className="font-mono mt-2 text-sm text-slate-950">{today.meetingCount}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                            <Clock3 className="h-3.5 w-3.5"/>
                            Longest
                        </div>
                        <div className="font-mono mt-2 text-sm text-slate-950">{formatDuration(today.longestSessionMs)}</div>
                    </div>
                </section>

                <footer className="border-t border-slate-200 px-1 pt-3">
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
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