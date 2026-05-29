import { fmtRelativeTime } from '../../lib/format'

type Severity = 'info' | 'warn' | 'critical'

type Props = {
  severity: Severity
  message: string
  timestampMinutesAgo: number
  tab?: string
  askPrompt?: string
}

const TONE: Record<Severity, { border: string; pill: string; label: string }> = {
  info: { border: 'border-l-sky-500', pill: 'bg-sky-50 text-sky-700', label: 'Info' },
  warn: { border: 'border-l-amber-500', pill: 'bg-amber-50 text-amber-700', label: 'Warn' },
  critical: { border: 'border-l-red-500', pill: 'bg-red-50 text-red-700', label: 'Critical' },
}

export default function AlertCard({ severity, message, timestampMinutesAgo, tab, askPrompt }: Props) {
  const tone = TONE[severity]
  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border border-10f-border border-l-4 ${tone.border} bg-white px-4 py-3 shadow-sm`}
    >
      <div className="flex items-center gap-2 text-xs">
        <span className={`px-2 py-0.5 rounded-full font-medium ${tone.pill}`}>{tone.label}</span>
        {tab && <span className="text-10f-text-muted">{tab}</span>}
        <span className="text-10f-text-muted ml-auto">{fmtRelativeTime(timestampMinutesAgo)}</span>
      </div>
      <div className="text-sm">{message}</div>
      {askPrompt && (
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent('open-copilot', { detail: { prompt: askPrompt } }),
            )
          }}
          className="self-start text-xs font-medium text-10f-red hover:underline"
        >
          Ask Co-Pilot →
        </button>
      )}
    </div>
  )
}
