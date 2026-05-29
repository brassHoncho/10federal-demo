import { useEffect, useState } from 'react'
import type { TabId } from '../../App'

type Props = {
  activeTab: TabId
}

/**
 * Bottom-anchored chat dock shell. Visible-but-closed by default;
 * clicking the chip opens the panel. Full chat wiring lands in Phase 6.
 */
export default function CopilotDock({ activeTab }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener('open-copilot', onOpen)
    return () => window.removeEventListener('open-copilot', onOpen)
  }, [])

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 pb-4 flex justify-end">
        {open ? (
          <div className="pointer-events-auto w-full md:w-[480px] rounded-2xl border border-10f-border bg-white shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-10f-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="font-semibold text-sm">10F Ops Co-Pilot</span>
                <span className="text-xs text-10f-text-muted">· {activeTab}</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-10f-text-muted hover:text-10f-text text-sm"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-6 text-sm text-10f-text-muted">
              <p>Chat wiring lands in Phase 6 — Anthropic Claude Sonnet 4.6 via Vercel AI SDK with per-tab context.</p>
              <p className="mt-2">Try the seed prompts on the active tab once that ships.</p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-10f-red text-white px-5 py-3 shadow-lg hover:bg-10f-red-dark font-medium text-sm"
            aria-label="Open 10F Ops Co-Pilot"
          >
            <span className="h-2 w-2 rounded-full bg-white" />
            Ask 10F Ops Co-Pilot →
          </button>
        )}
      </div>
    </div>
  )
}
