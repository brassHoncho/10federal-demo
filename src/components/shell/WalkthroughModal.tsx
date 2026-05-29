import { useEffect, useRef } from 'react'

type Props = {
  open: boolean
  onClose: () => void
}

const TRANSCRIPT = [
  `This is the 10F Ops Co-Pilot — a tailored dashboard Sterling Mull built in response to your Junior Software and AI Engineer post.`,
  `A few things about Sterling. He's an independent AI and automation developer based in Raleigh — the same town as your headquarters. For the last three years he's been building production AI agent systems: four MCP servers with sixty-plus tools, multiple Claude Code orchestration patterns, and AI-augmented operational dashboards for businesses that look a lot like 10 Federal. Before that, fifteen years as an e-commerce operator running real stores on Amazon, Etsy, and Shopify.`,
  `Here's the reasoning behind the demo. Your JD reads as "first technical hire who owns the connective tissue across the operating company." That's the exact shape of work Sterling has been doing. Rather than send a generic resume, he built the dashboard he'd actually ship in week one — populated with your real facility data, your real fund vehicles, your real construction projects, and a real Day 1 Backlog sourced from a live Lighthouse audit plus a customer portal walkthrough across all five of your sub-brands.`,
  `What this demonstrates. Sterling builds AI-native. The whole demo — every tab, every component, the streaming Anthropic Co-Pilot, the data layer — was built in roughly three working days using Claude Code as his primary build tool. That ratio matters. It mirrors your own operating thesis: a hundred properties run with fewer than a hundred employees because automation is the multiplier. Christopher Taylor's AI mandate. Brian Oakley's enterprise platform discipline. Andrew Capranos's full-stack operational view. Sterling is asking to ship in that lane.`,
  `If anything here resonates: open the chat. Ask anything. Or reach Sterling directly at sterlingmull.com.`,
]

export default function WalkthroughModal({ open, onClose }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)

  // Pause audio when closing.
  useEffect(() => {
    if (!open && audioRef.current) {
      audioRef.current.pause()
    }
  }, [open])

  // Escape to close.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 px-6 py-4 border-b border-10f-border">
          <div>
            <h2 className="font-semibold text-lg">Architecture walkthrough · ~2 min</h2>
            <p className="text-sm text-10f-text-muted mt-0.5">
              Who Sterling is, why he built this demo, and how it was made.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-10f-text-muted hover:text-10f-text text-lg leading-none"
            aria-label="Close walkthrough"
          >
            ✕
          </button>
        </header>

        <div className="px-6 py-4 border-b border-10f-border bg-10f-surface">
          <audio
            ref={audioRef}
            controls
            preload="metadata"
            className="w-full"
            src="/walkthrough.mp3"
          >
            <track kind="captions" />
            Your browser does not support the audio element.
          </audio>
          <p className="text-xs text-10f-text-muted mt-2">
            If the audio doesn't load, the file at <code>/walkthrough.mp3</code> hasn't been generated
            yet. Transcript is below.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed space-y-4">
          {TRANSCRIPT.map((p, i) => (
            <p key={i} className={i === 0 ? 'font-medium' : ''}>{p}</p>
          ))}
          <div className="pt-2 mt-3 border-t border-10f-border text-xs text-10f-text-muted">
            Voiced via ElevenLabs · script + audio in <code>narration/</code>
          </div>
        </div>
      </div>
    </div>
  )
}
