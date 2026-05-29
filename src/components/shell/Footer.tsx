import { useState } from 'react'

const WHY_TEXT = `I'm Sterling Mull. I built this in response to the Junior Software & AI Engineer post (May 14). The JD reads as "first technical hire who owns the connective tissue across the operating company" — and that's the shape of work I've been doing for 15 years as an independent operator and the last 3 years building AI agents and MCP servers.

This demo is structured as the dashboard I'd actually ship in week one: the Day 1 Backlog under Roadmap is real (Lighthouse audit + customer-portal walkthrough on 2026-05-29), the data is real where the data is public (facilities, funds, construction projects, leadership), the integrations named on each tab are the real industry-standard stack (SiteLink, Juniper Square, Procore — not generic SaaS placeholders), and the AI Co-Pilot is the actual thing, not a mockup.

If this resonates: hi Andrew, Christopher, Brian — let's talk. sterlingmull.com`

export default function Footer() {
  const [open, setOpen] = useState(false)

  return (
    <footer className="mt-auto border-t border-10f-border bg-10f-surface">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center gap-4 text-xs text-10f-text-muted">
        <span>
          Built by{' '}
          <a href="https://sterlingmull.com" className="text-10f-red hover:underline font-medium">
            Sterling Mull
          </a>{' '}
          for 10 Federal's automation-first operating thesis
        </span>
        <span aria-hidden>·</span>
        <span>Claude Sonnet 4.6</span>
        <span aria-hidden>·</span>
        <span>Vercel AI SDK</span>
        <span aria-hidden>·</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-10f-red hover:underline font-medium"
        >
          ← Why I built this
        </button>
      </div>

      {open && (
        <div className="border-t border-10f-border bg-white">
          <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-10f-text whitespace-pre-line leading-relaxed">
            {WHY_TEXT}
          </div>
        </div>
      )}
    </footer>
  )
}
