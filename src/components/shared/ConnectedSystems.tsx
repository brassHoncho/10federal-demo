import type { ConnectedSystem } from '../../lib/schemas'
import { fmtRelativeTime } from '../../lib/format'

type Props = {
  items: ConnectedSystem[]
}

const STATUS_DOT: Record<ConnectedSystem['status'], string> = {
  ok: 'bg-green-500',
  warn: 'bg-amber-500',
  error: 'bg-red-500',
}

export default function ConnectedSystems({ items }: Props) {
  if (items.length === 0) return null
  return (
    <div className="rounded-xl border border-10f-border bg-white shadow-sm">
      <div className="px-5 py-3 border-b border-10f-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">Connected Systems</h3>
        <span className="text-xs text-10f-text-muted">{items.length} integrations</span>
      </div>
      <div className="flex flex-wrap gap-2 p-3">
        {items.map((it) => (
          <div
            key={it.name}
            className="inline-flex items-center gap-2 rounded-full border border-10f-border bg-10f-surface px-3 py-1.5 text-xs"
            title={it.metric ?? ''}
          >
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[it.status]}`} />
            <span className="font-medium">{it.name}</span>
            <span className="text-10f-text-muted">·</span>
            <span className="text-10f-text-muted">{it.category}</span>
            <span className="text-10f-text-muted">·</span>
            <span className="text-10f-text-muted">{fmtRelativeTime(it.lastSyncMinutesAgo)}</span>
            {it.metric && (
              <>
                <span className="text-10f-text-muted">·</span>
                <span className="font-medium">{it.metric}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
