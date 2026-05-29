import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ChartBlock, { parseChartSpec, type ChartKind } from './ChartBlock'

type Props = {
  role: 'user' | 'assistant'
  content: string
}

function isChartLang(lang: string | undefined): { match: false } | { match: true; kind: ChartKind } {
  if (!lang) return { match: false }
  const m = /^chart:(bar|line|pie)$/.exec(lang.trim())
  if (!m) return { match: false }
  return { match: true, kind: m[1] as ChartKind }
}

export default function ChatMessage({ role, content }: Props) {
  const isUser = role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap bg-10f-red text-white">
          {content}
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-10f-surface text-10f-text border border-10f-border">
          <span className="text-10f-text-muted italic">thinking…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-10f-surface text-10f-text border border-10f-border markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Render fenced ```chart:bar / chart:line / chart:pie blocks as real Recharts.
            code(props) {
              const { className, children } = props as { className?: string; children?: React.ReactNode }
              const lang = className?.replace(/^language-/, '')
              const detect = isChartLang(lang)
              const text = String(children ?? '').replace(/\n$/, '')
              if (detect.match) {
                const spec = parseChartSpec(text)
                if (spec) return <ChartBlock kind={detect.kind} spec={spec} />
              }
              return <code className="rounded bg-10f-border/60 px-1 py-0.5 text-xs">{children}</code>
            },
            p({ children }) {
              return <p className="my-1.5">{children}</p>
            },
            ul({ children }) {
              return <ul className="my-1.5 ml-4 list-disc space-y-0.5">{children}</ul>
            },
            ol({ children }) {
              return <ol className="my-1.5 ml-4 list-decimal space-y-0.5">{children}</ol>
            },
            h1({ children }) { return <h4 className="font-semibold text-sm mt-2 mb-1">{children}</h4> },
            h2({ children }) { return <h4 className="font-semibold text-sm mt-2 mb-1">{children}</h4> },
            h3({ children }) { return <h4 className="font-semibold text-sm mt-2 mb-1">{children}</h4> },
            h4({ children }) { return <h4 className="font-semibold text-sm mt-2 mb-1">{children}</h4> },
            table({ children }) {
              return (
                <div className="my-2 overflow-x-auto rounded-md border border-10f-border">
                  <table className="w-full text-xs">{children}</table>
                </div>
              )
            },
            thead({ children }) { return <thead className="bg-10f-surface">{children}</thead> },
            th({ children }) { return <th className="px-2 py-1 text-left font-semibold border-b border-10f-border">{children}</th> },
            td({ children }) { return <td className="px-2 py-1 border-b border-10f-border align-top">{children}</td> },
            a({ children, href }) {
              return <a href={href} target="_blank" rel="noreferrer" className="text-10f-red hover:underline">{children}</a>
            },
            strong({ children }) { return <strong className="font-semibold">{children}</strong> },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
