import {Activity, Link2} from 'lucide-react'
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
            className="overflow-hidden rounded-xl border border-[#ddd7cd] bg-white p-4 shadow-[0_1px_0_rgba(255,255,255,0.7)]">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div
                        className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[#f4b4a7] bg-[#fbe1d8] px-2 py-1 text-[11px] font-medium text-[#b33b1d]">
                        <Activity className="h-3.5 w-3.5"/>
                        Live now
                    </div>
                    <h2 className="max-w-56 text-[24px] font-medium leading-[1.05] tracking-tighter text-slate-950">
                        {getMeetingLabel(session.title, session.meetCode)}
                    </h2>
                </div>
            </div>

            <div className="font-mono mb-4 text-[24px] leading-none text-slate-950">{formatDuration(now - session.startedAt, true)}</div>

            <div className="mb-3 border-t border-[#ebe5dc]"/>

            <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 text-[12px] text-slate-700">
                <div>
                    <span className="text-slate-500">Start:</span>{' '}
                    <span className="font-medium text-slate-950">{formatClockTime(session.startedAt)}</span>
                </div>
                <div>
                    <span className="text-slate-500">Code:</span>{' '}
                    <span className="font-medium text-slate-950">{session.meetCode}</span>
                </div>
                <a
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-[#4f7390] transition hover:text-slate-950"
                    href={session.url}
                    target="_blank"
                    rel="noreferrer"
                >
                    <Link2 className="h-3.5 w-3.5"/>
                    Meet tab
                </a>
            </div>
        </section>
    )
}