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
            className="group rounded-xl border border-[#ddd7cd] bg-white p-3.5 shadow-[0_1px_0_rgba(255,255,255,0.7)] transition hover:border-[#cfc8bc]">
            <div>
                <div className="mb-2.5 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-[15px] font-medium tracking-[-0.02em] text-slate-950">
                            {getMeetingLabel(session.title, session.meetCode)} - {formatDuration(session.endedAt - session.startedAt)}
                        </h3>
                        <p className="mt-1 text-[12px] text-slate-600">code: {session.meetCode}</p>
                    </div>
                    <div className="rounded-full border border-[#ddd7cd] bg-[#f5f2ec] px-2.5 py-1 font-mono text-[11px] text-slate-700">
                        {formatDuration(session.endedAt - session.startedAt)}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-[12px] text-slate-700">
                    <div className="inline-flex items-center gap-1.5">
                        <span>{formatClockTime(session.startedAt)}</span>
                        <span>-</span>
                        <span>{formatClockTime(session.endedAt)}</span>
                    </div>

                    <a
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#4f7390] transition group-hover:text-slate-950"
                        href={session.url}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Link2 className="h-3.5 w-3.5"/>
                        Meet tab
                    </a>
                </div>
            </div>
        </article>
    )
}