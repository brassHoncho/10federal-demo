# 10federal.sterlingmull.com — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single-page operational dashboard at `10federal.sterlingmull.com` matching the spec at `docs/superpowers/specs/2026-05-29-10federal-demo-design.md`. Send the URL with the application to 10 Federal Storage's Junior Software & AI Engineer role.

**Architecture:** React 19 SPA on Vite + Tailwind 4, hosted on Vercel with one serverless route (`/api/copilot`) that streams Anthropic responses via the Vercel AI SDK. All operational data lives in static JSON files in `src/data/` (real names + deterministic mocked metrics via seeded random). One Metabase iframe on the Operations tab provides the "live" wow moment. Tab state lives in URL hash for shareable links.

**Tech Stack:** React 19, Vite 8, TypeScript, Tailwind CSS 4, Recharts, Vercel AI SDK, Anthropic SDK (`@anthropic-ai/sdk`), Vitest + React Testing Library, Metabase (Fly.io self-host, free tier).

**Spec:** `docs/superpowers/specs/2026-05-29-10federal-demo-design.md`

---

## File Structure

```
10federal-demo/
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── vercel.json
├── index.html
├── .env.example
├── .gitignore
├── api/
│   └── copilot.ts                # Vercel serverless route, Anthropic + Vercel AI SDK
├── src/
│   ├── main.tsx                  # React entry
│   ├── App.tsx                   # Tab router + layout shell
│   ├── styles/
│   │   └── global.css            # Tailwind imports + design tokens
│   ├── data/                     # Static JSON, source of truth
│   │   ├── facilities.json       # 130 entries: ~116 real + 14 mocked-acquisition
│   │   ├── funds.json            # 3 fund vehicles
│   │   ├── construction.json     # 3 real + 4 mocked pipeline entries
│   │   ├── executives.json       # 6 named execs
│   │   ├── connectedSystems.json # per-tab integration manifest
│   │   ├── backlog.json          # 6 Day 1 Backlog items
│   │   ├── roadmap.json          # 8-pillar phased roadmap
│   │   ├── alerts.json           # ~8 cross-department alerts
│   │   ├── leads.json            # ~10 recent leads
│   │   └── leadTemplates.json    # ~10 storage-specific lead templates
│   ├── lib/
│   │   ├── seededRandom.ts       # Deterministic PRNG so reloads show identical data
│   │   ├── metrics.ts            # KPI calculations (occupancy, IRR, capex burn, etc.)
│   │   ├── format.ts             # Currency, %, dates, relative time
│   │   └── copilotContext.ts     # Per-tab system prompt assembly
│   ├── components/
│   │   ├── shell/
│   │   │   ├── TopNav.tsx        # The 8 tabs
│   │   │   ├── HeaderStrip.tsx   # Logo + status pill + "Open chat →" + tagline
│   │   │   ├── Footer.tsx        # Attribution + "Why I built this" tooltip
│   │   │   └── CopilotDock.tsx   # Bottom-anchored chat container
│   │   ├── shared/
│   │   │   ├── KpiCard.tsx
│   │   │   ├── KpiStrip.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── AlertCard.tsx
│   │   │   ├── ConnectedSystems.tsx
│   │   │   ├── ChartCard.tsx
│   │   │   └── SectionHeader.tsx
│   │   └── copilot/
│   │       ├── ChatMessage.tsx
│   │       ├── SeedPrompts.tsx
│   │       └── ChatInput.tsx
│   ├── tabs/
│   │   ├── OverviewTab.tsx
│   │   ├── AccountingTab.tsx
│   │   ├── OperationsTab.tsx
│   │   ├── MarketingTab.tsx
│   │   ├── InvestmentsTab.tsx
│   │   ├── ConstructionTab.tsx
│   │   ├── RoadmapTab.tsx
│   │   └── SettingsTab.tsx
│   └── __tests__/
│       ├── data-shapes.test.ts   # Zod validation across all JSON
│       ├── metrics.test.ts
│       ├── seededRandom.test.ts
│       ├── format.test.ts
│       └── copilotContext.test.ts
├── public/
│   └── favicon.svg               # 10F red circle
└── docs/
    └── superpowers/
        ├── specs/2026-05-29-10federal-demo-design.md
        └── plans/2026-05-29-10federal-demo-implementation.md
```

**Boundary discipline:**
- `src/data/` is pure JSON — no logic, no imports
- `src/lib/` is pure functions — no React, fully unit-testable
- `src/components/shared/` are presentational only — props in, JSX out, no fetching
- `src/tabs/` compose shared components and import data; no business logic here
- `api/` is server-only — never imported from `src/`

---

## Phase 0 — Scaffolding (~1 hour)

### Task 0.1: Initialize Vite + React + TS project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1:** Run scaffold from `C:\tools\demo\`:

```bash
cd C:/tools/demo
npm create vite@latest 10federal-demo -- --template react-ts
cd 10federal-demo
npm install
```

- [ ] **Step 2:** Verify dev server starts.

```bash
npm run dev
```

Expected: Vite prints `Local: http://localhost:5173/` and the default Vite logo page renders.

- [ ] **Step 3:** Stop the dev server (Ctrl+C). Commit the scaffold.

```bash
git add .
git commit -m "feat: scaffold Vite + React + TS for 10federal demo"
```

### Task 0.2: Install runtime + dev dependencies

**Files:** `package.json`

- [ ] **Step 1:** Install runtime deps:

```bash
npm install recharts @anthropic-ai/sdk ai zod
```

- [ ] **Step 2:** Install Tailwind v4 + PostCSS:

```bash
npm install -D tailwindcss@next @tailwindcss/postcss postcss autoprefixer
```

- [ ] **Step 3:** Install Vitest + React Testing Library:

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom @types/node
```

- [ ] **Step 4:** Commit.

```bash
git add package.json package-lock.json
git commit -m "feat: install runtime + dev dependencies"
```

### Task 0.3: Configure Tailwind 4 with 10F design tokens

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`, `src/styles/global.css`
- Modify: `src/main.tsx` (import global.css)

- [ ] **Step 1:** Create `postcss.config.js`:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 2:** Create `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sampled from 10federalstorage.com logo — verify in Task 8.1
        '10f-red': '#C8102E',
        '10f-red-dark': '#9E0C24',
        '10f-bg': '#FFFFFF',
        '10f-surface': '#FAFAFA',
        '10f-border': '#E5E7EB',
        '10f-text': '#111827',
        '10f-text-muted': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 3:** Create `src/styles/global.css`:

```css
@import "tailwindcss";

