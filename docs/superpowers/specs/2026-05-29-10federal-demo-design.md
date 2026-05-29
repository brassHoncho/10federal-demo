# 10federal.sterlingmull.com — Demo Design Spec

**Date:** 2026-05-29
**Author:** Sterling Mull
**Target role:** Junior Software & AI Engineer, 10 Federal Storage (Raleigh, NC) — [Indeed listing](https://to.indeed.com/aatpvzfpqcyw)
**Demo URL:** `10federal.sterlingmull.com`
**Pattern source:** `aesthetic.sterlingmull.com` (replicated structure, retargeted content)

---

## 1. Intent

A single-page, Aesthetic-pattern operational dashboard for 10 Federal Companies, demonstrating Sterling's fit for the Junior Software & AI Engineer role. The demo's thesis: *automation as multiplier — the operating system that lets 100 properties run with <100 employees, extended across every department.*

The demo must communicate three things to Andrew Capranos (President), Christopher Taylor (Chief AI Officer), Brian Oakley (Tech), and the hiring chain:

1. **Pattern-match the JD.** Hit every named responsibility (website, web app, marketing tech support, internal tools, automation & integration, AI workflows across accounting/operations/marketing/investments/construction).
2. **Prove the homework.** Use real facility data, real fund names, real construction projects, real leadership names, real industry-standard tool names (SiteLink, Juniper Square, Procore, GoHighLevel).
3. **Show the operator's eye.** A Day 1 Backlog of concrete, evidence-based improvements found by actually using their site and running real audits.

---

## 2. Stack

Identical to `aesthetic.sterlingmull.com`:

- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Charts:** Recharts
- **AI chat:** Vercel AI SDK + Anthropic Claude Sonnet 4.6
- **Hosting:** Vercel (serverless API route for chat)
- **Live embed (one):** Metabase iframe (Operations tab) backed by seeded SQLite

---

## 3. Information Architecture

8 tabs in top nav, single-scroll Aesthetic-style layout per tab:

| Tab | Owner mapping (10F exec) | Anchor content |
|---|---|---|
| **Overview** | Capranos (President) | Network leaderboard of 130+ facilities, KPI strip, daily revenue chart with brand filter, cross-department alerts feed |
| **Accounting** | Trent Erickson | Multi-fund close calendar, 10FSSAC2/3/Opportunistic NOI tracking, revenue vs opex by month, distribution payout queue |
| **Operations** | Capranos / Oakley | Network occupancy + unit utilization KPIs, **live Metabase facility heatmap embed**, RV/boat/vehicle performance, per-facility drill-down |
| **Marketing** | Marketing team | Trailing-7-day lead funnel, channel mix (Paid/Organic/Referrals/Walk-In), brand portfolio breakdown across 5 sub-brands, lead templates |
| **Investments** | Cliff Minsley | Fund waterfall (10FSSAC2 → 3 → Opportunistic with IRR / deployed % / vintage), acquisition pipeline, Opportunistic Offering subscription tracker |
| **Construction** | Cliff Minsley | Pipeline kanban (Site Selection → Entitlement → Permitting → Construction → Punch List → CO → Lease-up), active projects table, capex burn chart |
| **Roadmap** | Christopher Taylor / Oakley | 8-pillar phased plan + Day 1 Backlog prelude |
| **Settings** | — | Light, same as Aesthetic |

Every tab carries a **Connected Systems rail** showing the real industry-standard tools 10F would integrate (SiteLink, Juniper Square, QuickBooks Online, Stessa, GoHighLevel, Google Ads, Meta Ads, GA4, Procore, ClickUp, etc.) with last-sync timestamps and health pills. The rail is mocked but specifically named — *naming SiteLink is the homework signal.*

Persistent **"10F Ops Co-Pilot"** chat box at the bottom of every page with department-specific seed prompts.

---

## 4. Data Model

### Real, hardcoded (from research)

- **~116 facilities publicly listed** on 10federalstorage.com, distributed across 17 states (NC: 30, TX: 34, GA: 15, AR: 5, CO: 2, FL: 2, IL: 4, IA: 2, MI: 1, MO: 2, NH: 2, SC: 7, TN: 5, VA: 1, WA: 2, WI: 2). Per 10F's January 2026 public statement they operate **130+ facilities** — the delta is recently-acquired or in-development properties not yet on the marketing site. Demo uses the ~116 publicly-listed names verbatim + 14 mocked "recent acquisition" entries that flow into the Investments tab acquisition pipeline, reaching the 130+ headline number while keeping every named facility verifiable.
- **5 brand portfolio:** 10 Federal Storage, Storage Depot, Big Guy Storage, Carolina Secure Storage, Self Storage Max
- **3 fund vehicles:**
  - 10FSSAC2 ($32M raised, oversubscribed, 26 acquisitions, 7,500+ units)
  - 10FSSAC3 ($7.4M from 128 investors)
  - Opportunistic Offering ($25M first close, led by Essentia Capital, mezz equity, ground-up focus)
- **3 construction projects:** Graham NC (completed, 155-unit, first ground-up), Dripping Springs TX (in pipeline), Charlotte NC (in pipeline)
- **6 named executives:** Andrew Capranos (President), Brad Minsley (Co-Founder), Cliff Minsley (Co-Founder, investments + construction), Christopher Taylor (Chief AI Officer), Brian Oakley (Tech), Trent Erickson (Finance)
- **Real industry tools** in Connected Systems rails (per-tab list below)

### Mocked (Faker-style, deterministic seed)

- Per-facility revenue / occupancy / lead-to-rental %
- Fund IRRs, deployed capital %, mezz equity outstanding
- Construction milestone progress %, capex burn
- 6-10 cross-department operational alerts
- Recent lead/rental feed (~10 items)

### Live

- One Metabase iframe on the Operations tab, pointed at seeded SQLite, showing a network-occupancy heatmap that responds to filter clicks.

### File layout (proposed)

```
src/data/
  facilities.json         # 130+ real names + cities + states + mocked metrics
  funds.json              # Real fund names + mocked deployment data
  construction.json       # Real projects + mocked milestones
  connectedSystems.json   # Per-tab integration manifest
  executives.json         # Real names + roles + tabs they "own"
  backlog.json            # Day 1 Backlog items
  roadmap.json            # 8-pillar phased roadmap
```

---

## 5. Per-Tab Content Detail

### Overview
- **KPI strip (4):** Total facilities (130+) · Total units (~30K) · Network occupancy % · TTM revenue
- **Big chart:** Daily network revenue 30d, filter by sub-brand
- **Leaderboard:** Top 10 / Bottom 10 facilities by occupancy and revenue
- **Alerts:** 6-8 cross-department alerts with severity, timestamp, and "Ask Co-Pilot →" contextual link
- **Recent rentals feed:** ~10 most recent rentals across the network

### Accounting (Trent Erickson)
- **KPI strip:** Network MRR · Fund-level NOI · Days to close · Distribution payout queue
- **Chart:** Revenue vs operating expense by month, segmented by fund
- **Fund accounting table:** 10FSSAC2 / 10FSSAC3 / Opportunistic — NOI, distributions paid, fund age, mezz outstanding
- **Automated close calendar:** "Trent's next close" widget with checklist
- **Connected Systems:** QuickBooks Online · Stessa · Plaid

### Operations (Capranos / Oakley)
- **KPI strip:** Network occupancy · Avg unit utilization · Auto-rental conversion % · Climate-controlled mix %
- **Live Metabase facility heatmap** (one real embed)
- **Per-facility ops drill-down table**
- **Climate vs non-climate breakdown**
- **RV/boat/vehicle storage performance** (consumer demand by category)
- **Connected Systems:** SiteLink · Janus International · Tenant Inc

### Marketing
- **KPI strip:** Trailing-7d leads · CPL · Lead-to-rental % · Brand mix
- **Big chart:** Channel performance 30d (Paid / Organic / Referrals / Walk-In)
- **Brand portfolio breakdown** across the 5 sub-brands
- **Per-market CPL leaderboard**
- **Recent leads feed**
- **Lead templates:** Storage-specific inquiry shapes — "RV storage Houston," "climate-controlled wine collection 10x20," "moving boxes 5x5," "boat storage off-season," etc.
- **Connected Systems:** GoHighLevel · Google Ads · Meta Ads · GA4 · Mailchimp

### Investments (Cliff Minsley)
- **KPI strip:** Total AUM · # active funds · Mezz outstanding · Capital deployed YTD
- **Fund waterfall card:** 10FSSAC2 → 3 → Opportunistic with IRR + deployed % + vintage
- **Acquisition pipeline:** Under-LOI properties with stage indicator
- **Opportunistic Offering subscription tracker**
- **Recent transactions feed** (including the real 13-facility disposition reported by Inside Self-Storage)
- **Connected Systems:** Juniper Square · DocuSign · Plaid

### Construction (Cliff Minsley)
- **KPI strip:** # in development · Total capex committed · Avg cost per sq ft · Avg days to CO
- **Pipeline kanban:** Site Selection → Entitlement → Permitting → Construction → Punch List → Certificate of Occupancy → Lease-up
- **Active projects table:** Dripping Springs TX (in flight, Opportunistic Offering seeded), Charlotte NC (in flight), plus 3-4 mocked future pipeline entries
- **Completed projects:** Graham NC (real — first ground-up, 155-unit)
- **Capex burn chart**
- **Connected Systems:** Procore · ClickUp · BuilderTrend

### Roadmap (Christopher Taylor / Oakley anchor)

**Header:** *"Built for Christopher Taylor's industry-first AI mandate — extending the 100-properties-with-<100-employees thesis into every department."*

**Day 1 Backlog (prelude) — Quick Wins**

| # | Fix | Time | Why it matters |
|---|---|---|---|
| 1 | Restore CWV "good" status — INP @ 207ms (p75 field) fails the 200ms threshold. Audit main-thread JS on tap; defer chat widget + analytics; break long tasks. | ~1-2 days | Failing INP is a confirmed Google ranking signal for mobile. With 130+ facility pages competing in local-pack searches, every position matters. |
| 2 | Cut TTFB from 1170ms (p75 field) to <500ms. Add Cloudflare full-page cache for marketing pages; if origin is the bottleneck, move closer to SE users. | ~4 hrs config / ~1 day if rearchitecting | TTFB is 65% of the LCP budget. Halving it puts LCP comfortably under 1.5s — measurable lift in Google rankings and rental funnel conversion. |
| 3 | Replace deprecated browser API (1 Lighthouse deprecation warning). | ~1 hr | Future-proofing. |
| 4 | Fix `label-content-name-mismatch` accessibility issue (visible label doesn't match accessible name). | ~30 min | Screen reader UX + drops a Lighthouse failure. |
| 5 | Ship 5 Special Features detail pages — replaces the dead megamenu links (24/7 Access, Security Systems, Contactless Move-In, Month-to-Month Lease, Online Management) with SEO-targeted detail pages. | ~1 day | Trust signals drive the rental decision. Today the links 404; tomorrow they're ranking for "secure storage near me" and similar long-tail queries. |
| 6 | Unify the customer portal experience across all 5 sub-brands. Today: flagship is white-labeled (`facility.10federalstorage.com`), other 4 still show `*.tenantconnect.com`. Fix: CNAMEs for Storage Depot / Big Guy / Carolina Secure / SS Max portals · default landing to "Existing Customers" · fix broken chat widget · brand-specific theming. | ~3-5 days | Customer portal friction = inbound call volume. One configuration sprint compounds across 130+ properties. Pure leverage. |

**Total Day 1 Backlog:** ~7-9 days, all evidence-based, all tied to business outcomes.

**Phase 1 (Days 1-90)**
1. Unified Network Operations Dashboard *(this thing — extended with full data integration)*
2. Marketing landing-page engine (per-facility, per-market, per-brand)
3. Internal tools triage (replace top-3 spreadsheets)
4. **Unified Customer Portal Layer** *(architectural standard for future acquisitions)*

**Phase 2 (Days 91-180)**
5. AI agent workforce across accounting / ops / marketing / investments / construction
6. Construction project intelligence layer
7. Marketing ↔ Ops feedback loop

**Phase 3 (Days 181-365)**
8. Fund-level reporting automation — Juniper Square integration + auto-generated quarterly investor reports

Each pillar expandable to show 10 day-by-day implementation steps (Aesthetic pattern).

---

## 6. AI Co-Pilot

**Implementation:** Vercel AI SDK route at `/api/copilot` calling Anthropic Claude Sonnet 4.6 with streaming.

**System prompt assembled at request time** from:
- Static knowledge (the spec data files — facilities, funds, construction, executives, backlog, roadmap, connected systems)
- Per-tab context (the active tab's metrics and entities)
- Persistent persona instructions ("You are 10F Ops Co-Pilot, built by Sterling Mull for the 10 Federal team...")

**6 seed prompts per tab** (clickable cards, Aesthetic pattern). Examples:

| Tab | Seed prompt examples |
|---|---|
| Overview | "Which facilities are losing occupancy this week and why?" · "Walk me through how a new rental flows from website to SiteLink" |
| Accounting | "What's the 10FSSAC2 reconciliation status this quarter?" · "When does Trent's next close run?" |
| Operations | "Compare auto-rental conversion at our top 5 vs bottom 5 facilities" · "Which markets have climate-controlled demand outstripping inventory?" |
| Marketing | "Why is CPL up in Carolina markets this month?" · "Compare lead-to-rental across the 5 sub-brands" |
| Investments | "What's the IRR profile of the Arkansas 7-facility acquisition vs pro forma?" · "Where should the next Opportunistic Offering tranche deploy?" |
| Construction | "What's the punch list status on Dripping Springs?" · "How does Graham NC's first-year occupancy compare to ground-up pro forma?" |
| Roadmap | "Walk me through the Day 1 Backlog" · "Why is the Unified Customer Portal pillar Phase 1?" |

**Contextual "Ask Co-Pilot →" links** scattered through alerts, facility cards, fund rows, and construction milestones.

---

## 7. Visual / Brand

- **Brand color:** 10F red (exact hex pulled from their logo, target ~#C8102E) + white + dark gray text
- **Typography:** Inter (matches Aesthetic)
- **Layout:** Light-mode, high-contrast, generous whitespace, subtle card shadows
- **Header strip:** *"10F Ops Co-Pilot"* + "Co-Pilot ready" pill + last-updated timestamp + "Open chat →" + tagline *"built for the 100-properties-with-<100-employees thesis"*
- **Footer:** *"Built by Sterling Mull for 10 Federal's automation-first operating thesis · Claude Sonnet 4.6 · Vercel AI SDK · sterlingmull.com"*
- **"← Why I built this"** tooltip in footer — opens a ~200-word note explaining the demo's intent and Sterling's read on the JD

---

## 8. Personalization Anchors

Subtle name-drops establishing each tab's operational owner:

| Tab | Anchor |
|---|---|
| Overview | Headline references the 130-facility / <100-employee ratio |
| Accounting | *"Trent's close calendar"* widget |
| Operations | *"Live ops view — what Brian and Andrew see at 7am"* subtitle |
| Marketing | *"Per-brand mix — 10F, Storage Depot, Big Guy, Carolina Secure, Self Storage Max"* |
| Investments | *"Cliff's pipeline — what's under LOI"* subtitle |
| Construction | *"Cliff's builds — Graham, Dripping Springs, Charlotte"* subtitle |
| Roadmap | Header attribution to Christopher Taylor's AI mandate |

These are subtle — single phrases, not signed paintings. They signal Sterling read the leadership team and knows who owns what without becoming sycophantic.

---

## 9. Out of Scope (YAGNI)

Explicit cuts to keep the ship date tight:

- ❌ Real auth on the Metabase embed (read-only, public OK for demo)
- ❌ Multi-user state / session persistence (single visitor view)
- ❌ Real API integrations to GoHighLevel, SiteLink, etc. (Connected Systems rails are visual signals, not live data)
- ❌ Mobile-optimized layout (desktop-first; mobile works but isn't designed-for)
- ❌ Settings tab functionality (placeholder, same as Aesthetic)
- ❌ Stitching in actual OSS dashboards (Mautic, ERPNext, Akaunting) — rejected during brainstorming as wrong signal
- ❌ Multi-tenant facility filter persistence

---

## 10. Success Criteria

The demo succeeds if, after 5-10 minutes:

1. Capranos / Taylor / Oakley can name 3 things about it that feel specific to 10 Federal (not generic dashboard work)
2. The Day 1 Backlog reads as *operator instinct*, not *audit*
3. The AI Co-Pilot answers a fund-specific or facility-specific question accurately, proving the data is wired through
4. The Roadmap reads as a credible 12-month plan a founding engineer could execute
5. Sterling lands a phone screen

---

## 11. Build Plan (high level — detailed plan to follow via writing-plans skill)

1. Scaffold Vite + React + Tailwind project at `C:\tools\demo\10federal-demo`
2. Build static data files from research (facilities, funds, construction, execs, backlog, roadmap, connected systems)
3. Build shared components (KPI strip, leaderboard table, alert card, Connected Systems rail, chat box)
4. Build tabs in priority order: Overview → Roadmap (has the Day 1 Backlog, highest-signal content) → Construction → Investments → Operations → Marketing → Accounting → Settings
5. Wire AI Co-Pilot (Vercel AI SDK + Anthropic API key from env)
6. Seed Metabase SQLite and embed on Operations tab
7. Vercel deploy + DNS for `10federal.sterlingmull.com`
8. QA pass — test Co-Pilot prompts, verify all data references are real and correct, check Lighthouse on the demo itself (we don't ship a slow dashboard while auditing theirs)

---

## 12. Planning-Time Decisions to Resolve

Surfaced during spec review — to be resolved during the writing-plans phase, not blocking spec approval:

- **Metabase hosting model.** The live Operations heatmap iframe needs Metabase running somewhere — Vercel can't host it. Options: (a) Metabase Cloud Starter (managed, paid), (b) self-host on Fly.io / Render free tier, (c) public read-only embed via Metabase Cloud free-tier dashboard. Recommend (b) for cost + control.
- **AI Co-Pilot system prompt size.** Naively stuffing all data files into every request bloats tokens. Plan should default to per-tab compact context + full data on-demand via function calls / structured retrieval.
- **Demo-itself Lighthouse targets.** Since the demo audits 10F's own Lighthouse scores, the demo must be cleaner. Targets: LCP <1.5s, INP <100ms, CLS 0, Accessibility 100, SEO 100, Best Practices 100.
- **Exact 10F red hex.** Sample from their live logo during scaffold; `#C8102E` is approximate.

---

## 13. Sources

- 10 Federal Storage website: https://10federalstorage.com
- 10 Federal Companies parent: https://10fed.com
- Inside Self-Storage fund reporting (10FSSAC2/3/Opportunistic Offering): https://www.insideselfstorage.com/
- Modern Storage Media — Capranos profile
- CBInsights / Tracxn / Crunchbase leadership data
- Lighthouse audit (mobile, May 29 2026) on 10federalstorage.com
- Live performance trace via Chrome DevTools MCP
- Customer portal observations (TenantConnect inconsistency across 5 sub-brands)
- Indeed JD: https://to.indeed.com/aatpvzfpqcyw
- Pattern source: `aesthetic.sterlingmull.com`
