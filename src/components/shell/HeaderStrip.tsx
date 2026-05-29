import WalkthroughPlayer from './WalkthroughPlayer'

const NOW = new Date()
const LAST_UPDATED = NOW.toLocaleString('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export default function HeaderStrip() {
  return (
    <header className="bg-white border-b border-10f-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-10f-red flex items-center justify-center text-white font-bold text-sm">
            10F
          </div>
          <div>
            <div className="font-semibold text-base leading-tight">10F Ops Co-Pilot</div>
            <div className="text-xs text-10f-text-muted leading-tight">
              built for the 100-properties-with-&lt;100-employees thesis
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Co-Pilot ready
          </span>
          <span className="text-xs text-10f-text-muted hidden md:inline">
            Last updated {LAST_UPDATED}
          </span>
          <WalkthroughPlayer />
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.dispatchEvent(new CustomEvent('open-copilot'))
            }}
            className="text-sm font-medium text-10f-red hover:underline"
          >
            Open chat →
          </a>
        </div>
      </div>
    </header>
  )
}
