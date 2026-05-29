type Props = {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatMessage({ role, content }: Props) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-10f-red text-white'
            : 'bg-10f-surface text-10f-text border border-10f-border'
        }`}
      >
        {content || (isUser ? '' : <span className="text-10f-text-muted italic">thinking…</span>)}
      </div>
    </div>
  )
}
