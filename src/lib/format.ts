/**
 * Compact USD currency. Numbers >= 1M show as $X.XXM; >= 1K show as $X.Xk; rest use grouped digits.
 */
export function fmtCurrency(value: number): string {
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 10_000) return `${sign}$${Math.round(abs).toLocaleString('en-US')}`
  return `${sign}$${abs.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

/**
 * Percentage with configurable decimals.
 */
export function fmtPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Human-readable relative time from a minutes-ago number.
 */
export function fmtRelativeTime(minutesAgo: number): string {
  if (minutesAgo < 1) return 'just now'
  if (minutesAgo < 60) return `${Math.floor(minutesAgo)}m ago`
  const hours = minutesAgo / 60
  if (hours < 24) return `${Math.floor(hours)}h ago`
  const days = hours / 24
  if (days < 30) return `${Math.floor(days)}d ago`
  const months = days / 30
  if (months < 12) return `${Math.floor(months)}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

/**
 * Compact number with k/M/B suffixes (no currency sign).
 */
export function fmtCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return `${value}`
}

/**
 * Signed delta with leading + or -, e.g., "+2.3%" or "-1.1%".
 */
export function fmtDelta(value: number, suffix = '%', decimals = 1): string {
  const sign = value > 0 ? '+' : value < 0 ? '' : ''
  return `${sign}${value.toFixed(decimals)}${suffix}`
}
