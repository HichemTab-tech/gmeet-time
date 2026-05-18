import {Link2} from 'lucide-react'
import {getMeetingLabel} from '../../lib/meet'
import {formatClockTime, formatDuration} from '../../lib/time'
import type {MeetingSession} from '../../types/meeting'

interface TimelineItemProps {
    session: MeetingSession
}

export function TimelineItem({session}: TimelineItemProps) {
    return (
        <article
            className="group relative rounded-3xl border border-white/80 bg-white/80 p-4 shadow-[0_14px_32px_rgba(15,23,42,0.07)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.11)]">
            <div className="absolute left-5 top-5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"/>
            <div className="pl-6">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                            {getMeetingLabel(session.title, session.meetCode)}
                        </h3>
                        <p className="font-mono mt-1 text-xs text-slate-500">{session.meetCode}</p>
                    </div>
                    <div
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700">
                        {formatDuration(session.endedAt - session.startedAt)}
                    </div>
                </div>

                <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-mono text-slate-950">{formatClockTime(session.startedAt)}</span>
                    <span className="text-slate-300">/</span>
                    <span className="font-mono text-slate-950">{formatClockTime(session.endedAt)}</span>
                </div>

                <a
                    className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 transition group-hover:text-emerald-700"
                    href={session.url}
                    target="_blank"
                    rel="noreferrer"
                >
                    <Link2 className="h-3.5 w-3.5"/>
                    Meet tab
                </a>
            </div>
        </article>
    )
}