@layer base {
  html { -webkit-font-smoothing: antialiased; }
  body { @apply bg-10f-bg text-10f-text font-sans; }
}
```

- [ ] **Step 4:** Modify `src/main.tsx` — replace `import './index.css'` with `import './styles/global.css'`. Delete `src/index.css` and `src/App.css`.

- [ ] **Step 5:** Replace `src/App.tsx` body with a minimal red header to verify Tailwind:

```tsx
export default function App() {
  return (
    <div className="min-h-screen">
      <header className="bg-10f-red text-white p-4 font-bold">10 Federal Ops Co-Pilot</header>
    </div>
  )
}
```

- [ ] **Step 6:** Verify with `npm run dev` — red header should render.

- [ ] **Step 7:** Commit.

```bash
git add .
git commit -m "feat: configure Tailwind 4 with 10F brand tokens"
```

### Task 0.4: Wire Vitest

**Files:**
- Create: `vitest.config.ts`, `src/__tests__/setup.ts`
- Modify: `package.json` (add test script)

- [ ] **Step 1:** Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 2:** Create `src/__tests__/setup.ts`:

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3:** Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4:** Write a sentinel test at `src/__tests__/sentinel.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('sentinel', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5:** Run `npm test`. Expected: 1 test passes.

- [ ] **Step 6:** Commit.

```bash
git add .
git commit -m "feat: wire Vitest + RTL test harness"
```

### Task 0.5: Create empty file stubs matching the file structure

**Files:** All directories under `src/`, plus stub files.

- [ ] **Step 1:** Create the directory tree:

```bash
mkdir -p src/data src/lib src/components/shell src/components/shared src/components/copilot src/tabs api public
```

- [ ] **Step 2:** Create empty placeholder JSON files in `src/data/` (each with `[]` or `{}`).
- [ ] **Step 3:** Create empty `.ts` and `.tsx` files matching the File Structure section above. Each component file exports a default stub:

```tsx
export default function ComponentName() { return null }
```

- [ ] **Step 4:** Commit.

```bash
git add .
git commit -m "feat: scaffold project file structure"
```

---

## Phase 1 — Data Layer (~3-4 hours)

> **Authoring strategy:** Write each JSON file by hand using the research already in the spec. Use deterministic seeded random for the per-facility metrics so every reload shows the same numbers (no flicker). Validate each file with a Zod schema in tests.

### Task 1.1: Build the data shape contracts (Zod schemas)

**Files:**
- Create: `src/lib/schemas.ts`
- Create: `src/__tests__/data-shapes.test.ts`

- [ ] **Step 1:** Create `src/lib/schemas.ts` with Zod schemas for every data file. Example:

```ts
import { z } from 'zod'

export const FacilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  state: z.string(),
  brand: z.enum(['10 Federal Storage', 'Storage Depot', 'Big Guy Storage', 'Carolina Secure Storage', 'Self Storage Max']),
  units: z.number().int().positive(),
  occupancyPct: z.number().min(0).max(100),
  monthlyRevenue: z.number().nonnegative(),
  leadToRentalPct: z.number().min(0).max(100),
  climateControlPct: z.number().min(0).max(100),
  status: z.enum(['operating', 'lease-up', 'recent-acquisition']),
})
export type Facility = z.infer<typeof FacilitySchema>

export const FundSchema = z.object({
  id: z.string(),
  name: z.string(),
  vintage: z.string(),
  raised: z.number().nonnegative(),
  deployedPct: z.number().min(0).max(100),
  irr: z.number(),
  noi: z.number().nonnegative(),
  distributionsPaid: z.number().nonnegative(),
  mezzOutstanding: z.number().nonnegative(),
  status: z.enum(['active', 'closed', 'fundraising']),
  notes: z.string(),
})
export type Fund = z.infer<typeof FundSchema>

// ...repeat for ConstructionSchema, ExecutiveSchema, ConnectedSystemSchema,
// BacklogItemSchema, RoadmapPillarSchema, AlertSchema, LeadSchema, LeadTemplateSchema
```

- [ ] **Step 2:** Create `src/__tests__/data-shapes.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import facilities from '../data/facilities.json'
import funds from '../data/funds.json'
import construction from '../data/construction.json'
import executives from '../data/executives.json'
import connectedSystems from '../data/connectedSystems.json'
import backlog from '../data/backlog.json'
import roadmap from '../data/roadmap.json'
import alerts from '../data/alerts.json'
import leads from '../data/leads.json'
import leadTemplates from '../data/leadTemplates.json'
import {
  FacilitySchema, FundSchema, ConstructionSchema, ExecutiveSchema,
  ConnectedSystemSchema, BacklogItemSchema, RoadmapPillarSchema,
  AlertSchema, LeadSchema, LeadTemplateSchema,
} from '../lib/schemas'

describe('data shape contracts', () => {
  it('facilities.json matches schema', () => {
    facilities.forEach((f, i) => {
      const result = FacilitySchema.safeParse(f)
      if (!result.success) {
        throw new Error(`Facility ${i}: ${JSON.stringify(result.error.issues)}`)
      }
    })
  })
  // ...repeat for every data file
})
```

- [ ] **Step 3:** Run `npm test`. Expected: all tests pass (data files are still empty arrays/objects, so the `forEach` loops over nothing).

- [ ] **Step 4:** Commit.

```bash
git add .
git commit -m "feat: Zod schemas + shape tests for all data files"
```

### Task 1.2: Build facilities.json (the biggest data file)

**Files:** `src/data/facilities.json`

**Source data:** The spec's Section 4 enumerates ~116 publicly-listed facilities by state. Use those names verbatim. Add 14 mocked "recent-acquisition" entries to reach 130. Brand assignment: 10 Federal Storage for ~80% (the flagship), distribute the remaining 20% across the other 4 sub-brands per the spec's brand portfolio.

- [ ] **Step 1:** Write a one-off Node script `scripts/seedFacilities.mjs` that emits the JSON:

```js
// scripts/seedFacilities.mjs
import { writeFileSync } from 'node:fs'
import { seededRandom } from './seededRandom.mjs'

const REAL_BY_STATE = {
  AR: ['Benton', 'Bryant', 'Jacksonville', 'Little Rock', 'North Little Rock'],
  CO: ['Grand Junction', 'Palisade'],
  FL: ['Cape Coral', 'Fort Myers'],
  GA: ['Carrollton','Dahlonega','Dallas','Douglasville','Jenkinsburg','Locust Grove','Macon','McDonough','Newnan','Richmond Hill','Ringgold','Temple','Valdosta','Villa Rica','Waco'],
  IL: ['Aurora','Naperville','Peoria','Springfield'],
  IA: ['Des Moines','West Des Moines'],
  MI: ['Washington'],
  MO: ['Columbia','Jefferson City'],
  NH: ['Concord','Pembroke'],
  NC: ['Asheboro','Burlington','Cary','Clayton','Creedmoor','Durham','Forest City','Garner','Gibsonville','Goldsboro','Graham','Greenville','Haw River','Henderson','High Point','Kannapolis','Kings Mountain','Landis','Leland','Mebane','Monroe','Raleigh','Rocky Mount','Roxboro','Thomasville','Trinity','Wendell','Wilmington','Winston Salem','Winterville'],
  SC: ['Boiling Springs','Chester','Columbia','Little River','North Myrtle Beach','Spartanburg','West Columbia'],
  TN: ['Gray','Greeneville','Johnson City','Kingsport','Nolensville'],
  TX: ['Abilene','Arlington','Buffalo Gap','Burleson','Converse','Dallas','Dripping Springs','El Paso','Fort Worth','Georgetown','Grand Prairie','Greenville','Houston','Irving','Keller','Killeen','League City','Magnolia','McKinney','Montgomery','Nolanville','North Richland Hills','Princeton','Round Rock','Royse City','San Antonio','Santa Fe','Seguin','Spring Branch','Texas City','Tuscola','Waxahachie'],
  VA: ['Richmond'],
  WA: ['Burien','Seattle'],
  WI: ['Pewaukee','Waukesha'],
}

const BRAND_DEFAULT = '10 Federal Storage'
const SUB_BRANDS = ['Storage Depot','Big Guy Storage','Carolina Secure Storage','Self Storage Max']

// "Carolina Secure Storage" -> NC + SC bias; Self Storage Max -> MI per the website
const SUB_BRAND_STATE_MAP = {
  MI: 'Self Storage Max',
}

const facilities = []
const rand = seededRandom(20260529)
let id = 0

for (const [state, cities] of Object.entries(REAL_BY_STATE)) {
  for (const city of cities) {
    const isMichigan = state === 'MI'
    const brand = isMichigan
      ? 'Self Storage Max'
      : (state === 'NC' || state === 'SC') && rand() < 0.12
        ? 'Carolina Secure Storage'
        : rand() < 0.06
          ? SUB_BRANDS[Math.floor(rand() * SUB_BRANDS.length)]
          : BRAND_DEFAULT
    const units = 200 + Math.floor(rand() * 500)
    const occupancy = 70 + rand() * 25
    const monthlyRevenue = units * (40 + rand() * 80) * (occupancy / 100)
    facilities.push({
      id: `fac-${++id}`,
      name: `${brand === 'Self Storage Max' ? 'Self Storage Max' : '10 Federal Storage'} - ${city}`,
      city, state, brand,
      units,
      occupancyPct: Math.round(occupancy * 10) / 10,
      monthlyRevenue: Math.round(monthlyRevenue),
      leadToRentalPct: Math.round((25 + rand() * 35) * 10) / 10,
      climateControlPct: Math.round(rand() * 80),
      status: 'operating',
    })
  }
}

// Add 14 mocked "recent-acquisition" entries to reach 130
const MOCKED_RECENT = [
  ['Atlanta', 'GA'], ['Athens', 'GA'], ['Savannah', 'GA'],
  ['Plano', 'TX'], ['Lubbock', 'TX'], ['Tyler', 'TX'],
  ['Asheville', 'NC'], ['Charlotte', 'NC'], ['Fayetteville', 'NC'],
  ['Lexington', 'KY'], ['Louisville', 'KY'],
  ['Birmingham', 'AL'], ['Mobile', 'AL'],
  ['Tampa', 'FL'],
]
for (const [city, state] of MOCKED_RECENT) {
  const units = 250 + Math.floor(rand() * 400)
  facilities.push({
    id: `fac-${++id}`,
    name: `10 Federal Storage - ${city}`,
    city, state, brand: BRAND_DEFAULT,
    units,
    occupancyPct: Math.round((60 + rand() * 20) * 10) / 10, // lower — still in lease-up
    monthlyRevenue: Math.round(units * 50 * 0.6),
    leadToRentalPct: Math.round((20 + rand() * 25) * 10) / 10,
    climateControlPct: Math.round(rand() * 50),
    status: 'recent-acquisition',
  })
}

writeFileSync(new URL('../src/data/facilities.json', import.meta.url), JSON.stringify(facilities, null, 2))
console.log(`Wrote ${facilities.length} facilities`)
```

- [ ] **Step 2:** Also create `scripts/seededRandom.mjs`:

```js
export function seededRandom(seed) {
  let s = seed >>> 0
  return function() {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}
```

- [ ] **Step 3:** Run the seeder:

```bash
node scripts/seedFacilities.mjs
```

Expected: prints `Wrote 130 facilities`.

- [ ] **Step 4:** Run `npm test`. Expected: `facilities.json matches schema` passes.

- [ ] **Step 5:** Commit.

```bash
git add scripts/ src/data/facilities.json
git commit -m "feat: seed 130 facilities (116 real + 14 acquisitions)"
```

### Task 1.3: Build funds.json

**Files:** `src/data/funds.json`

- [ ] **Step 1:** Hand-write `src/data/funds.json` with the 3 real fund vehicles:

```json
[
  {
    "id": "10fssac2",
    "name": "10 Federal Self Storage Acquisition Co. 2",
    "vintage": "2021",
    "raised": 32000000,
    "deployedPct": 100,
    "irr": 18.4,
    "noi": 12800000,
    "distributionsPaid": 9200000,
    "mezzOutstanding": 0,
    "status": "closed",
    "notes": "Oversubscribed at $32M. 26 acquisitions, 7,500+ units across the Southeast."
  },
  {
    "id": "10fssac3",
    "name": "10 Federal Self Storage Acquisition Co. 3",
    "vintage": "2023",
    "raised": 7400000,
    "deployedPct": 87,
    "irr": 14.1,
    "noi": 1850000,
    "distributionsPaid": 740000,
    "mezzOutstanding": 1500000,
    "status": "active",
    "notes": "Raised from 128 investors. Bolt-on portfolio expansion."
  },
  {
    "id": "opportunistic",
    "name": "Opportunistic Offering",
    "vintage": "2024",
    "raised": 25000000,
    "deployedPct": 42,
    "irr": 0,
    "noi": 0,
    "distributionsPaid": 0,
    "mezzOutstanding": 4200000,
    "status": "fundraising",
    "notes": "First close $25M, led by Essentia Capital Partners. Ground-up development focus — multi-story Class-A. Seeded Dripping Springs TX + Charlotte NC."
  }
]
```

- [ ] **Step 2:** Run `npm test`. Expected: shape test passes.

- [ ] **Step 3:** Commit.

```bash
git add src/data/funds.json
git commit -m "feat: seed 3 fund vehicles (10FSSAC2, 10FSSAC3, Opportunistic)"
```

### Task 1.4: Build construction.json

**Files:** `src/data/construction.json`

- [ ] **Step 1:** Hand-write with 3 real projects + 4 mocked pipeline:

```json
[
  {
    "id": "graham-nc",
    "name": "Graham, NC",
    "city": "Graham", "state": "NC",
    "fundId": "opportunistic",
    "stage": "lease-up",
    "units": 155,
    "capexBudget": 12500000,
    "capexSpent": 12300000,
    "occupancyPct": 38,
    "expectedCO": "2025-09-15",
    "actualCO": "2025-09-22",
    "notes": "10F's first ground-up build. Single-story drive-up + climate-controlled mix. Industry baseline reference."
  },
  {
    "id": "dripping-springs-tx",
    "name": "Dripping Springs, TX",
    "city": "Dripping Springs", "state": "TX",
    "fundId": "opportunistic",
    "stage": "construction",
    "units": 720,
    "capexBudget": 28000000,
    "capexSpent": 16800000,
    "occupancyPct": 0,
    "expectedCO": "2026-11-30",
    "notes": "Class-A multi-story. Hill Country growth market. Punch list begins Q3 2026."
  },
  {
    "id": "charlotte-nc",
    "name": "Charlotte, NC",
    "city": "Charlotte", "state": "NC",
    "fundId": "opportunistic",
    "stage": "permitting",
    "units": 850,
    "capexBudget": 32000000,
    "capexSpent": 3200000,
    "occupancyPct": 0,
    "expectedCO": "2027-06-01",
    "notes": "Class-A multi-story, urban infill. Permitting in progress; site work expected Q4 2026."
  },
  // 4 mocked pipeline entries
  {
    "id": "raleigh-nc-2",
    "name": "Raleigh, NC (North)",
    "city": "Raleigh", "state": "NC",
    "fundId": "opportunistic",
    "stage": "site-selection",
    "units": 600,
    "capexBudget": 24000000,
    "capexSpent": 180000,
    "occupancyPct": 0,
    "expectedCO": "2027-10-15",
    "notes": "Under LOI. Population density supports multi-story format."
  },
  {
    "id": "austin-tx",
    "name": "Austin, TX (Southeast)",
    "city": "Austin", "state": "TX",
    "fundId": "opportunistic",
    "stage": "entitlement",
    "units": 780,
    "capexBudget": 30500000,
    "capexSpent": 920000,
    "occupancyPct": 0,
    "expectedCO": "2027-08-01",
    "notes": "Entitlement hearing scheduled Q3 2026."
  },
  {
    "id": "atlanta-ga",
    "name": "Atlanta, GA (Buckhead)",
    "city": "Atlanta", "state": "GA",
    "fundId": "opportunistic",
    "stage": "site-selection",
    "units": 920,
    "capexBudget": 38000000,
    "capexSpent": 0,
    "occupancyPct": 0,
    "expectedCO": "2028-02-01",
    "notes": "Site identified; sourcing competition. Premium urban infill thesis."
  },
  {
    "id": "nashville-tn",
    "name": "Nashville, TN",
    "city": "Nashville", "state": "TN",
    "fundId": "opportunistic",
    "stage": "site-selection",
    "units": 700,
    "capexBudget": 27000000,
    "capexSpent": 0,
    "occupancyPct": 0,
    "expectedCO": "2028-04-01",
    "notes": "Market entry candidate. Population growth + thin existing supply."
  }
]
```

- [ ] **Step 2:** Run `npm test`. Expected: shape test passes.

- [ ] **Step 3:** Commit.

```bash
git add src/data/construction.json
git commit -m "feat: seed construction pipeline (3 real + 4 mocked)"
```

### Task 1.5: Build executives.json

**Files:** `src/data/executives.json`

- [ ] **Step 1:** Hand-write:

```json
[
  {"id":"capranos","name":"Andrew Capranos","role":"President","ownsTabs":["overview","operations"],"bio":"Leads strategic planning, operational oversight, and organizational growth."},
  {"id":"brad-minsley","name":"Brad Minsley","role":"Co-Founder, Principal","ownsTabs":["operations","accounting"],"bio":"Leads operations, finance, and technology development. 20+ years in real estate development and private equity."},
  {"id":"cliff-minsley","name":"Cliff Minsley","role":"Co-Founder, Principal","ownsTabs":["investments","construction"],"bio":"Leads investment functions including capital raising, corporate strategy, entitlement, financing, and construction."},
  {"id":"christopher-taylor","name":"Christopher Taylor","role":"Chief AI Officer","ownsTabs":["roadmap"],"bio":"Leads artificial intelligence strategy, architecture, and development. The self-storage industry's first dedicated C-suite AI executive."},
  {"id":"brian-oakley","name":"Brian Oakley","role":"Head of Technology","ownsTabs":["operations","roadmap"],"bio":"Directs enterprise platforms, automation, and digital infrastructure."},
  {"id":"trent-erickson","name":"Trent Erickson","role":"Head of Finance","ownsTabs":["accounting"],"bio":"Leads all accounting and finance functions."}
]
```

- [ ] **Step 2:** Run `npm test`. Commit.

```bash
git add src/data/executives.json
git commit -m "feat: seed 6 executives with tab ownership"
```

### Task 1.6: Build connectedSystems.json

**Files:** `src/data/connectedSystems.json`

- [ ] **Step 1:** Hand-write the per-tab integration manifest per the spec's Section 5. Each entry has: `tab`, `name`, `category`, `lastSyncMinutesAgo`, `status` (ok | warn | error), `metric` (optional).

```json
{
  "accounting": [
    {"name":"QuickBooks Online","category":"GL","lastSyncMinutesAgo":4,"status":"ok","metric":"$24.1M MTD"},
    {"name":"Stessa","category":"Real Estate Acctg","lastSyncMinutesAgo":11,"status":"ok"},
    {"name":"Plaid","category":"Bank Sync","lastSyncMinutesAgo":2,"status":"ok"}
  ],
  "operations": [
    {"name":"SiteLink","category":"Property Mgmt","lastSyncMinutesAgo":1,"status":"ok","metric":"130 facilities live"},
    {"name":"Janus International","category":"Access Control","lastSyncMinutesAgo":3,"status":"ok"},
    {"name":"Tenant Inc","category":"Tenant Portal","lastSyncMinutesAgo":8,"status":"warn","metric":"4 portals not white-labeled"}
  ],
  "marketing": [
    {"name":"GoHighLevel","category":"CRM","lastSyncMinutesAgo":2,"status":"ok","metric":"1,242 leads MTD"},
    {"name":"Google Ads","category":"Paid","lastSyncMinutesAgo":14,"status":"ok"},
    {"name":"Meta Ads","category":"Paid","lastSyncMinutesAgo":14,"status":"ok"},
    {"name":"GA4","category":"Analytics","lastSyncMinutesAgo":61,"status":"ok"},
    {"name":"Mailchimp","category":"Email","lastSyncMinutesAgo":5,"status":"ok"}
  ],
  "investments": [
    {"name":"Juniper Square","category":"Investor Portal","lastSyncMinutesAgo":7,"status":"ok","metric":"128 LPs"},
    {"name":"DocuSign","category":"Subscription Docs","lastSyncMinutesAgo":21,"status":"ok"},
    {"name":"Plaid","category":"Cap Calls","lastSyncMinutesAgo":2,"status":"ok"}
  ],
  "construction": [
    {"name":"Procore","category":"Project Mgmt","lastSyncMinutesAgo":9,"status":"ok"},
    {"name":"ClickUp","category":"Task Tracking","lastSyncMinutesAgo":4,"status":"ok"},
    {"name":"BuilderTrend","category":"Scheduling","lastSyncMinutesAgo":18,"status":"ok"}
  ]
}
```

- [ ] **Step 2:** Test + commit.

```bash
npm test
git add src/data/connectedSystems.json
git commit -m "feat: seed Connected Systems rails per tab"
```

### Task 1.7: Build backlog.json (the 6 Day 1 Backlog items)

**Files:** `src/data/backlog.json`

- [ ] **Step 1:** Hand-write the 6 items exactly as in the spec's Section 5 Roadmap > Day 1 Backlog table. Schema: `{id, title, description, estimateDays, businessOutcome, evidence}`.

- [ ] **Step 2:** Test + commit.

### Task 1.8: Build roadmap.json (8 pillars across 3 phases)

**Files:** `src/data/roadmap.json`

- [ ] **Step 1:** Hand-write the 8-pillar phased roadmap per spec Section 5 Roadmap tab. Schema:

```ts
{
  phase: 1 | 2 | 3,
  pillarNumber: number,
  title: string,
  summary: string,
  steps: { day: string, description: string }[],  // 10 day-by-day steps (Aesthetic pattern)
}
```

Pillars:
1. Unified Network Operations Dashboard
2. Marketing landing-page engine
3. Internal tools triage
4. Unified Customer Portal Layer ← the leverage finding
5. AI agent workforce
6. Construction project intelligence
7. Marketing ↔ Ops feedback loop
8. Fund-level reporting automation

- [ ] **Step 2:** Test + commit.

### Task 1.9: Build alerts.json, leads.json, leadTemplates.json

**Files:** `src/data/alerts.json`, `src/data/leads.json`, `src/data/leadTemplates.json`

- [ ] **Step 1:** Hand-write ~8 alerts spanning every department. Each: `{id, severity, message, timestampMinutesAgo, tab, askPrompt}`.
- [ ] **Step 2:** Hand-write ~10 recent leads. Each: `{id, inquiry, channel, facilityId, minutesAgo, propensity, routing}`.
- [ ] **Step 3:** Hand-write ~10 lead templates (storage-specific inquiry shapes — RV storage, climate-controlled wine, boat off-season, moving boxes, etc.).
- [ ] **Step 4:** Test + commit:

```bash
npm test
git add src/data/alerts.json src/data/leads.json src/data/leadTemplates.json
git commit -m "feat: seed alerts, leads, lead templates"
```

---

## Phase 2 — Utility Library (~1 hour)

### Task 2.1: seededRandom.ts

**Files:**
- Create: `src/lib/seededRandom.ts`
- Create: `src/__tests__/seededRandom.test.ts`

- [ ] **Step 1:** Write the failing test first:

```ts
import { describe, it, expect } from 'vitest'
import { seededRandom } from '../lib/seededRandom'

describe('seededRandom', () => {
  it('returns the same sequence for the same seed', () => {
    const a = seededRandom(42)
    const b = seededRandom(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
  it('returns values in [0, 1)', () => {
    const r = seededRandom(7)
    for (let i = 0; i < 100; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
```

- [ ] **Step 2:** `npm test` — expect FAIL.
- [ ] **Step 3:** Implement `src/lib/seededRandom.ts`:

```ts
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}
```

- [ ] **Step 4:** `npm test` — expect PASS. Commit.

### Task 2.2: format.ts

**Files:** `src/lib/format.ts`, `src/__tests__/format.test.ts`

- [ ] **Step 1:** Write failing tests:

```ts
import { describe, it, expect } from 'vitest'
import { fmtCurrency, fmtPct, fmtRelativeTime, fmtCompact } from '../lib/format'

describe('format', () => {
  it('fmtCurrency formats USD compactly', () => {
    expect(fmtCurrency(1234567)).toBe('$1.23M')
    expect(fmtCurrency(1500)).toBe('$1,500')
  })
  it('fmtPct formats percentages', () => {
    expect(fmtPct(82.5)).toBe('82.5%')
    expect(fmtPct(82, 0)).toBe('82%')
  })
  it('fmtRelativeTime renders minutes ago', () => {
    expect(fmtRelativeTime(2)).toBe('2m ago')
    expect(fmtRelativeTime(75)).toBe('1h ago')
    expect(fmtRelativeTime(1500)).toBe('1d ago')
  })
  it('fmtCompact rounds to k/M/B', () => {
    expect(fmtCompact(7500)).toBe('7.5k')
    expect(fmtCompact(2_400_000)).toBe('2.4M')
  })
})
```

- [ ] **Step 2:** `npm test` — expect FAIL. Implement. Pass. Commit.

### Task 2.3: metrics.ts

**Files:** `src/lib/metrics.ts`, `src/__tests__/metrics.test.ts`

Functions to implement (test each):
- `networkOccupancy(facilities)` — weighted by unit count
- `networkRevenue(facilities)` — sum monthly
- `topNByOccupancy(facilities, n)` / `bottomNByOccupancy`
- `byBrand(facilities)` — group + aggregate
- `byState(facilities)` — group + aggregate
- `fundDeployedDollars(fund)` — `raised * deployedPct / 100`
- `totalAUM(funds)` / `totalMezzOutstanding(funds)`
- `constructionCapexBurn(projects)` — sum spent
- `dripping(projects)` — pipeline by stage

- [ ] **Step 1:** Write failing tests for each. **Step 2:** Implement. **Step 3:** Pass. **Step 4:** Commit per logical group.

### Task 2.4: copilotContext.ts

**Files:** `src/lib/copilotContext.ts`, `src/__tests__/copilotContext.test.ts`

- [ ] **Step 1:** Test that `buildSystemPrompt(activeTab)` returns a string containing:
  - The base persona block (10F Ops Co-Pilot)
  - A compact facility summary (state counts, total units, brand mix — NOT all 130 entries)
  - Per-tab context block specific to `activeTab`
  - Leadership names + ownership map
  - The Day 1 Backlog summary

- [ ] **Step 2:** Implement to keep token budget tight (target <3k tokens for system prompt). Full facility data is NOT included by default — only summary stats. Add an optional `includeFacilities: true` flag that bloats the prompt with the full list (for explicit drill-down queries — invoked via tool call in a later phase if needed).

- [ ] **Step 3:** Commit.

```bash
git add src/lib/ src/__tests__/
git commit -m "feat: utility lib (seededRandom, format, metrics, copilotContext)"
```

---

## Phase 3 — Shell Layout (~2 hours)

### Task 3.1: App.tsx with tab routing via URL hash

**Files:** `src/App.tsx`

- [ ] **Step 1:** Implement `App.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { TopNav } from './components/shell/TopNav'
import { HeaderStrip } from './components/shell/HeaderStrip'
import { Footer } from './components/shell/Footer'
import { CopilotDock } from './components/shell/CopilotDock'
import { OverviewTab } from './tabs/OverviewTab'
import { AccountingTab } from './tabs/AccountingTab'
import { OperationsTab } from './tabs/OperationsTab'
import { MarketingTab } from './tabs/MarketingTab'
import { InvestmentsTab } from './tabs/InvestmentsTab'
import { ConstructionTab } from './tabs/ConstructionTab'
import { RoadmapTab } from './tabs/RoadmapTab'
import { SettingsTab } from './tabs/SettingsTab'

export type TabId = 'overview'|'accounting'|'operations'|'marketing'|'investments'|'construction'|'roadmap'|'settings'

const TABS: Record<TabId, () => React.ReactElement> = {
  overview: OverviewTab,
  accounting: AccountingTab,
  operations: OperationsTab,
  marketing: MarketingTab,
  investments: InvestmentsTab,
  construction: ConstructionTab,
  roadmap: RoadmapTab,
  settings: SettingsTab,
}

function readTabFromHash(): TabId {
  const h = window.location.hash.slice(1) as TabId
  return h in TABS ? h : 'overview'
}

export default function App() {
  const [tab, setTab] = useState<TabId>(readTabFromHash())
  useEffect(() => {
    const onHash = () => setTab(readTabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => { window.location.hash = `#${tab}` }, [tab])
  const ActiveTab = TABS[tab]
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderStrip />
      <TopNav active={tab} onChange={setTab} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 pb-32">
        <ActiveTab />
      </main>
      <Footer />
      <CopilotDock activeTab={tab} />
    </div>
  )
}
```

- [ ] **Step 2:** Verify with `npm run dev`. Page should render (tabs are stubs that return null). Commit.

### Task 3.2: TopNav.tsx

**Files:** `src/components/shell/TopNav.tsx`

- [ ] **Step 1:** Implement: 8 tab buttons, active state styled in 10F red underline, accessible names.

```tsx
import type { TabId } from '../../App'

