import { fmtDelta } from '../../lib/format'

export type LeaderboardRow = {
  rank: number
  name: string
  metricLabel: string
  delta?: number
  subtitle?: string
}

type Props = {
  title: string
  rows: LeaderboardRow[]
  accentColors?: string[] // tailwind text-* class per index
  tone?: 'up' | 'down'
}

const DEFAULT_COLORS = [
  'text-indigo-500', 'text-sky-500', 'text-orange-500', 'text-cyan-500',
  'text-emerald-500', 'text-violet-500', 'text-rose-500', 'text-amber-500',
  'text-teal-500', 'text-fuchsia-500',
]

export default function Leaderboard({ title, rows, accentColors = DEFAULT_COLORS, tone }: Props) {
  return (
    <div className="rounded-xl border border-10f-border bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-10f-border">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <ol className="divide-y divide-10f-border">
        {rows.map((row, i) => (
          <li key={`${row.rank}-${row.name}`} className="flex items-center gap-3 px-5 py-2.5 text-sm">
            <span className={`font-mono text-xs w-6 text-right ${accentColors[i % accentColors.length]}`}>
              {row.rank}
            </span>
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium">{row.name}</div>
              {row.subtitle && (
                <div className="truncate text-xs text-10f-text-muted">{row.subtitle}</div>
              )}
            </div>
            <span className="tabular-nums text-sm font-medium">{row.metricLabel}</span>
            {row.delta !== undefined && (
              <span
                className={`tabular-nums text-xs font-medium w-12 text-right ${
                  tone === 'down' || row.delta < 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {fmtDelta(row.delta)}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
