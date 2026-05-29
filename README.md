# 10F Ops Co-Pilot

> Hiring demo for the [10 Federal Storage Junior Software & AI Engineer role](https://to.indeed.com/aatpvzfpqcyw).
>
> **Live:** [10federal.sterlingmull.com](https://10federal.sterlingmull.com)

A 130-facility operational dashboard for [10 Federal Companies](https://10fed.com) — the Raleigh-headquartered, automation-first self-storage operator running 130+ facilities across 17 states with fewer than 100 employees. Built by [Sterling Mull](https://sterlingmull.com) in four hours using Claude Code as the primary build tool.

## What's in here

- **Eight tabs** covering every division named in the JD: Overview, Accounting, Operations, Marketing, Investments, Construction, Roadmap, Settings.
- **Real data anchored from public sources** — 130 facility names from the live site, the 10FSSAC2 / 10FSSAC3 / 10FSSAC4 / Opportunistic Offering fund stack with Q1 2025 NOI growth metrics, eight named construction projects from Q1+Q2 2025 press releases (Graham NC, Georgetown TX, Dripping Springs TX, Richmond Hill GA, Villa Rica GA, Temple GA, Charlotte NC, Lake Worth TX), and six named executives wired into the right tabs.
- **Streaming AI Co-Pilot** powered by Anthropic Claude via the Vercel AI SDK — per-tab system prompt assembled at request time from the real data above. Six engineered conversation starters in the empty state.
- **Audio walkthrough** (ElevenLabs) explaining who Sterling is, the reasoning behind the demo, and how it was built.
- **Day 1 Backlog** — six evidence-based fixes Sterling would ship in week one, sourced from a live Lighthouse audit (failing INP, slow TTFB, deprecated browser API, accessible-name mismatch, broken Special Features megamenu) plus a manual TenantConnect portal walkthrough across all five sub-brands.
- **Eight-pillar phased roadmap** mapping the 12-month plan to the JD's named responsibilities, with the Unified Customer Portal Layer as a Phase 1 pillar (the leverage finding from the portal audit).

## Stack

React 19 · Vite 8 · TypeScript · Tailwind CSS 4 · Recharts · Vercel AI SDK · Anthropic Claude SDK · Vitest · ElevenLabs (audio walkthrough) · Vercel deploy + Cloudflare DNS.

## Build process

The entire demo — every tab, every component, the streaming API route, the data layer, the seeded facility generator — was built using Claude Code as the primary build tool over four hours. The commit history walks through the actual build phases: scaffold → data layer → utility lib → shell → shared components → tabs → AI Co-Pilot → personalization polish → deploy.

50 unit tests passing. Lighthouse on the production build: Accessibility / Best Practices / SEO all 100.

## Local dev

```bash
npm install
cp .env.example .env   # add your ANTHROPIC_API_KEY
npm run dev            # frontend only — chat API not wired in vite dev
npx vercel dev         # frontend + /api/copilot route together
npm test               # 50 unit + schema tests
npm run build          # production build
```

## Repo structure

```
api/
  copilot.ts              # Vercel serverless function — Anthropic streaming
narration/
  walkthrough.txt         # Audio script (third-person, ~2 min)
  generate.mjs            # ElevenLabs TTS generator
public/
  walkthrough.mp3         # Generated audio (run narration/generate.mjs)
  favicon.svg
  llms.txt                # AI-discovery metadata
scripts/
  seedFacilities.mjs      # Deterministic facility seeder (130 entries)
src/
  App.tsx                 # Hash-based tab router
  data/                   # All 10 JSON data files (Zod-validated)
  lib/                    # Pure utilities: schemas, metrics, format, copilotContext
  components/
    shell/                # TopNav, HeaderStrip, Footer, CopilotDock, WalkthroughModal
    shared/               # KpiCard, Leaderboard, AlertCard, ConnectedSystems, etc.
    copilot/              # ChatMessage, ChatInput
  tabs/                   # 8 tab components
  __tests__/              # 50 unit + schema tests
docs/superpowers/
  specs/                  # Original design spec
  plans/                  # Implementation plan (47 tasks across 10 phases)
```

## Hi Andrew, Christopher, Brian

If anything here resonates, [open the chat on the live demo](https://10federal.sterlingmull.com) and ask anything — the Co-Pilot knows your fund stack, your construction projects, your leadership, and the Day 1 Backlog. Or reach me directly at [sterlingmull.com](https://sterlingmull.com).
