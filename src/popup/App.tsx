import {ArrowUpRight, Clock3, Radio, Sparkles, Timer, Waves} from 'lucide-react'
import {useEffect, useMemo, useState} from 'react'
import {getExtensionSnapshot} from '../lib/storage'
import {clampDurationToWindow, formatDayLabel, formatDuration, getDayWindow, overlapsWindow,} from '../lib/time'
import type {ExtensionSnapshot} from '../types/meeting'
import {ActiveSessionCard} from './components/active-session-card'
import {SummaryCard} from './components/summary-card'
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
        <main className="min-h-screen px-4 py-4 text-slate-800">
            <div
                className="rounded-[28px] border border-white/75 bg-white/62 p-4 shadow-[0_22px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
                <header className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                  className="rounded-full border border-slate-200 bg-white/85 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                local-first
              </span>
                            <span
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-700">
                open source
              </span>
                        </div>
                        <h1 className="text-[28px] font-semibold tracking-[-0.06em] text-slate-950">
                            gmeet-time
                        </h1>
                        <p className="mt-2 max-w-[26rem] text-sm leading-6 text-slate-600">
                            Google Meet time tracking with a clean daily history, no backend, and a popup built for fast
                            inspection.
                        </p>
                    </div>
                    <a
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <ArrowUpRight className="h-4 w-4"/>
                        Repo
                    </a>
                </header>

                <section
                    className="mb-5 rounded-3xl border border-slate-200/80 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(15,118,110,0.92))] p-4 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <div
                                className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-200">
                                <Waves className="h-3.5 w-3.5"/>
                                Today
                            </div>
                            <div className="text-2xl font-semibold tracking-[-0.05em]">{today.label}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-200/80">Brand</div>
                            <div className="mt-1 text-sm font-medium text-white">{BRAND_NAME}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="rounded-2xl border border-white/10 bg-white/7 p-3">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-100/80">Meetings</div>
                            <div className="mt-2 font-mono text-lg">{today.meetingCount}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/7 p-3">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-100/80">Total</div>
                            <div className="mt-2 font-mono text-lg">{formatDuration(today.totalMeetingMs)}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/7 p-3">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-100/80">Longest</div>
                            <div className="mt-2 font-mono text-lg">{formatDuration(today.longestSessionMs)}</div>
                        </div>
                    </div>
                </section>

                {today.active.length > 0 ? (
                    <section className="mb-5 space-y-3">
                        {today.active.map((session) => (
                            <ActiveSessionCard key={session.id} session={session} now={now}/>
                        ))}
                    </section>
                ) : null}

                <section className="mb-5 grid grid-cols-3 gap-3">
                    <SummaryCard
                        label="Total meeting time"
                        value={formatDuration(today.totalMeetingMs)}
                        icon={<Timer className="h-4 w-4"/>}
                        accent="mint"
                    />
                    <SummaryCard
                        label="Meeting count"
                        value={`${today.meetingCount}`}
                        icon={<Radio className="h-4 w-4"/>}
                    />
                    <SummaryCard
                        label="Longest session"
                        value={formatDuration(today.longestSessionMs)}
                        icon={<Clock3 className="h-4 w-4"/>}
                    />
                </section>

                <section className="mb-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold tracking-[-0.03em] text-slate-950">Timeline</h2>
                            <p className="mt-1 text-sm text-slate-500">Today&apos;s completed Google Meet sessions.</p>
                        </div>
                        <div
                            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs text-slate-500">
                            {today.completed.length} stored
                        </div>
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

                <footer
                    className="rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                    <div className="mb-2 flex items-center gap-2 text-slate-950">
                        <Sparkles className="h-4 w-4 text-emerald-600"/>
                        <span className="text-sm font-semibold tracking-[-0.03em]">About this build</span>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">
                        Built by {BRAND_NAME}. Sessions stay on-device in Chrome storage, the tracker runs automatically
                        on Meet tabs, and the codebase is ready for stats, charts, notes, export, and sync.
                    </p>
                    <div
                        className="mt-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                        <span>No backend</span>
                        <a
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-2.5 py-1 transition hover:border-slate-300 hover:text-slate-950"
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <ArrowUpRight className="h-3.5 w-3.5"/>
                            github.com/HichemTab-tech/gmeet-time
                        </a>
                    </div>
                </footer>
            </div>
        </main>
    )
}

export default App