import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt, type TabId } from '../src/lib/copilotContext.js'

// Defaults to Claude Sonnet 4.5. Override via ANTHROPIC_MODEL env var to
// upgrade to 4.6+ when available (or for A/B testing different model tiers).
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5-20250929'
const MAX_TOKENS = 1024

type ChatMessage = { role: 'user' | 'assistant'; content: string }

type RequestBody = {
  messages: ChatMessage[]
  activeTab: TabId
}

// Named POST export — Vercel's Node.js runtime uses this Web fetch-style API
// when you export named HTTP methods. (Default exports use the legacy
// (req, res) callback style and would ignore a returned Response.)
export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured on the server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { messages, activeTab } = body
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const client = new Anthropic({ apiKey })

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: buildSystemPrompt(activeTab ?? 'overview'),
    messages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'stream error'
        controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export function GET(): Response {
  return new Response('POST only', { status: 405 })
}