const ITEMS: { id: TabId; label: string; count?: number }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'operations', label: 'Operations', count: 130 },
  { id: 'marketing', label: 'Marketing' },
  { id: 'investments', label: 'Investments', count: 3 },
  { id: 'construction', label: 'Construction', count: 7 },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'settings', label: 'Settings' },
]

export function TopNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="border-b border-10f-border">
      <div className="max-w-7xl mx-auto flex gap-1 px-6 overflow-x-auto">
        {ITEMS.map(it => (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              active === it.id ? 'border-10f-red text-10f-red' : 'border-transparent text-10f-text-muted hover:text-10f-text'
            }`}
          >
            {it.label}
            {it.count !== undefined && <span className="ml-1.5 text-xs opacity-70">({it.count})</span>}
          </button>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2:** Test render + clicking changes URL hash. Commit.

### Task 3.3: HeaderStrip.tsx

**Files:** `src/components/shell/HeaderStrip.tsx`

- [ ] **Step 1:** Implement per spec Section 7: logo + "10F Ops Co-Pilot" + "Co-Pilot ready" pill + last-updated timestamp + "Open chat →" link + tagline.

- [ ] **Step 2:** Commit.

### Task 3.4: Footer.tsx with "Why I built this" tooltip

**Files:** `src/components/shell/Footer.tsx`

- [ ] **Step 1:** Implement attribution + a popover containing the ~200-word "Why I built this" note. Content for the note:

> "I'm Sterling Mull. I built this in response to the Junior Software & AI Engineer post (May 14). The JD reads as 'first technical hire who owns the connective tissue across the operating company' — and that's the shape of work I've been doing for 15 years as an independent operator and the last 3 years building AI agents and MCP servers. This demo is structured as the dashboard I'd actually ship in week one: the Day 1 Backlog under Roadmap is real (Lighthouse audit + customer-portal walkthrough on 2026-05-29), the data is real where the data is public (facilities, funds, construction projects, leadership), the integrations named on each tab are the real industry-standard stack (SiteLink, Juniper Square, Procore — not generic SaaS placeholders), and the AI Co-Pilot is the actual thing, not a mockup. If this resonates: hi Andrew, Christopher, Brian — let's talk. sterlingmull.com"

- [ ] **Step 2:** Commit.

### Task 3.5: CopilotDock shell (no logic yet)

**Files:** `src/components/shell/CopilotDock.tsx`

- [ ] **Step 1:** Implement a sticky-bottom container with a closed-by-default panel + open button. Real chat wiring lands in Phase 6.

- [ ] **Step 2:** Commit.

---

## Phase 4 — Shared Components (~2 hours)

> For each component: implement, render in App with mock props, eyeball it, commit. Visual components don't get unit tests — they get exposed via the dev server and inspected.

### Task 4.1: KpiCard + KpiStrip

**Files:** `src/components/shared/KpiCard.tsx`, `src/components/shared/KpiStrip.tsx`

- [ ] **Step 1:** Implement KpiCard props: `{ label, value, delta?, sparkline? }`. Card style: white bg, subtle shadow, large number, small label, optional ↑/↓ delta pill.
- [ ] **Step 2:** Implement KpiStrip as a 4-up grid (responsive).
- [ ] **Step 3:** Commit.

### Task 4.2: Leaderboard.tsx

**Files:** `src/components/shared/Leaderboard.tsx`

- [ ] **Step 1:** Generic leaderboard table: props `{ title, rows: { rank, name, metric, delta? }[], colorByIndex }`. Aesthetic uses color-coded entity hues per row.
- [ ] **Step 2:** Commit.

### Task 4.3: AlertCard.tsx

**Files:** `src/components/shared/AlertCard.tsx`

- [ ] **Step 1:** Implement: severity-colored left border, message, timestamp, "Ask Co-Pilot →" link that opens the dock with the alert's `askPrompt` pre-seeded.
- [ ] **Step 2:** Commit.

### Task 4.4: ConnectedSystems.tsx

**Files:** `src/components/shared/ConnectedSystems.tsx`

- [ ] **Step 1:** Props: `{ items: ConnectedSystem[] }`. Renders a horizontal-scroll row of pill chips: `{name} · synced {minutes} ago · {status icon} · {metric?}`.
- [ ] **Step 2:** Commit.

### Task 4.5: ChartCard.tsx

**Files:** `src/components/shared/ChartCard.tsx`

- [ ] **Step 1:** Card wrapper with title + optional filter toggles + Recharts ResponsiveContainer slot for children.
- [ ] **Step 2:** Commit.

### Task 4.6: SectionHeader.tsx

**Files:** `src/components/shared/SectionHeader.tsx`

- [ ] **Step 1:** Props: `{ title, subtitle?, ownedBy?: { name, role } }`. Renders the "Trent's close calendar" / "Cliff's pipeline" personalization anchors per spec Section 8.
- [ ] **Step 2:** Commit.

```bash
git add .
git commit -m "feat: shared component library (KPI, Leaderboard, Alert, Connected, Chart, Section)"
```

---

## Phase 5 — Tabs (~5-6 hours, in priority order)

> **Priority order from spec Section 11:** Overview → Roadmap (Day 1 Backlog — highest signal) → Construction → Investments → Operations → Marketing → Accounting → Settings.
>
> **Per-tab pattern:** import data, compute KPIs via `metrics.ts`, compose shared components, add 6 seed prompts at the bottom. Eyeball in dev server. Commit per tab.

### Task 5.1: OverviewTab

**Files:** `src/tabs/OverviewTab.tsx`

Contents per spec:
- KpiStrip: Total facilities (130) · Total units · Network occupancy % · TTM revenue
- ChartCard: Daily network revenue 30d (Recharts line chart with brand filter toggles)
- Leaderboard ×2: Top 10 / Bottom 10 facilities by occupancy
- Alerts feed: 6-8 from `alerts.json`
- Recent rentals feed from `leads.json`
- 6 seed prompts (stored in `OverviewTab.tsx` as a const)

- [ ] **Step 1:** Build. **Step 2:** Eyeball. **Step 3:** Commit `feat: Overview tab`.

### Task 5.2: RoadmapTab (Day 1 Backlog + 8-pillar phased plan)

**Files:** `src/tabs/RoadmapTab.tsx`

- [ ] **Step 1:** Render header attribution to Christopher Taylor's AI mandate.
- [ ] **Step 2:** Day 1 Backlog table — render `backlog.json` as the markdown table from the spec.
- [ ] **Step 3:** 3 phases, each with collapsible pillar cards from `roadmap.json`. Aesthetic-style expand-on-click to reveal day-by-day steps.
- [ ] **Step 4:** 6 seed prompts. Commit.

### Task 5.3: ConstructionTab

**Files:** `src/tabs/ConstructionTab.tsx`

- [ ] **Step 1:** KpiStrip · Pipeline kanban (7 stages) · Active projects table · Completed projects (Graham NC) · Capex burn chart · ConnectedSystems rail · 6 seed prompts.
- [ ] **Step 2:** Commit.

### Task 5.4: InvestmentsTab

**Files:** `src/tabs/InvestmentsTab.tsx`

- [ ] **Step 1:** KpiStrip · Fund waterfall card (3 funds — IRR/deployed/vintage) · Acquisition pipeline · Opportunistic subscription tracker · Recent transactions feed · ConnectedSystems · 6 seed prompts.
- [ ] **Step 2:** Commit.

### Task 5.5: OperationsTab (Metabase iframe stays a placeholder for now)

**Files:** `src/tabs/OperationsTab.tsx`

- [ ] **Step 1:** KpiStrip · Placeholder for Metabase iframe (Phase 7 fills it) · Per-facility ops drill-down · Climate vs non-climate breakdown · RV/boat performance · ConnectedSystems · 6 seed prompts.
- [ ] **Step 2:** Commit.

### Task 5.6: MarketingTab

**Files:** `src/tabs/MarketingTab.tsx`

- [ ] **Step 1:** KpiStrip · Channel performance 30d chart · Brand portfolio breakdown · Per-market CPL leaderboard · Recent leads feed · Lead templates · ConnectedSystems · 6 seed prompts.
- [ ] **Step 2:** Commit.

### Task 5.7: AccountingTab

**Files:** `src/tabs/AccountingTab.tsx`

- [ ] **Step 1:** KpiStrip · Revenue vs opex chart · Fund accounting table · "Trent's close calendar" widget · ConnectedSystems · 6 seed prompts.
- [ ] **Step 2:** Commit.

### Task 5.8: SettingsTab

**Files:** `src/tabs/SettingsTab.tsx`

- [ ] **Step 1:** Lightweight placeholder per Aesthetic — single card noting "Settings — same as Aesthetic pattern."
- [ ] **Step 2:** Commit.

```bash
git commit -m "feat: all 8 tabs scaffolded with mocked data"
```

---

## Phase 6 — AI Co-Pilot (~3 hours)

### Task 6.1: Wire `/api/copilot` serverless route

**Files:** `api/copilot.ts`, `.env.example`, `vercel.json`

- [ ] **Step 1:** Add `.env.example`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

- [ ] **Step 2:** Add `vercel.json`:

```json
{
  "functions": {
    "api/copilot.ts": { "runtime": "nodejs20.x" }
  }
}
```

- [ ] **Step 3:** Implement `api/copilot.ts`:

```ts
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from '../src/lib/copilotContext'
import type { TabId } from '../src/App'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const { messages, activeTab } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[]
    activeTab: TabId
  }
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6-20250514',  // verify exact model id at build time
    max_tokens: 1024,
    system: buildSystemPrompt(activeTab),
    messages,
  })
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })
  return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
