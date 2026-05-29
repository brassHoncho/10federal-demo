import { useMemo } from 'react'
import facilities from '../data/facilities.json'
import connectedSystems from '../data/connectedSystems.json'
import type { Facility, ConnectedSystemsByTab } from '../lib/schemas'
import { byState, networkOccupancy } from '../lib/metrics'
import { fmtCurrency, fmtPct } from '../lib/format'
import SectionHeader from '../components/shared/SectionHeader'
import KpiStrip from '../components/shared/KpiStrip'
import KpiCard from '../components/shared/KpiCard'
import ChartCard from '../components/shared/ChartCard'
import ConnectedSystems from '../components/shared/ConnectedSystems'

const F = facilities as Facility[]
const CONN = connectedSystems as ConnectedSystemsByTab

const SEED_PROMPTS = [
  'Compare auto-rental conversion at our top 5 vs bottom 5 facilities',
  'Which markets have climate-controlled demand outstripping inventory?',
  'Walk me through how a new rental flows from website to SiteLink to Janus access codes',
  "Which 5 facilities are dragging the network's unit utilization down most?",
  'How would we operationalize the broken-chat fix across all 130 portals?',
  "What's driving the lead-follow-up SLA breach at the 5 facilities flagged in alerts?",
]

function heatColor(pct: number): string {
  // 95+ deep green, 85-95 green, 75-85 amber, 65-75 orange, <65 red
  if (pct >= 95) return 'bg-emerald-600 text-white'
  if (pct >= 85) return 'bg-emerald-400 text-emerald-900'
  if (pct >= 75) return 'bg-amber-300 text-amber-900'
  if (pct >= 65) return 'bg-orange-400 text-orange-900'
  return 'bg-red-400 text-red-900'
}

export default function OperationsTab() {
  const occupancy = useMemo(() => networkOccupancy(F), [])
  const states = useMemo(() => byState(F).sort((a, b) => b.units - a.units), [])
  const climateAvg = useMemo(() => {
    const total = F.reduce((sum, f) => sum + f.climateControlPct, 0)
    return total / F.length
  }, [])
  const autoConversion = useMemo(() => {
    const total = F.reduce((sum, f) => sum + f.leadToRentalPct, 0)
    return total / F.length
  }, [])

  const climateBuckets = useMemo(() => {
    const buckets = [
      { label: '0-25% climate', range: [0, 25] as const, count: 0 },
      { label: '25-50%', range: [25, 50] as const, count: 0 },
      { label: '50-75%', range: [50, 75] as const, count: 0 },
      { label: '75%+', range: [75, 101] as const, count: 0 },
    ]
    for (const f of F) {
      const b = buckets.find((b) => f.climateControlPct >= b.range[0] && f.climateControlPct < b.range[1])
      if (b) b.count += 1
    }
    return buckets
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Operations"
        subtitle="Live ops view — what Andrew and Brian see at 7am. Per-facility KPIs, climate-control mix, automated rental funnel."
        ownedBy={[
          { name: 'Andrew Capranos', role: 'President' },
          { name: 'Brian Oakley', role: 'Head of Technology' },
        ]}
      />

      <KpiStrip>
        <KpiCard label="Network occupancy" value={fmtPct(occupancy)} delta={0.6} caption="unit-weighted" />
        <KpiCard label="Avg unit utilization" value={fmtPct(occupancy - 1.2)} delta={-0.3} caption="across 53k units" />
        <KpiCard label="Auto-rental conversion" value={fmtPct(autoConversion)} delta={1.4} caption="online rental funnel" />
        <KpiCard label="Climate-controlled mix" value={fmtPct(climateAvg, 0)} delta={2.1} caption="of total unit inventory" />
      </KpiStrip>

      <ChartCard
        title="Network occupancy heatmap by state"
        subtitle="Static preview — live Metabase embed planned for Phase 7. SiteLink Connected Systems rail (below) reads live."
        height={300}
      >
        <div className="grid gap-2 grid-cols-3 md:grid-cols-6 lg:grid-cols-9 h-full content-start">
          {states.map((s) => (
            <div
              key={s.state}
              className={`rounded-lg p-2 flex flex-col items-center justify-center text-center ${heatColor(s.occupancyPct)}`}
              title={`${s.state}: ${s.count} facilities, ${s.units.toLocaleString()} units, ${fmtPct(s.occupancyPct)} occupancy`}
            >
              <div className="text-base font-bold leading-none">{s.state}</div>
              <div className="text-xs leading-tight mt-0.5">{fmtPct(s.occupancyPct, 0)}</div>
              <div className="text-[10px] opacity-80 leading-tight">{s.count} fac</div>
            </div>
          ))}
        </div>
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-10f-border bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-10f-border">
            <h3 className="text-sm font-semibold">Per-state ops summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-10f-text-muted border-b border-10f-border">
                  <th className="px-4 py-2">State</th>
                  <th className="px-4 py-2 text-right"># Facilities</th>
                  <th className="px-4 py-2 text-right">Units</th>
                  <th className="px-4 py-2 text-right">Occupancy</th>
                  <th className="px-4 py-2 text-right">Revenue (mo.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-10f-border">
                {states.slice(0, 8).map((s) => (
                  <tr key={s.state}>
                    <td className="px-4 py-2 font-medium">{s.state}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{s.count}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{s.units.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{fmtPct(s.occupancyPct)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{fmtCurrency(s.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-10f-border bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-10f-border">
            <h3 className="text-sm font-semibold">Climate-control inventory mix</h3>
          </div>
          <div className="p-4 space-y-3">
            {climateBuckets.map((b) => {
              const pct = (b.count / F.length) * 100
              return (
                <div key={b.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{b.label}</span>
                    <span className="text-10f-text-muted tabular-nums">{b.count} facilities</span>
                  </div>
                  <div className="h-2 rounded-full bg-10f-border overflow-hidden">
                    <div className="h-full bg-10f-red" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="px-4 pb-4 text-xs text-10f-text-muted">
            Climate-controlled units rent at ~30% premium per industry benchmarks. Skew matters.
          </div>
        </div>
      </div>

      <ConnectedSystems items={CONN.operations ?? []} />

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
