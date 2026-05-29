import { fmtDelta } from '../../lib/format'

type Props = {
  label: string
  value: string
  delta?: number
  deltaSuffix?: string
  caption?: string
}

export default function KpiCard({ label, value, delta, deltaSuffix = '%', caption }: Props) {
  return (
    <div className="rounded-xl border border-10f-border bg-white px-5 py-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-10f-text-muted">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        {delta !== undefined && (
          <span
            className={`text-xs font-medium tabular-nums ${
              delta > 0 ? 'text-green-700' : delta < 0 ? 'text-red-700' : 'text-10f-text-muted'
            }`}
          >
            {fmtDelta(delta, deltaSuffix)}
          </span>
        )}
      </div>
      {caption && <div className="mt-1 text-xs text-10f-text-muted">{caption}</div>}
    </div>
  )
}