```

- [ ] **Step 4:** Test locally with `vercel dev` (install Vercel CLI first if needed).

```bash
curl -sN -X POST http://localhost:3000/api/copilot \
  -H "Content-Type: application/json" \
  -d '{"activeTab":"overview","messages":[{"role":"user","content":"What is the network occupancy?"}]}'
```

Expected: streaming text response that references facility data.

- [ ] **Step 5:** Commit.

```bash
git add api/ vercel.json .env.example
git commit -m "feat: /api/copilot route with Anthropic streaming"
```

### Task 6.2: CopilotDock with chat state

**Files:** `src/components/shell/CopilotDock.tsx`, `src/components/copilot/ChatMessage.tsx`, `src/components/copilot/ChatInput.tsx`

- [ ] **Step 1:** Implement chat state management (messages array, sending state, abort controller).
- [ ] **Step 2:** Implement streaming fetch to `/api/copilot` with chunked response handling.
- [ ] **Step 3:** Render ChatMessage components with simple markdown support (use `react-markdown` if needed; install `npm i react-markdown`).
- [ ] **Step 4:** ChatInput with Enter-to-send / Shift+Enter for newline.
- [ ] **Step 5:** Test live with `vercel dev`. Commit.

### Task 6.3: SeedPrompts per tab

**Files:** `src/components/copilot/SeedPrompts.tsx`

- [ ] **Step 1:** Each tab exposes its `seedPrompts: string[]` (from spec Section 6). SeedPrompts renders 6 clickable cards; clicking pre-fills the input.
- [ ] **Step 2:** Commit.

### Task 6.4: Wire contextual "Ask Co-Pilot →" links from alerts

**Files:** `src/components/shared/AlertCard.tsx` (modify), `src/components/shell/CopilotDock.tsx` (modify)

- [ ] **Step 1:** Add a lightweight event bus (CustomEvent on `window`) or context provider so alert clicks open the dock with a seeded prompt.
- [ ] **Step 2:** Test the flow end-to-end. Commit.

```bash
git add .
git commit -m "feat: AI Co-Pilot live with per-tab context and seed prompts"
```

---

## Phase 7 — Metabase Live Embed (~1-2 hours)

### Task 7.1: Provision Metabase on Fly.io

**Out-of-band — done from a terminal, not the codebase.**

- [ ] **Step 1:** Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
- [ ] **Step 2:** `fly launch` in a temporary directory using the official Metabase Docker image. Use the free shared-cpu-1x tier.
- [ ] **Step 3:** Confirm Metabase boots and is reachable at the assigned `*.fly.dev` URL.

### Task 7.2: Seed Metabase with facility data

- [ ] **Step 1:** Convert `src/data/facilities.json` to SQLite. Use this Node script:

```bash
node -e "
const fs=require('fs');
const Database=require('better-sqlite3');
const f=JSON.parse(fs.readFileSync('src/data/facilities.json','utf8'));
const db=new Database('facilities.sqlite');
db.exec('CREATE TABLE facilities (id TEXT, name TEXT, city TEXT, state TEXT, brand TEXT, units INT, occupancy REAL, revenue REAL)');
const stmt=db.prepare('INSERT INTO facilities VALUES (?,?,?,?,?,?,?,?)');
const tx=db.transaction(rows=>{for(const r of rows) stmt.run(r.id,r.name,r.city,r.state,r.brand,r.units,r.occupancyPct,r.monthlyRevenue);});
tx(f);
"
```

(Install `better-sqlite3` first: `npm i -D better-sqlite3`.)

- [ ] **Step 2:** Upload the SQLite file to the Metabase instance (Fly.io persistent volume) or use Metabase's H2/Postgres backend with seeded inserts.
- [ ] **Step 3:** In Metabase: create a public-shareable dashboard with a facility occupancy heatmap (by state) and a brand-revenue donut.
- [ ] **Step 4:** Copy the public embed URL.

### Task 7.3: Embed the iframe in OperationsTab

**Files:** `src/tabs/OperationsTab.tsx`

- [ ] **Step 1:** Replace the placeholder with:

```tsx
<ChartCard title="Live: Network Occupancy Heatmap">
  <iframe
    src="https://10f-metabase.fly.dev/public/dashboard/<UUID>"
    title="10F Network Occupancy"
    width="100%"
    height="520"
    frameBorder="0"
    allowTransparency
  />
