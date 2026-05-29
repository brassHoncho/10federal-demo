import { useEffect, useRef, useState } from 'react'
import type { TabId } from '../../App'
import ChatMessage from '../copilot/ChatMessage'
import ChatInput from '../copilot/ChatInput'

type Message = { role: 'user' | 'assistant'; content: string }

const CONVERSATION_STARTERS = [
  "Why should we be interested in Sterling specifically? Walk me through his fit for this role.",
  "Show me the Day 1 Backlog — what would he actually ship in week one and what's the evidence?",
  "Compare 10FSSAC3 and 10FSSAC4 same-store NOI growth — what does it tell us about the platform?",
  "How would the AI agent workforce in Phase 2 extend our 100-properties-with-<100-employees thesis?",
  "What's broken on our website and customer portal — and what's the recommended fix order?",
  "How was this demo built? What's the stack and how much of it was AI-augmented?",
]

type Props = {
  activeTab: TabId
}

export default function CopilotDock({ activeTab }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Open chat (and optionally pre-seed a prompt) when other components fire open-copilot.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true)
      const detail = (e as CustomEvent<{ prompt?: string }>).detail
      if (detail?.prompt) {
        setInput(detail.prompt)
      }
    }
    window.addEventListener('open-copilot', onOpen)
    return () => window.removeEventListener('open-copilot', onOpen)
  }, [])

  // Autoscroll on new content.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy])

  async function send() {
    const trimmed = input.trim()
    if (!trimmed || busy) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setBusy(true)
    setError(null)

    // Add an empty assistant message that we'll fill via streaming.
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
        // Replace the empty assistant placeholder with the error
        copy[copy.length - 1] = { role: 'assistant', content: `[Couldn't reach the Co-Pilot. ${msg}]` }
        return copy
      })
    } finally {
      setBusy(false)
      abortRef.current = null
    }
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
          <div className="pointer-events-auto w-full md:w-[480px] max-h-[78vh] rounded-2xl border border-10f-border bg-white shadow-2xl flex flex-col overflow-hidden">
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

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-[200px]"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col gap-2 py-1 px-1">
                  <div className="text-xs text-10f-text-muted px-2 mb-1">
                    Start with one of these — or type your own.
                  </div>
                  {CONVERSATION_STARTERS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setInput(s)}
                      className="text-left text-sm rounded-lg border border-10f-border bg-white hover:border-10f-red hover:bg-red-50/30 px-3 py-2 leading-snug transition-colors"
                    >
                      {s}
                    </button>
                  ))}
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
            <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />
            Ask 10F Ops Co-Pilot →
          </button>
        )}
      </div>
    </div>
  )
}
