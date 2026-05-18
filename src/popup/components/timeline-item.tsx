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
            className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:border-slate-300 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
            <div>
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                            {getMeetingLabel(session.title, session.meetCode)}
                        </h3>
                        <p className="font-mono mt-1 text-xs text-slate-500">{session.meetCode}</p>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700">
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