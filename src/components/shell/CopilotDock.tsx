import { useEffect, useRef, useState } from 'react'
import type { TabId } from '../../App'
import ChatMessage from '../copilot/ChatMessage'
import ChatInput from '../copilot/ChatInput'

type Message = { role: 'user' | 'assistant'; content: string }

type Props = {
  activeTab: TabId
}

const CONVERSATION_STARTERS = [
  "Why should we be interested in Sterling specifically? Walk me through his fit for this role.",
  "Show me the Day 1 Backlog — what would he actually ship in week one and what's the evidence?",
  "Compare 10FSSAC3 and 10FSSAC4 same-store NOI growth — what does it tell us about the platform?",
  "How would the AI agent workforce in Phase 2 extend our 100-properties-with-<100-employees thesis?",
  "What's broken on our website and customer portal — and what's the recommended fix order?",
  "How was this demo built? What's the stack and how much of it was AI-augmented?",
]

const STARTER_LABELS = [
  'About Sterling',
  'Day 1 Backlog',
  'NOI growth',
  'AI workforce',
  'Site + portal fixes',
  'How was this built',
]

export default function CopilotDock({ activeTab }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Open chat (and optionally pre-fire a starter) when other components dispatch open-copilot.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true)
      const detail = (e as CustomEvent<{ prompt?: string }>).detail
      if (detail?.prompt) {
        // Pre-fill input rather than auto-fire for external triggers
        // (those come from Ask Co-Pilot buttons on alerts, where the user is
        // confirming the prompt — not picking a starter).
        setInput(detail.prompt)
      }
    }
    window.addEventListener('open-copilot', onOpen)
    return () => window.removeEventListener('open-copilot', onOpen)
  }, [])

  // Scroll-on-new-message-only. We only fire scrollIntoView when a NEW message
  // is added (length changes) — NOT while the assistant is streaming content
  // into the last message. That way the user can start reading at the top of
  // a long response while the rest streams in below them.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
    // Intentionally watching length only, not content of last message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length])

  async function send(overrideText?: string) {
    const raw = (overrideText ?? input).trim()
    if (!raw || busy) return

    const userMsg: Message = { role: 'user', content: raw }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setBusy(true)
    setError(null)

    // Add an empty assistant placeholder we'll fill via streaming.
    setMessages((m) => [...m, { role: 'assistant', content: '' }])

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, activeTab }),
        signal: ctrl.signal,
      })

      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(errBody || `HTTP ${res.status}`)
      }
      if (!res.body) throw new Error('No response stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((m) => {
          const copy = [...m]
          copy[copy.length - 1] = { role: 'assistant', content: acc }
          return copy
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'request failed'
      setError(msg)
      setMessages((m) => {
        const copy = [...m]
        copy[copy.length - 1] = { role: 'assistant', content: `[Couldn't reach the Co-Pilot. ${msg}]` }
        return copy
      })
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }

  function runStarter(text: string) {
    // One click → fires the question. No second Send press needed.
    if (busy) return
    send(text)
  }

  function reset() {
    abortRef.current?.abort()
    setMessages([])
    setInput('')
    setError(null)
    setBusy(false)
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 pb-4 flex justify-end">
        {open ? (
          <div className="pointer-events-auto w-full md:w-[520px] max-h-[78vh] rounded-2xl border border-10f-border bg-white shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-10f-border px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-2 w-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className="font-semibold text-sm truncate">10F Ops Co-Pilot</span>
                <span className="text-xs text-10f-text-muted">· {activeTab}</span>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={reset}
                    className="text-xs text-10f-text-muted hover:text-10f-text"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-10f-text-muted hover:text-10f-text text-sm"
                  aria-label="Close chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Persistent starter pills — visible the entire chat, BELOW the header
                so they're always in view. Click any one → fires immediately. */}
            <div className="border-b border-10f-border bg-red-50/40 px-3 py-2 overflow-x-auto shrink-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-xs font-medium text-10f-red px-1 shrink-0">Quick prompts:</span>
                {STARTER_LABELS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => runStarter(CONVERSATION_STARTERS[i])}
                    disabled={busy}
                    className="text-xs rounded-full border border-10f-red/40 bg-white text-10f-red hover:bg-10f-red hover:text-white px-3 py-1 transition-colors disabled:opacity-40 shrink-0 font-medium"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable message area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-[260px]"
            >
              {messages.length === 0 ? (
                <div className="text-xs text-10f-text-muted px-2 py-6 text-center leading-relaxed">
                  Pick a Quick Prompt above, type your own question below, or click any
                  <span className="text-10f-red font-medium"> Ask Co-Pilot →</span> link on the dashboard.
                </div>
              ) : (
                messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} />)
              )}
            </div>

            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={send}
              disabled={busy}
              placeholder={busy ? 'Streaming…' : `Ask about ${activeTab}…`}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-10f-red text-white px-5 py-3 shadow-lg hover:bg-10f-red-dark font-medium text-sm"
          >
            <span aria-hidden className="h-2 w-2 rounded-full bg-white" />
            Ask 10F Ops Co-Pilot →
          </button>
        )}
      </div>
    </div>
  )
}
