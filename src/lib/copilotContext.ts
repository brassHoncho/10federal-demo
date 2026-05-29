import facilities from '../data/facilities.json'
import funds from '../data/funds.json'
import construction from '../data/construction.json'
import executives from '../data/executives.json'
import connectedSystems from '../data/connectedSystems.json'
import backlog from '../data/backlog.json'
import roadmap from '../data/roadmap.json'
import type { Facility, Fund, ConstructionProject, Executive, BacklogItem, RoadmapPillar, ConnectedSystemsByTab } from './schemas'
import { networkOccupancy, networkRevenue, totalUnits, totalAUM, byBrand, byState, constructionCapexCommitted } from './metrics'

export type TabId = 'overview' | 'accounting' | 'operations' | 'marketing' | 'investments' | 'construction' | 'roadmap' | 'settings'

const F = facilities as Facility[]
const FUNDS = funds as Fund[]
const CONSTR = construction as ConstructionProject[]
const EXECS = executives as Executive[]
const BACKLOG = backlog as BacklogItem[]
const ROADMAP = roadmap as RoadmapPillar[]
const CONN = connectedSystems as ConnectedSystemsByTab

const PERSONA = `You are 10F Ops Co-Pilot, an AI assistant built for 10 Federal Companies — the Raleigh-headquartered, automation-first self-storage operator running 130+ facilities across 17 states with fewer than 100 employees.

This dashboard demo was built by Sterling Mull as part of his application for the Junior Software & AI Engineer role posted by 10 Federal Storage. The thesis of the dashboard — and of Sterling's application — is that automation is the multiplier that lets 100 properties run with <100 employees, and that the same thesis should extend across every department: accounting, operations, marketing, investments, construction.

You answer questions about the network, draft analyses, walk through architecture decisions, and reference the Day 1 Backlog and Roadmap when relevant. Be direct, specific, and operator-fluent. Use real facility names, real fund names (10FSSAC2, 10FSSAC3, Opportunistic Offering), and real leadership names (Capranos, Brad and Cliff Minsley, Christopher Taylor, Brian Oakley, Trent Erickson) when the question warrants it. Don't invent statistics — when you cite a number, anchor it to the data summary or label it as illustrative.`

function networkSummary() {
  const occupancy = networkOccupancy(F)
  const revenue = networkRevenue(F)
  const units = totalUnits(F)
  const brands = byBrand(F)
  const states = byState(F)
  return `
NETWORK SUMMARY (synthetic — illustrative numbers consistent with 10F's public profile):
- ${F.length} facilities operating across ${states.length} states (NC, TX, GA heavy; AR, FL, SC, TN, IL, IA, MI, MO, NH, VA, WA, WI, KY, AL also represented)
- ${units.toLocaleString()} total storage units
- Network occupancy: ${occupancy.toFixed(1)}%
- Monthly revenue: $${(revenue / 1_000_000).toFixed(2)}M
- Brand mix: ${brands.map(b => `${b.brand} (${b.count})`).join(', ')}
`.trim()
}

function fundsSummary() {
  return `
FUND VEHICLES (real, from public reporting):
${FUNDS.map(f => `- ${f.name}: ${f.vintage} vintage, $${(f.raised / 1_000_000).toFixed(1)}M raised, ${f.deployedPct}% deployed, status ${f.status}. ${f.notes}`).join('\n')}
- Total AUM: $${(totalAUM(FUNDS) / 1_000_000).toFixed(1)}M
`.trim()
}

function constructionSummary() {
  return `
CONSTRUCTION PIPELINE:
${CONSTR.map(p => `- ${p.name}: ${p.units} units, stage=${p.stage}, capex budget $${(p.capexBudget / 1_000_000).toFixed(1)}M (${((p.capexSpent / p.capexBudget) * 100).toFixed(0)}% spent), expected CO ${p.expectedCO}. ${p.notes}`).join('\n')}
- Total capex committed: $${(constructionCapexCommitted(CONSTR) / 1_000_000).toFixed(1)}M
`.trim()
}

