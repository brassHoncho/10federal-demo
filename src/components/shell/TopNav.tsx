import type { TabId } from '../../App'

const ITEMS: { id: TabId; label: string; count?: number }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'operations', label: 'Operations', count: 130 },
  { id: 'marketing', label: 'Marketing' },
  { id: 'investments', label: 'Investments', count: 3 },
  { id: 'construction', label: 'Construction', count: 7 },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'settings', label: 'Settings' },
]

type Props = {
  active: TabId
  onChange: (t: TabId) => void
}

export default function TopNav({ active, onChange }: Props) {
  return (
    <nav className="border-b border-10f-border bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex gap-1 px-6 overflow-x-auto">
        {ITEMS.map((it) => {
          const isActive = active === it.id
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onChange(it.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-10f-red text-10f-red'
                  : 'border-transparent text-10f-text-muted hover:text-10f-text'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {it.label}
              {it.count !== undefined && (
                <span className="ml-1.5 text-xs text-10f-text-muted">({it.count})</span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