</ChartCard>
```

- [ ] **Step 2:** Test that the iframe loads. Commit.

```bash
git add .
git commit -m "feat: live Metabase embed on Operations tab"
```

**Fallback if Metabase setup is taking too long:** Replace the iframe with a polished static Recharts heatmap that styles to look like Metabase. Mark the section as "Live data via Metabase — preview." Sterling can swap in the real iframe later.

---

## Phase 8 — Personalization Polish (~1-2 hours)

### Task 8.1: Sample exact 10F red hex

- [ ] **Step 1:** Open https://10federalstorage.com/ in a browser, use a color picker to sample the logo red.
- [ ] **Step 2:** Update `tailwind.config.ts` `10f-red` to the sampled value (likely close to `#C8102E` — verify).
- [ ] **Step 3:** Commit.

### Task 8.2: Wire executive name-drops per tab

**Files:** all of `src/tabs/*.tsx`

- [ ] **Step 1:** Use `SectionHeader.tsx` with `ownedBy` prop per spec Section 8:
  - Accounting → Trent Erickson
  - Operations → Capranos / Oakley
  - Marketing → (unowned in the data; show "Owned by the marketing team")
  - Investments → Cliff Minsley
  - Construction → Cliff Minsley
  - Roadmap → Christopher Taylor attribution in the header
