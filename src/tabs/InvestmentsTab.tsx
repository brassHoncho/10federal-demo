import { useMemo } from 'react'
import funds from '../data/funds.json'
import construction from '../data/construction.json'
import connectedSystems from '../data/connectedSystems.json'
import type { Fund, ConstructionProject, ConnectedSystemsByTab } from '../lib/schemas'
import { totalAUM, totalMezzOutstanding, fundDeployedDollars } from '../lib/metrics'
import { fmtCompact, fmtCurrency, fmtPct } from '../lib/format'
import SectionHeader from '../components/shared/SectionHeader'
import KpiStrip from '../components/shared/KpiStrip'
import KpiCard from '../components/shared/KpiCard'
import ConnectedSystems from '../components/shared/ConnectedSystems'

const FUNDS = funds as Fund[]
const CONSTR = construction as ConstructionProject[]
const CONN = connectedSystems as ConnectedSystemsByTab

const SEED_PROMPTS = [
  "What's the IRR profile of the Arkansas 7-facility acquisition vs pro forma?",
  'Where should the next Opportunistic Offering tranche deploy?',
  'Compare 10FSSAC2 vs 10FSSAC3 deployment pace and what we learned',
  'Walk me through the Opportunistic Offering subscription pipeline this quarter',
  'Which markets show the strongest signal for the next acquisition?',
  "Draft an LP update covering this quarter's distributions and pipeline",
]

const STATUS_PILL: Record<Fund['status'], string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-slate-100 text-slate-700 border-slate-200',
  fundraising: 'bg-amber-50 text-amber-700 border-amber-200',
}

const TRANSACTIONS = [
  { id: 't1', date: '2026-01-27', kind: 'Acquisition', detail: 'Arkansas 7-facility portfolio (2,730 units, 487,652 NRSF) · 10FSSAC3', amount: 18400000 },
  { id: 't2', date: '2025-08-13', kind: 'Disposition', detail: 'Mountaineer Village Apartments · Boone NC student housing · 6.03x equity multiple, 25.6% gross IRR (held 9.5 years)', amount: 68500000 },
  { id: 't3', date: '2025-07-15', kind: 'Fundraise', detail: 'Opportunistic Offering Q2 add-on close · $150M target', amount: 28000000 },
  { id: 't4', date: '2025-05-08', kind: 'Acquisition', detail: 'Keller TX 3-property portfolio (177,353 NRSF) · 10FSSAC4 · "significantly below replacement value"', amount: 16800000 },
  { id: 't5', date: '2025-04-22', kind: 'Credit facility', detail: 'First Horizon Bank line · 10FSSAC4 acquisitions + Opportunistic dev', amount: 100000000 },
]

const PIPELINE = [
  { id: 'p1', target: 'Wisconsin bolt-on (Pewaukee adjacency, 3 facilities)', stage: 'Under LOI', proforma: 'IRR 16.2%', size: 14500000 },
  { id: 'p2', target: 'Oklahoma City urban portfolio (2 facilities)', stage: 'Diligence', proforma: 'IRR 18.4%', size: 11200000 },
  { id: 'p3', target: 'Suburban Atlanta Class-A development site', stage: 'Term sheet', proforma: 'IRR 17.1%', size: 31000000 },
  { id: 'p4', target: 'Savannah GA bolt-on (Richmond Hill adjacency)', stage: 'Sourced', proforma: 'IRR 15.6%', size: 9800000 },
]

