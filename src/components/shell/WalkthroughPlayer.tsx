import { useEffect, useRef, useState } from 'react'

/**
 * Inline play/pause button for the walkthrough audio.
 * No modal, no transcript shown — just plays. Updates in place to show progress.
 */
export default function WalkthroughPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTime = () => setCurrent(el.currentTime)
    const onMeta = () => setDuration(el.duration || 0)
    const onEnded = () => {
      setPlaying(false)
      setCurrent(0)
      setHasStarted(true)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('ended', onEnded)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
    }
  }, [])

  function toggle() {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
    } else {
      setHasStarted(true)
      el.play().catch((err) => {
        console.error('walkthrough audio play failed:', err)
      })
    }
  }

  function fmt(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const pct = duration > 0 ? (current / duration) * 100 : 0
  const label = playing
    ? `Pause · ${fmt(current)} / ${fmt(duration || 118)}`
    : current > 0
      ? `Resume · ${fmt(current)} / ${fmt(duration || 118)}`
      : 'Listen to walkthrough · 2 min'

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className={`relative inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-semibold shadow-md transition-all overflow-hidden
          bg-10f-red text-white hover:bg-10f-red-dark hover:shadow-lg active:scale-[0.98]
          ${!hasStarted && !playing ? 'animate-pulse-attention' : ''}
        `}
        aria-label={playing ? 'Pause walkthrough' : 'Play walkthrough'}
      >
        {/* Progress fill behind text */}
        {(playing || current > 0) && (
          <span
            aria-hidden
            className="absolute inset-0 bg-white/20 origin-left"
            style={{ transform: `scaleX(${pct / 100})` }}
          />
        )}
        <span aria-hidden className="relative text-base leading-none">
          {playing ? '⏸' : '▶'}
        </span>
        <span className="relative whitespace-nowrap">{label}</span>
      </button>
      <audio ref={audioRef} src="/walkthrough.mp3" preload="metadata" />
    </>
  )
}