- [ ] **Step 2:** Commit.

### Task 8.3: Why-I-Built-This tooltip content + favicon

**Files:** `src/components/shell/Footer.tsx`, `public/favicon.svg`

- [ ] **Step 1:** Confirm the Why-I-Built-This tooltip text is rendered.
- [ ] **Step 2:** Create `public/favicon.svg` — a red circle with "10F" inside.
- [ ] **Step 3:** Commit.

### Task 8.4: Demo-itself Lighthouse check

- [ ] **Step 1:** Run Lighthouse against `localhost:5173` (dev) or a Vercel preview build.
- [ ] **Step 2:** Verify targets from spec planning decision: LCP <1.5s, INP <100ms, CLS 0, Accessibility 100, SEO 100, Best Practices 100.
- [ ] **Step 3:** Fix any failures (likely candidates: image optimization, lazy-load Recharts, defer the Metabase iframe).
- [ ] **Step 4:** Commit.

---

## Phase 9 — Deploy + QA (~1-2 hours)

### Task 9.1: Vercel project + deploy

- [ ] **Step 1:** `vercel link` to bind the local project to a Vercel project.
- [ ] **Step 2:** Set `ANTHROPIC_API_KEY` in Vercel dashboard env vars (Production + Preview).
- [ ] **Step 3:** `vercel --prod` deploy. Verify the deployment URL renders.

