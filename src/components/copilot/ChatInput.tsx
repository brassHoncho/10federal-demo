import { useEffect, useRef } from 'react'

type Props = {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({ value, onChange, onSubmit, disabled, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [value])

  return (
    <div className="border-t border-10f-border bg-white p-3 flex items-end gap-2">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (!disabled && value.trim().length > 0) onSubmit()
          }
        }}
        rows={1}
        disabled={disabled}
        placeholder={placeholder ?? 'Ask about facilities, funds, builds, marketing…'}
        className="flex-1 resize-none rounded-lg border border-10f-border px-3 py-2 text-sm focus:outline-none focus:border-10f-red disabled:opacity-50"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || value.trim().length === 0}
        className="rounded-lg bg-10f-red text-white px-3 py-2 text-sm font-medium disabled:opacity-40 hover:bg-10f-red-dark"
      >
        Send
      </button>
    </div>
  )
}