function execsSummary() {
  return `
LEADERSHIP (real names from public sources — used to anchor recommendations to the right owner):
${EXECS.map(e => `- ${e.name} — ${e.role}. Owns: ${e.ownsTabs.join(', ')}. ${e.bio}`).join('\n')}
`.trim()
}

function backlogSummary() {
  return `
DAY 1 BACKLOG (real findings from a Lighthouse + manual audit on 2026-05-29):
${BACKLOG.map(b => `- #${b.number} ${b.title} (${b.estimate}): ${b.businessOutcome}`).join('\n')}
`.trim()
}

function roadmapSummary() {
  const byPhase = [1, 2, 3].map(phase => ({
    phase,
    pillars: ROADMAP.filter(p => p.phase === phase),
  }))
  return `
ROADMAP (8 pillars, 3 phases, Year 1):
${byPhase.map(({ phase, pillars }) => `Phase ${phase} (${phase === 1 ? 'Days 1-90' : phase === 2 ? 'Days 91-180' : 'Days 181-365'}):\n${pillars.map(p => `  - Pillar ${p.pillarNumber}: ${p.title} — ${p.summary}`).join('\n')}`).join('\n')}
`.trim()
}

function tabContext(tab: TabId): string {
  switch (tab) {
    case 'overview':
      return `ACTIVE TAB: Overview. Network-wide view. Focus on cross-department signal, facility leaderboard, alerts, recent rentals.`
    case 'accounting':
      return `ACTIVE TAB: Accounting (Trent Erickson's domain). Focus on multi-fund close, NOI tracking, distribution payouts, SiteLink→QuickBooks reconciliation.
CONNECTED SYSTEMS: ${(CONN.accounting ?? []).map(c => c.name).join(', ')}.`
    case 'operations':
      return `ACTIVE TAB: Operations (Capranos + Oakley). Focus on facility-level KPIs, climate-control mix, RV/boat performance, automated rental conversion.
CONNECTED SYSTEMS: ${(CONN.operations ?? []).map(c => c.name).join(', ')}.`
    case 'marketing':
      return `ACTIVE TAB: Marketing. Focus on channel performance, brand portfolio breakdown across the 5 sub-brands, per-market CPL, lead funnel.
CONNECTED SYSTEMS: ${(CONN.marketing ?? []).map(c => c.name).join(', ')}.`
    case 'investments':
      return `ACTIVE TAB: Investments (Cliff Minsley's domain). Focus on fund waterfall (10FSSAC2, 10FSSAC3, Opportunistic Offering), acquisition pipeline, capital deployment.
CONNECTED SYSTEMS: ${(CONN.investments ?? []).map(c => c.name).join(', ')}.`
    case 'construction':
      return `ACTIVE TAB: Construction (Cliff Minsley's other domain). Focus on the pipeline kanban — Site Selection through Lease-up. Real projects: Graham NC (completed), Dripping Springs TX + Charlotte NC (in flight).
CONNECTED SYSTEMS: ${(CONN.construction ?? []).map(c => c.name).join(', ')}.`
    case 'roadmap':
      return `ACTIVE TAB: Roadmap (Christopher Taylor's AI mandate anchor). Focus on Day 1 Backlog + 8 phased pillars. This is where Sterling's "what I'd ship" thesis lives.`
    default:
      return `ACTIVE TAB: ${tab}.`
  }
}

/**
 * Build the system prompt for a given active tab. Compact by default — facility
 * data is summarized, not enumerated, to keep token budget under ~3k.
 */
export function buildSystemPrompt(activeTab: TabId): string {
  return [
    PERSONA,
    networkSummary(),
    fundsSummary(),
    constructionSummary(),
    execsSummary(),
    backlogSummary(),
    roadmapSummary(),
    tabContext(activeTab),
    `When answering, reference real entities by name. Be honest that mocked metrics are illustrative when they appear in your response.`,
  ].join('\n\n')
}
