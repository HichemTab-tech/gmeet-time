import type {ReactNode} from 'react'
import {cn} from '../../lib/cn'

interface SummaryCardProps {
    label: string
    value: string
    icon: ReactNode
    accent?: 'default' | 'mint'
}

export function SummaryCard({label, value, icon, accent = 'default'}: SummaryCardProps) {
    return (
        <article
            className={cn(
                'rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_14px_32px_rgba(15,23,42,0.08)] backdrop-blur',
                accent === 'mint' && 'border-emerald-200/80 bg-emerald-50/90',
            )}
        >
            <div className="mb-3 flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em]">{label}</span>
                <span className="text-emerald-600">{icon}</span>
            </div>
            <div className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{value}</div>
        </article>
    )
}