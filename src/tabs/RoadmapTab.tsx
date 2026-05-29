import { useState } from 'react'
import backlog from '../data/backlog.json'
import roadmap from '../data/roadmap.json'
import type { BacklogItem, RoadmapPillar } from '../lib/schemas'
import SectionHeader from '../components/shared/SectionHeader'

const BACKLOG = backlog as BacklogItem[]
const ROADMAP = roadmap as RoadmapPillar[]

const PHASE_LABEL: Record<1 | 2 | 3, { title: string; window: string }> = {
  1: { title: 'Phase 1', window: 'Days 1-90 — Foundation' },
  2: { title: 'Phase 2', window: 'Days 91-180 — Intelligence layers' },
  3: { title: 'Phase 3', window: 'Days 181-365 — Compounded automation' },
}

const SEED_PROMPTS = [
  'Walk me through the Day 1 Backlog and prioritize for impact',
  'Why is the Unified Customer Portal pillar in Phase 1?',
  'Compare the construction project intelligence pillar to what Procore already gives us',
  'What would I have to change in the AI agent workforce roadmap if Christopher wants to skip RAG entirely?',
  'How would the Year 1 roadmap shift if 10F closes Fund 4 in Q3?',
  'Sketch the Fund-Level Reporting Automation pillar as an MCP server architecture',
]

export default function RoadmapTab() {
  const [openPillar, setOpenPillar] = useState<number | null>(1)

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Roadmap"
        subtitle="Built for Christopher Taylor's industry-first AI mandate — extending the 100-properties-with-<100-employees thesis into every department."
        ownedBy={[
          { name: 'Christopher Taylor', role: 'Chief AI Officer' },
          { name: 'Brian Oakley', role: 'Head of Technology' },
        ]}
      />

      <section className="rounded-xl border border-10f-red/30 bg-red-50/40 p-5">
        <div className="flex items-baseline gap-3 mb-1">
          <h3 className="text-base font-semibold text-10f-red">Day 1 Backlog — Quick Wins</h3>
          <span className="text-xs text-10f-text-muted">
            6 items · ~7-9 days · evidence-based from Lighthouse + manual portal audit on 2026-05-29
          </span>
        </div>
        <p className="text-sm text-10f-text-muted mb-4">
          Things I noticed I'd ship in the first 14 days. Each item is real, scoped, and time-estimated.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-10f-text-muted border-b border-10f-border">
                <th className="py-2 pr-3 w-8">#</th>
                <th className="py-2 pr-3">Ship</th>
                <th className="py-2 pr-3 w-32">Estimate</th>
                <th className="py-2">Why it matters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-10f-border">
              {BACKLOG.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="py-3 pr-3 font-mono text-xs text-10f-red">{item.number}</td>
                  <td className="py-3 pr-3">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-10f-text-muted mt-1">{item.description}</div>
                    <div className="text-xs text-10f-text-muted mt-1 italic">
                      Evidence: {item.evidence}
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-xs text-10f-text-muted whitespace-nowrap">
                    {item.estimate}
                  </td>
                  <td className="py-3 text-xs">{item.businessOutcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {([1, 2, 3] as const).map((phase) => {
        const pillars = ROADMAP.filter((p) => p.phase === phase)
        return (
          <section key={phase}>
            <div className="mb-3 flex items-baseline gap-3">
              <h3 className="text-lg font-semibold">{PHASE_LABEL[phase].title}</h3>
              <span className="text-sm text-10f-text-muted">{PHASE_LABEL[phase].window}</span>
            </div>
            <div className="grid gap-3">
              {pillars.map((pillar) => {
                const isOpen = openPillar === pillar.pillarNumber
                return (
                  <article
                    key={pillar.pillarNumber}
                    className="rounded-xl border border-10f-border bg-white shadow-sm overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenPillar(isOpen ? null : pillar.pillarNumber)}
                      className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-10f-surface transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="font-mono text-xs text-10f-red font-bold w-12 shrink-0 mt-0.5">
                        Pillar {pillar.pillarNumber}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base">{pillar.title}</h4>
                        <p className="text-sm text-10f-text-muted mt-1">{pillar.summary}</p>
                      </div>
                      <span className="text-10f-text-muted text-sm mt-0.5 shrink-0">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <ol className="border-t border-10f-border divide-y divide-10f-border">
                        {pillar.steps.map((step) => (
                          <li
                            key={step.day}
                            className="px-5 py-3 flex gap-4 text-sm hover:bg-10f-surface/50"
                          >
                            <span className="font-mono text-xs text-10f-text-muted w-24 shrink-0">
                              {step.day}
                            </span>
                            <span>{step.description}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}

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
