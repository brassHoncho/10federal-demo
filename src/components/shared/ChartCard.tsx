import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  filters?: ReactNode
  children: ReactNode
  height?: number
}

export default function ChartCard({ title, subtitle, filters, children, height = 320 }: Props) {
  return (
    <div className="rounded-xl border border-10f-border bg-white shadow-sm">
      <div className="px-5 py-3 border-b border-10f-border flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-10f-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {filters && <div className="flex items-center gap-2">{filters}</div>}
      </div>
      <div className="p-3" style={{ height }}>
        {children}
      </div>
    </div>
  )
}