export default function InvestmentsTab() {
  const aum = useMemo(() => totalAUM(FUNDS), [])
  const mezz = useMemo(() => totalMezzOutstanding(FUNDS), [])
  const capDeployedYTD = useMemo(() =>
    FUNDS.reduce((sum, f) => sum + fundDeployedDollars(f), 0)
  , [])
  const activeFunds = FUNDS.filter((f) => f.status !== 'closed').length

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Investments"
        subtitle="Cliff's pipeline — what's under LOI, what's deploying, what's distributing."
        ownedBy={{ name: 'Cliff Minsley', role: 'Co-Founder, Principal' }}
      />

      <KpiStrip>
        <KpiCard label="Total AUM" value={fmtCurrency(aum)} caption="4 funds · 17 states · +$100M credit facility" />
        <KpiCard label="Active funds" value={activeFunds.toString()} caption="excludes closed-out vehicles" />
        <KpiCard label="Mezz outstanding" value={fmtCurrency(mezz)} caption="across active funds" />
        <KpiCard label="Capital deployed (cumulative)" value={fmtCurrency(capDeployedYTD)} caption={`across ${FUNDS.length} vehicles`} />
      </KpiStrip>

      <section>
        <h3 className="text-sm font-semibold mb-3">Fund waterfall</h3>
        <div className="grid gap-3 lg:grid-cols-3">
          {FUNDS.map((f) => (
            <article key={f.id} className="rounded-xl border border-10f-border bg-white p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-base leading-tight">{f.name}</h4>
                  <div className="text-xs text-10f-text-muted mt-0.5">{f.vintage} vintage</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${STATUS_PILL[f.status]}`}>
                  {f.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <div className="text-xs text-10f-text-muted">Raised</div>
                  <div className="font-medium tabular-nums">{fmtCurrency(f.raised)}</div>
                </div>
                <div>
                  <div className="text-xs text-10f-text-muted">Deployed</div>
                  <div className="font-medium tabular-nums">{fmtPct(f.deployedPct, 0)}</div>
                </div>
                <div>
                  <div className="text-xs text-10f-text-muted">IRR</div>
                  <div className="font-medium tabular-nums">{f.irr > 0 ? fmtPct(f.irr) : '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-10f-text-muted">NOI (TTM)</div>
                  <div className="font-medium tabular-nums">{fmtCurrency(f.noi)}</div>
                </div>
                <div>
                  <div className="text-xs text-10f-text-muted">Distributions</div>
                  <div className="font-medium tabular-nums">{fmtCurrency(f.distributionsPaid)}</div>
                </div>
                <div>
                  <div className="text-xs text-10f-text-muted">Mezz out.</div>
                  <div className="font-medium tabular-nums">{f.mezzOutstanding > 0 ? fmtCurrency(f.mezzOutstanding) : '—'}</div>
                </div>
              </div>
              <p className="text-xs text-10f-text-muted italic leading-relaxed border-t border-10f-border pt-3">
                {f.notes}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-5">
        <div className="flex items-baseline gap-3 mb-2 flex-wrap">
          <h3 className="text-base font-semibold">Opportunistic Offering — subscription tracker</h3>
          <span className="text-xs text-amber-700">Q3 2024 first close $25M + Q2 2025 add-on $28M · $150M target · Led by Essentia Capital Partners</span>
        </div>
        <div className="mt-3 h-3 rounded-full bg-amber-100 overflow-hidden">
          <div className="h-full bg-amber-500" style={{ width: '35.3%' }} />
        </div>
        <div className="flex justify-between text-xs text-amber-800 mt-1">
          <span>$53M committed</span>
          <span>$97M remaining to target</span>
        </div>
        <p className="text-xs text-amber-800 mt-3">
          Ground-up Class-A multi-story focus. Funding 8 named development sites including Georgetown TX (Q3 2025 CO), Dripping Springs TX, Charlotte NC, and the GA quartet (Richmond Hill, Villa Rica, Temple). Mezz equity tranche partially deployed; next tranche close projected Q3 2026.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-10f-border bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-10f-border">
            <h3 className="text-sm font-semibold">Acquisition pipeline</h3>
          </div>
          <ul className="divide-y divide-10f-border">
            {PIPELINE.map((p) => (
              <li key={p.id} className="px-5 py-3 text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-medium">{p.target}</div>
                  <span className="text-xs text-10f-text-muted whitespace-nowrap">{p.stage}</span>
                </div>
                <div className="text-xs text-10f-text-muted mt-1">
                  Pro forma {p.proforma} · est. size {fmtCurrency(p.size)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-10f-border bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-10f-border">
            <h3 className="text-sm font-semibold">Recent transactions</h3>
          </div>
          <ul className="divide-y divide-10f-border">
            {TRANSACTIONS.map((t) => (
              <li key={t.id} className="px-5 py-3 text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-medium">{t.kind}</div>
                  <span className="text-xs text-10f-text-muted tabular-nums">{t.date}</span>
                </div>
                <div className="text-xs text-10f-text-muted mt-1">{t.detail}</div>
                <div className="text-xs font-medium tabular-nums mt-1">{fmtCurrency(t.amount)}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ConnectedSystems items={CONN.investments ?? []} />

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
void CONSTR
void fmtCompact
