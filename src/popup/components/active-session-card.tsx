import {Activity, Clock3, Link2} from 'lucide-react'
import {getMeetingLabel} from '../../lib/meet'
import {formatClockTime, formatDuration} from '../../lib/time'
import type {ActiveMeetingSession} from '../../types/meeting'

interface ActiveSessionCardProps {
    session: ActiveMeetingSession
    now: number
}

export function ActiveSessionCard({session, now}: ActiveSessionCardProps) {
    return (
        <section
            className="overflow-hidden rounded-3xl border border-emerald-200 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(236,253,245,0.96))] p-4 shadow-[0_22px_46px_rgba(16,185,129,0.14)]">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div
                        className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-white/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-700">
                        <Activity className="h-3.5 w-3.5"/>
                        Live now
                    </div>
                    <h2 className="text-base font-semibold tracking-[-0.03em] text-slate-950">
                        {getMeetingLabel(session.title, session.meetCode)}
                    </h2>
                </div>
                <div className="rounded-2xl bg-slate-950 px-3 py-2 text-right text-white shadow-lg">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300">Running</div>
                    <div className="font-mono mt-1 text-sm">{formatDuration(now - session.startedAt, true)}</div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm text-slate-700">
                <div className="rounded-2xl bg-white/70 p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        <Clock3 className="h-3.5 w-3.5"/>
                        Started
                    </div>
                    <div className="font-mono text-slate-950">{formatClockTime(session.startedAt)}</div>
                </div>
                <div className="rounded-2xl bg-white/70 p-3">
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Meet code</div>
                    <div className="font-mono text-slate-950">{session.meetCode}</div>
                </div>
                <a
                    className="rounded-2xl bg-white/70 p-3 transition hover:bg-white"
                    href={session.url}
                    target="_blank"
                    rel="noreferrer"
                >
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        <Link2 className="h-3.5 w-3.5"/>
                        Open
                    </div>
                    <div className="text-slate-950">Jump back</div>
                </a>
            </div>
        </section>
    )
}