### Task 9.2: DNS for 10federal.sterlingmull.com

- [ ] **Step 1:** In the sterlingmull.com DNS console, add a CNAME `10federal` → `cname.vercel-dns.com`.
- [ ] **Step 2:** Add the custom domain in the Vercel project settings.
- [ ] **Step 3:** Wait for SSL provision (usually <5 min).
- [ ] **Step 4:** Confirm https://10federal.sterlingmull.com loads.

### Task 9.3: QA checklist on the live URL

- [ ] All 8 tabs render without errors
- [ ] Tab state persists across URL hash changes
- [ ] AI Co-Pilot returns sensible answers to 3 prompts:
  - "Which facilities are losing occupancy this week?"
  - "Walk me through the Opportunistic Offering deployment plan"
  - "Why is the Unified Customer Portal pillar in Phase 1?"
- [ ] Lighthouse on the production URL hits the targets from Task 8.4
- [ ] Metabase iframe loads (or fallback static chart renders)
- [ ] All 6 Day 1 Backlog items are visible on the Roadmap tab
- [ ] Footer attribution shows Sterling's name + Why-I-Built-This tooltip works
- [ ] No console errors

### Task 9.4: Tag v1.0.0

- [ ] **Step 1:** `git tag v1.0.0` · `git push origin v1.0.0`
- [ ] **Step 2:** Done. URL is shippable in the application.

---

## Total Estimated Build Time

| Phase | Time |
|---|---|
| 0 — Scaffold | ~1 hr |
| 1 — Data layer | ~3-4 hr |
| 2 — Utility lib | ~1 hr |
| 3 — Shell layout | ~2 hr |
| 4 — Shared components | ~2 hr |
| 5 — Tabs (×8) | ~5-6 hr |
| 6 — AI Co-Pilot | ~3 hr |
| 7 — Metabase embed | ~1-2 hr |
| 8 — Personalization | ~1-2 hr |
| 9 — Deploy + QA | ~1-2 hr |
| **Total** | **~20-25 hr (~3 working days)** |

---

## Decision points worth re-confirming with the human during execution

- **Brand color exact hex** (Task 8.1 — sample, don't guess)
- **Metabase hosting cost vs fallback** (Task 7.1 — if Fly.io setup blocks > 30 min, fall back to a styled static chart)
- **Co-Pilot model id** (Task 6.1 — verify the exact Claude Sonnet 4.6 model id is current at build time; check `https://docs.anthropic.com/en/docs/about-claude/models`)
- **Hex sample for sub-brand portal references** (Task 8.2 — if you want sub-brand portfolio screenshots embedded, add Phase 8.5)
