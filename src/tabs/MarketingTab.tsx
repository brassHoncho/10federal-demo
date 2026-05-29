import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import facilities from '../data/facilities.json'
import leads from '../data/leads.json'
import leadTemplates from '../data/leadTemplates.json'
import connectedSystems from '../data/connectedSystems.json'
import type { Facility, Lead, LeadTemplate, ConnectedSystemsByTab } from '../lib/schemas'
import { byBrand, networkRevenue } from '../lib/metrics'
import { fmtCompact, fmtCurrency, fmtPct, fmtRelativeTime } from '../lib/format'
import { seededRandom } from '../lib/seededRandom'
import SectionHeader from '../components/shared/SectionHeader'
import KpiStrip from '../components/shared/KpiStrip'
import KpiCard from '../components/shared/KpiCard'
import ChartCard from '../components/shared/ChartCard'
import ConnectedSystems from '../components/shared/ConnectedSystems'

const F = facilities as Facility[]
const L = leads as Lead[]
const T = leadTemplates as LeadTemplate[]
const CONN = connectedSystems as ConnectedSystemsByTab

const SEED_PROMPTS = [
  'Why is CPL up 24% in Carolina markets this month?',
  'Compare lead-to-rental across the 5 sub-brands',
  'Which paid keywords are driving the climate-controlled inquiries?',
  'Draft 3 ad creative variants for the Dripping Springs lease-up',
  'Where is GoHighLevel routing wasted leads we could recover?',
  'Sketch a brand-portfolio Klaviyo flow for the Carolina Secure Storage tenants',
]

const CHANNEL_COLORS = {
  'Paid Ads': '#C8102E',
  Organic: '#0EA5E9',
  Referrals: '#10B981',
  'Walk-In': '#A78BFA',
}

function buildChannelSeries(): { day: number } & Record<string, number>[] {
  const rand = seededRandom(20260612)
  const series = []
  for (let i = 0; i < 30; i++) {
    series.push({
      day: i + 1,
      'Paid Ads': Math.round(180 + rand() * 60),
      Organic: Math.round(140 + rand() * 50),
      Referrals: Math.round(60 + rand() * 25),
      'Walk-In': Math.round(40 + rand() * 20),
    })
  }
  return series as unknown as { day: number } & Record<string, number>[]
}

export default function MarketingTab() {
  const channelData = useMemo(() => buildChannelSeries(), [])
  const brands = useMemo(() => byBrand(F), [])
  const totalLeads7d = 1242
  const cpl = 18.40
  const leadToRental = useMemo(() => {
    return F.reduce((sum, f) => sum + f.leadToRentalPct, 0) / F.length
  }, [])

  // CPL by state — show top 8 by lead volume
  const cplByState = useMemo(() => {
    const rand = seededRandom(20260620)
    const states = Array.from(new Set(F.map((f) => f.state)))
    return states
      .map((s) => ({
        state: s,
        cpl: 12 + rand() * 18,
        leads: Math.floor(20 + rand() * 80),
      }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 8)
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Marketing"
        subtitle="Per-brand mix across 10F, Storage Depot, Big Guy, Carolina Secure, Self Storage Max. Channel performance, CPL by market, lead funnel."
      />

      <KpiStrip>
        <KpiCard label="Leads (trailing 7d)" value={totalLeads7d.toLocaleString()} delta={4.2} caption="across all sub-brands" />
        <KpiCard label="CPL" value={`$${cpl.toFixed(2)}`} delta={-2.6} caption="blended paid + walk-in" />
        <KpiCard label="Lead-to-rental" value={fmtPct(leadToRental)} delta={1.1} caption="conversion through SiteLink" />
        <KpiCard label="Network revenue (mo.)" value={fmtCurrency(networkRevenue(F))} delta={3.1} caption="all brands combined" />
      </KpiStrip>

      <ChartCard
        title="Channel performance — leads per day"
        subtitle="Last 30 days · stacked area · Paid / Organic / Referrals / Walk-In"
        height={320}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={channelData as never}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" tickLine={false} fontSize={12} />
            <YAxis tickLine={false} fontSize={12} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {Object.entries(CHANNEL_COLORS).map(([channel, color]) => (
              <Area
                key={channel}
                type="monotone"
                dataKey={channel}
                stackId="1"
                stroke={color}
                fill={color}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-10f-border bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-10f-border">
            <h3 className="text-sm font-semibold">Brand portfolio — performance split</h3>
          </div>
          <ul className="divide-y divide-10f-border">
            {brands.map((b) => (
              <li key={b.brand} className="px-5 py-3 text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-medium">{b.brand}</div>
                  <span className="text-xs text-10f-text-muted">{b.count} facilities</span>
                </div>
                <div className="flex items-baseline gap-4 mt-1 text-xs text-10f-text-muted">
                  <span>{fmtCompact(b.units)} units</span>
                  <span>{fmtPct(b.occupancyPct)} occupied</span>
                  <span className="ml-auto font-medium text-10f-text tabular-nums">
                    {fmtCurrency(b.revenue)}/mo
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-10f-border bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-10f-border">
            <h3 className="text-sm font-semibold">CPL by market (top 8 by lead volume)</h3>
          </div>
          <ul className="divide-y divide-10f-border">
            {cplByState.map((s) => (
              <li key={s.state} className="px-5 py-3 text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-medium">{s.state}</div>
                  <span className="text-xs text-10f-text-muted">{s.leads} leads/wk</span>
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-10f-border overflow-hidden">
                    <div className="h-full bg-10f-red" style={{ width: `${Math.min(s.cpl * 3, 100)}%` }} />
                  </div>
                  <span className="text-xs font-medium tabular-nums w-16 text-right">${s.cpl.toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-10f-border bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-10f-border">
            <h3 className="text-sm font-semibold">Recent inbound leads</h3>
          </div>
          <ul className="divide-y divide-10f-border max-h-96 overflow-y-auto">
            {[...L].sort((a, b) => a.minutesAgo - b.minutesAgo).map((lead) => (
              <li key={lead.id} className="px-4 py-2.5 text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-10f-text-muted whitespace-nowrap">{fmtRelativeTime(lead.minutesAgo)}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-10f-surface border border-10f-border text-10f-text-muted">
                    {lead.channel}
                  </span>
                </div>
                <div className="mt-0.5">{lead.inquiry}</div>
                <div className="text-xs text-10f-text-muted mt-0.5">→ {lead.routing}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-10f-border bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-10f-border">
            <h3 className="text-sm font-semibold">Lead templates — inquiry shapes</h3>
          </div>
          <ul className="divide-y divide-10f-border max-h-96 overflow-y-auto">
            {T.map((t) => (
              <li key={t.id} className="px-4 py-2.5 text-sm">
                <div className="font-medium">{t.inquiry}</div>
                <div className="flex items-baseline gap-3 mt-0.5 text-xs text-10f-text-muted">
                  <span>{t.category}</span>
                  <span>· {fmtPct(t.routedToFlagshipPct, 0)} to flagship</span>
                  <span className="ml-auto">last seen {fmtRelativeTime(t.lastSeenMinutesAgo)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ConnectedSystems items={CONN.marketing ?? []} />

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
