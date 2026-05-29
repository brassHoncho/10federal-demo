type Owner = {
  name: string
  role: string
}

type Props = {
  title: string
  subtitle?: string
  ownedBy?: Owner | Owner[]
}

export default function SectionHeader({ title, subtitle, ownedBy }: Props) {
  const owners = Array.isArray(ownedBy) ? ownedBy : ownedBy ? [ownedBy] : []
  return (
    <div className="mb-6">
      <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {owners.length > 0 && (
          <div className="text-sm text-10f-text-muted">
            owned by{' '}
            {owners.map((o, i) => (
              <span key={o.name}>
                <span className="font-medium text-10f-text">{o.name}</span>
                <span className="text-10f-text-muted"> ({o.role})</span>
                {i < owners.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </div>
        )}
      </div>
      {subtitle && <p className="mt-1 text-sm text-10f-text-muted">{subtitle}</p>}
    </div>
  )
}
