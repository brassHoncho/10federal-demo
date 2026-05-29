import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import facilities from '../data/facilities.json'
import alerts from '../data/alerts.json'
import leads from '../data/leads.json'
import type { Facility, Alert, Lead } from '../lib/schemas'
import {
  networkOccupancy,
  networkRevenue,
  totalUnits,
  topNByOccupancy,
  bottomNByOccupancy,
  byBrand,
} from '../lib/metrics'
import { fmtCompact, fmtCurrency, fmtPct, fmtRelativeTime } from '../lib/format'
import { seededRandom } from '../lib/seededRandom'
import SectionHeader from '../components/shared/SectionHeader'
import KpiStrip from '../components/shared/KpiStrip'
import KpiCard from '../components/shared/KpiCard'
import ChartCard from '../components/shared/ChartCard'
import Leaderboard from '../components/shared/Leaderboard'
import AlertCard from '../components/shared/AlertCard'

const F = facilities as Facility[]
const A = alerts as Alert[]
const L = leads as Lead[]

const BRAND_COLORS: Record<string, string> = {
  '10 Federal Storage': '#C8102E',
  'Storage Depot': '#0EA5E9',
  'Big Guy Storage': '#A78BFA',
  'Carolina Secure Storage': '#10B981',
  'Self Storage Max': '#F59E0B',
}

const SEED_PROMPTS = [
  'Which facilities are losing occupancy this week and why?',
  'Walk me through how a new rental flows from website to SiteLink to QuickBooks',
  'Compare lead-to-rental conversion across our 5 sub-brands',
  'What\'s the network occupancy delta vs the same week last year?',
  'Which markets are underperforming pro forma after acquisition?',
  'Draft a Capranos-ready weekly ops summary using today\'s data',
]

type DayPoint = { day: number } & Record<string, number>

function buildRevenueSeries(facilities: Facility[]): DayPoint[] {
  const days = 30
  const baselineByBrand = byBrand(facilities).reduce<Record<string, number>>((acc, b) => {
    acc[b.brand] = b.revenue / 30
    return acc
  }, {})
  const series: DayPoint[] = []
  const rand = seededRandom(20260529)
  for (let i = 0; i < days; i++) {
    const point: DayPoint = { day: i + 1 } as DayPoint
    for (const [brand, baseline] of Object.entries(baselineByBrand)) {
      const variance = 0.85 + rand() * 0.3
      point[brand] = Math.round(baseline * variance)
    }
    series.push(point)
  }
  return series
}

export default function OverviewTab() {
  const [enabledBrands, setEnabledBrands] = useState<Record<string, boolean>>({
    '10 Federal Storage': true,
    'Storage Depot': true,
    'Big Guy Storage': true,
    'Carolina Secure Storage': true,
    'Self Storage Max': true,
  })

  const data = useMemo(() => buildRevenueSeries(F), [])
  const occupancyPct = useMemo(() => networkOccupancy(F), [])
  const totalRevenue = useMemo(() => networkRevenue(F), [])
  const units = useMemo(() => totalUnits(F), [])
  const top = useMemo(() => topNByOccupancy(F, 10), [])
  const bottom = useMemo(() => bottomNByOccupancy(F, 10), [])
  const recentLeads = useMemo(() => [...L].sort((a, b) => a.minutesAgo - b.minutesAgo), [])

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Network Overview"
        subtitle="130 facilities · 17 states · 5 sub-brands · <100 employees. One operational view."
      />

      <KpiStrip>
        <KpiCard
          label="Total facilities"
          value={F.length.toString()}
          delta={0.0}
          caption="2 in lease-up · 14 recent acquisitions"
        />
        <KpiCard
          label="Total units"
          value={fmtCompact(units)}
          delta={2.4}
          caption="weighted-avg unit count"
        />
        <KpiCard
          label="Network occupancy"
          value={fmtPct(occupancyPct)}
          delta={0.6}
          caption="unit-weighted across network"
        />
        <KpiCard
          label="Monthly revenue"
          value={fmtCurrency(totalRevenue)}
          delta={3.1}
          caption="trailing 30d"
        />
      </KpiStrip>

      <ChartCard
        title="Daily revenue share across 130 facilities"
        subtitle="Last 30 days — toggle sub-brands to isolate"
        filters={
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.keys(enabledBrands).map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() =>
                  setEnabledBrands((s) => ({ ...s, [brand]: !s[brand] }))
                }
                className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                  enabledBrands[brand]
                    ? 'border-10f-text bg-10f-text text-white'
                    : 'border-10f-border text-10f-text-muted'
                }`}
              >
                {brand.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        }
        height={340}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" tickLine={false} fontSize={12} />
            <YAxis tickFormatter={(v) => fmtCompact(v as number)} tickLine={false} fontSize={12} />
            <Tooltip formatter={(v) => fmtCurrency(v as number)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {Object.entries(BRAND_COLORS).map(([brand, color]) =>
              enabledBrands[brand] ? (
                <Line
                  key={brand}
                  type="monotone"
                  dataKey={brand}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                />
              ) : null,
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <Leaderboard
          title="Top 10 facilities by occupancy"
          tone="up"
          rows={top.map((f, i) => ({
            rank: i + 1,
            name: f.name,
            subtitle: `${f.city}, ${f.state} · ${f.brand}`,
            metricLabel: fmtPct(f.occupancyPct),
            delta: 0.4 + i * 0.05,
          }))}
        />
        <Leaderboard
          title="Bottom 10 facilities by occupancy"
          tone="down"
          rows={bottom.map((f, i) => ({
            rank: i + 1,
            name: f.name,
            subtitle: `${f.city}, ${f.state} · ${f.brand}`,
            metricLabel: fmtPct(f.occupancyPct),
            delta: -(0.8 - i * 0.05),
          }))}
        />
      </div>

      <section>
        <h3 className="text-sm font-semibold mb-3">Active alerts</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {A.map((a) => (
            <AlertCard
              key={a.id}
              severity={a.severity}
              message={a.message}
              timestampMinutesAgo={a.timestampMinutesAgo}
              tab={a.tab}
              askPrompt={a.askPrompt}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold mb-3">Recent rentals & leads</h3>
        <div className="rounded-xl border border-10f-border bg-white shadow-sm divide-y divide-10f-border">
          {recentLeads.map((lead) => (
            <div key={lead.id} className="px-4 py-3 flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm">
              <span className="text-xs text-10f-text-muted w-20 shrink-0 tabular-nums">
                {fmtRelativeTime(lead.minutesAgo)}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-10f-surface border border-10f-border text-10f-text-muted shrink-0">
                {lead.channel}
              </span>
              <span className="flex-1">{lead.inquiry}</span>
              <span className="text-xs text-10f-text-muted">→ {lead.routing}</span>
            </div>
          ))}
        </div>
      </section>

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
