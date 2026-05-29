import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function KpiStrip({ children }: Props) {
  return <div className="grid gap-3 grid-cols-2 md:grid-cols-4">{children}</div>
}
