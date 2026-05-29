import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import facilities from '../data/facilities.json'
import funds from '../data/funds.json'
import connectedSystems from '../data/connectedSystems.json'
import type { Facility, Fund, ConnectedSystemsByTab } from '../lib/schemas'
import { networkRevenue } from '../lib/metrics'
import { fmtCurrency, fmtPct } from '../lib/format'
import { seededRandom } from '../lib/seededRandom'
import SectionHeader from '../components/shared/SectionHeader'
import KpiStrip from '../components/shared/KpiStrip'
import KpiCard from '../components/shared/KpiCard'
import ChartCard from '../components/shared/ChartCard'
import ConnectedSystems from '../components/shared/ConnectedSystems'

const F = facilities as Facility[]
const FUNDS = funds as Fund[]
const CONN = connectedSystems as ConnectedSystemsByTab

const SEED_PROMPTS = [
  "What's the 10FSSAC2 reconciliation status this quarter?",
  "When does Trent's next close run?",
  'Walk me through the SiteLink → QuickBooks revenue recognition pipeline',
  'Which 14 LPs are pending Q2 distributions and why is Plaid lagging?',
  "Compare per-fund NOI margins across 10FSSAC2 and 10FSSAC3",
  "Draft Trent's monthly close memo using today's reconciliation status",
]

const CLOSE_CHECKLIST = [
  { task: 'SiteLink revenue rollup pulled (130 facilities)', complete: true, owner: 'Automated' },
  { task: 'QuickBooks GL reconciled to SiteLink revenue', complete: true, owner: 'Trent + AI agent' },
  { task: 'Stessa property-level cash basis tied out', complete: true, owner: 'Automated' },
  { task: 'Plaid bank sync — 14 LP distribution accounts', complete: false, owner: 'Awaiting Plaid resolution' },
  { task: 'Mezz interest accrual posted (Opportunistic Offering)', complete: true, owner: 'Trent' },
  { task: 'Inter-fund transfers documented', complete: true, owner: 'Trent' },
  { task: 'Royalty accrual computed per facility', complete: false, owner: 'Blocked on bank sync' },
  { task: 'Variance memo drafted', complete: false, owner: 'Trent (Friday)' },
]

function buildRevExpSeries() {
  const rand = seededRandom(20260628)
  const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']
  return months.map((m) => {
    const revenue = 3_400_000 + rand() * 200_000
    const opex = revenue * (0.32 + rand() * 0.06)
    return {
      month: m,
      revenue: Math.round(revenue),
      opex: Math.round(opex),
      noi: Math.round(revenue - opex),
    }
  })
}

export default function AccountingTab() {
  const revenue = useMemo(() => networkRevenue(F), [])
  const noi = useMemo(() => FUNDS.reduce((s, f) => s + f.noi, 0), [])
  const revExpData = useMemo(() => buildRevExpSeries(), [])

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Accounting"
        subtitle="Trent's close calendar — multi-fund close, NOI tracking, distribution queue, SiteLink↔QuickBooks reconciliation."
        ownedBy={{ name: 'Trent Erickson', role: 'Head of Finance' }}
      />

      <KpiStrip>
        <KpiCard label="Network MRR" value={fmtCurrency(revenue)} delta={3.1} caption="trailing 30d, all funds" />
        <KpiCard label="Fund-level NOI (TTM)" value={fmtCurrency(noi)} delta={4.4} caption="across 10FSSAC2 + 10FSSAC3" />
        <KpiCard label="Days to close" value="3.2" delta={-1.1} deltaSuffix=" days" caption="vs prior quarter avg" />
        <KpiCard label="Distribution queue" value="14" delta={6} deltaSuffix=" LPs" caption="pending Q2 payouts" />
      </KpiStrip>

      <ChartCard title="Network revenue vs operating expense" subtitle="$M per month · last 6 months" height={320}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revExpData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" tickLine={false} fontSize={12} />
            <YAxis tickFormatter={(v) => `$${((v as number) / 1_000_000).toFixed(1)}M`} tickLine={false} fontSize={12} />
            <Tooltip formatter={(v) => fmtCurrency(v as number)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" fill="#C8102E" name="Revenue" />
            <Bar dataKey="opex" fill="#9CA3AF" name="OpEx" />
            <Bar dataKey="noi" fill="#10B981" name="NOI" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-10f-border bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-10f-border">
            <h3 className="text-sm font-semibold">Fund accounting summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-10f-text-muted border-b border-10f-border">
                  <th className="px-4 py-2">Fund</th>
                  <th className="px-4 py-2 text-right">NOI (TTM)</th>
                  <th className="px-4 py-2 text-right">Distributions</th>
                  <th className="px-4 py-2 text-right">Mezz Out.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-10f-border">
                {FUNDS.map((f) => (
                  <tr key={f.id}>
                    <td className="px-4 py-2 font-medium">{f.name}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{fmtCurrency(f.noi)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{fmtCurrency(f.distributionsPaid)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{f.mezzOutstanding > 0 ? fmtCurrency(f.mezzOutstanding) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-10f-border bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-10f-border flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold">Trent's close calendar — Q2 2026</h3>
            <span className="text-xs text-10f-text-muted">{CLOSE_CHECKLIST.filter(c => c.complete).length}/{CLOSE_CHECKLIST.length} complete</span>
          </div>
          <ul className="divide-y divide-10f-border">
            {CLOSE_CHECKLIST.map((c) => (
              <li key={c.task} className="px-4 py-2.5 text-sm flex items-start gap-3">
                <span
                  className={`mt-0.5 h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center text-xs ${
                    c.complete
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-10f-border text-transparent'
                  }`}
                >
                  ✓
                </span>
                <div className="flex-1 min-w-0">
                  <div className={c.complete ? 'line-through text-10f-text-muted' : 'font-medium'}>{c.task}</div>
                  <div className="text-xs text-10f-text-muted">{c.owner}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ConnectedSystems items={CONN.accounting ?? []} />

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
// silence unused warnings
void fmtPct
