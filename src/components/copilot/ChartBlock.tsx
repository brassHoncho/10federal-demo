import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'

export type ChartKind = 'bar' | 'line' | 'pie'

type Datum = { name: string; value: number } & Record<string, unknown>

type ChartSpec = {
  title?: string
  data: Datum[]
  unit?: string
  /** For line/bar with multiple series, optional yKeys; defaults to ['value']. */
  yKeys?: string[]
}

const PALETTE = ['#C8102E', '#0EA5E9', '#10B981', '#A78BFA', '#F59E0B', '#0891B2']

function fmtValue(v: number, unit?: string) {
  const n = Number.isFinite(v) ? v : 0
  const rounded = Math.abs(n) >= 100 ? n.toFixed(0) : n.toFixed(1)
  if (!unit) return rounded
  if (unit === '%' || unit === 'pct') return `${rounded}%`
  if (unit === '$') return `$${rounded}`
  if (unit === '$M') return `$${rounded}M`
  return `${rounded} ${unit}`
}

export default function ChartBlock({ kind, spec }: { kind: ChartKind; spec: ChartSpec }) {
  const { title, data, unit, yKeys = ['value'] } = spec
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="my-2 rounded-lg border border-10f-border bg-10f-surface px-3 py-2 text-xs text-10f-text-muted">
        (empty {kind} chart)
      </div>
    )
  }

  return (
    <figure className="my-2 rounded-lg border border-10f-border bg-white p-3 shadow-sm">
      {title && (
        <figcaption className="mb-1 text-xs font-medium text-10f-text">{title}</figcaption>
      )}
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          {kind === 'bar' ? (
            <BarChart data={data} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" fontSize={10} tickLine={false} />
              <YAxis tickFormatter={(v) => fmtValue(v as number, unit)} fontSize={10} tickLine={false} />
              <Tooltip formatter={(v) => fmtValue(v as number, unit)} />
              {yKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
              {yKeys.map((k, i) => (
                <Bar key={k} dataKey={k} fill={PALETTE[i % PALETTE.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          ) : kind === 'line' ? (
            <LineChart data={data} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" fontSize={10} tickLine={false} />
              <YAxis tickFormatter={(v) => fmtValue(v as number, unit)} fontSize={10} tickLine={false} />
              <Tooltip formatter={(v) => fmtValue(v as number, unit)} />
              {yKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
              {yKeys.map((k, i) => (
                <Line key={k} type="monotone" dataKey={k} stroke={PALETTE[i % PALETTE.length]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          ) : (
            <PieChart>
              <Tooltip formatter={(v) => fmtValue(v as number, unit)} />
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={(d) => d.name}>
                {data.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </figure>
  )
}

/**
 * Parse the spec JSON from a fenced ```chart:* block body. Returns null if invalid.
 */
export function parseChartSpec(body: string): ChartSpec | null {
  try {
    const parsed = JSON.parse(body)
    if (!parsed || typeof parsed !== 'object') return null
    if (!Array.isArray(parsed.data)) return null
    return parsed as ChartSpec
  } catch {
    return null
  }
}
