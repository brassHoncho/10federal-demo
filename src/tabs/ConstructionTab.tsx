import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import construction from '../data/construction.json'
import connectedSystems from '../data/connectedSystems.json'
import type { ConstructionProject, ConnectedSystemsByTab } from '../lib/schemas'
import {
  constructionByStage,
  constructionCapexCommitted,
  constructionCapexSpent,
  avgCostPerSqFt,
} from '../lib/metrics'
import { fmtCurrency, fmtPct } from '../lib/format'
import SectionHeader from '../components/shared/SectionHeader'
import KpiStrip from '../components/shared/KpiStrip'
import KpiCard from '../components/shared/KpiCard'
import ChartCard from '../components/shared/ChartCard'
import ConnectedSystems from '../components/shared/ConnectedSystems'

const C = construction as ConstructionProject[]
const CONN = connectedSystems as ConnectedSystemsByTab

const STAGE_DISPLAY: Record<ConstructionProject['stage'], { label: string; color: string }> = {
  'site-selection': { label: 'Site Selection', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  entitlement: { label: 'Entitlement', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  permitting: { label: 'Permitting', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  construction: { label: 'Construction', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'punch-list': { label: 'Punch List', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  'certificate-of-occupancy': { label: 'C.O.', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'lease-up': { label: 'Lease-up', color: 'bg-green-50 text-green-700 border-green-200' },
}

const SEED_PROMPTS = [
  "What's the punch list status on Georgetown TX heading into Q3 CO?",
  "How does Graham NC's 2016 lease-up pace inform the Georgetown pro forma?",
  'Walk me through the Charlotte permitting timeline and what could slip it',
  'Compare cost-per-sqft across our 4 active GA builds (Richmond Hill, Villa Rica, Temple, Savannah-area)',
  'Which pipeline sites should we cut from underwriting given current capital deployment?',
  'Draft a quarterly construction update for the Opportunistic Offering LPs',
]

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

export default function ConstructionTab() {
  const active = useMemo(() => C.filter((p) => p.stage !== 'lease-up' && p.stage !== 'certificate-of-occupancy'), [])
  const completed = useMemo(() => C.filter((p) => p.stage === 'lease-up' || p.stage === 'certificate-of-occupancy'), [])

  const totalCommitted = constructionCapexCommitted(C)
  const totalSpent = constructionCapexSpent(C)
  const costPerSqFt = avgCostPerSqFt(C)
  const today = new Date('2026-05-29')
  const avgDaysToCO = useMemo(() => {
    const days = active.map((p) => daysBetween(today, new Date(p.expectedCO)))
    if (days.length === 0) return 0
    return Math.round(days.reduce((a, b) => a + b, 0) / days.length)
  }, [active])

  const kanban = constructionByStage(C)

  const burnData = C.map((p) => ({
    name: p.name,
    spent: p.capexSpent / 1_000_000,
    remaining: (p.capexBudget - p.capexSpent) / 1_000_000,
  }))

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Construction"
        subtitle="Cliff's builds — 15 active projects across development, construction, and planning (Q2 2025 release). 8 highlighted: Graham (industry benchmark) + Georgetown TX nearing CO + 4 GA/TX vertical builds + Charlotte + Lake Worth pipeline."
        ownedBy={{ name: 'Cliff Minsley', role: 'Co-Founder, Principal' }}
      />

      <KpiStrip>
        <KpiCard label="# in development" value={active.length.toString()} caption="active across pipeline" />
        <KpiCard label="Total capex committed" value={fmtCurrency(totalCommitted)} caption={`${((totalSpent / totalCommitted) * 100).toFixed(0)}% spent`} />
        <KpiCard label="Avg cost / sq ft" value={`$${costPerSqFt.toFixed(0)}`} caption="@ 75 sqft/unit assumption" />
        <KpiCard label="Avg days to next CO" value={avgDaysToCO.toString()} caption="active projects only" />
      </KpiStrip>

      <section>
        <h3 className="text-sm font-semibold mb-3">Pipeline kanban</h3>
        <div className="grid gap-3 lg:grid-cols-7 sm:grid-cols-2 grid-cols-1">
          {kanban.map(({ stage, projects }) => {
            const display = STAGE_DISPLAY[stage]
            return (
              <div key={stage} className="rounded-xl border border-10f-border bg-white">
                <div className={`px-3 py-2 border-b border-10f-border rounded-t-xl ${display.color} border-x-0 border-t-0`}>
                  <div className="text-xs font-semibold uppercase tracking-wide">{display.label}</div>
                  <div className="text-xs">{projects.length} project{projects.length === 1 ? '' : 's'}</div>
                </div>
                <div className="p-2 flex flex-col gap-2 min-h-[120px]">
                  {projects.length === 0 ? (
                    <div className="text-xs text-10f-text-muted italic text-center py-3">empty</div>
                  ) : (
                    projects.map((p) => (
                      <div key={p.id} className="rounded-md bg-10f-surface border border-10f-border px-2 py-1.5 text-xs">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-10f-text-muted">{p.units} units · {fmtCurrency(p.capexBudget)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Capex burn vs remaining budget" subtitle="$M per project" height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={burnData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tickLine={false} fontSize={12} />
              <YAxis type="category" dataKey="name" width={120} tickLine={false} fontSize={11} />
              <Tooltip formatter={(v) => `$${(v as number).toFixed(1)}M`} />
              <Bar dataKey="spent" stackId="a" fill="#C8102E" name="Spent" />
              <Bar dataKey="remaining" stackId="a" fill="#E5E7EB" name="Remaining" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-xl border border-10f-border bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-10f-border">
            <h3 className="text-sm font-semibold">Active projects</h3>
          </div>
          <ul className="divide-y divide-10f-border">
            {active.map((p) => {
              const pctSpent = (p.capexSpent / p.capexBudget) * 100
              const display = STAGE_DISPLAY[p.stage]
              return (
                <li key={p.id} className="px-5 py-3 text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="font-medium">{p.name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${display.color}`}>
                      {display.label}
                    </span>
                  </div>
                  <div className="text-xs text-10f-text-muted mt-1">
                    {p.units} units · {fmtCurrency(p.capexBudget)} budget · ETA {p.expectedCO}
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-10f-border overflow-hidden">
                    <div className="h-full bg-10f-red" style={{ width: `${pctSpent}%` }} />
                  </div>
                  <div className="text-xs text-10f-text-muted mt-1">{fmtPct(pctSpent)} of capex deployed</div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-10f-border bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-10f-border">
          <h3 className="text-sm font-semibold">Completed builds — pro forma benchmarks</h3>
        </div>
        <ul className="divide-y divide-10f-border">
          {completed.map((p) => (
            <li key={p.id} className="px-5 py-3 text-sm">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-10f-text-muted mt-1">
                {p.units} units · ${(p.capexSpent / 1_000_000).toFixed(1)}M actual · CO {p.actualCO ?? p.expectedCO} · {fmtPct(p.occupancyPct)} occupied
              </div>
              <div className="text-xs text-10f-text-muted italic mt-1">{p.notes}</div>
            </li>
          ))}
        </ul>
      </div>

      <ConnectedSystems items={CONN.construction ?? []} />

      <section>
        <h3 className="text-sm font-semibold mb-3">Ask the Co-Pilot</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {SEED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent('open-copilot', { detail: { prompt } }))
              }
              className="text-left rounded-lg border border-10f-border bg-white px-4 py-3 text-sm hover:border-10f-red transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
