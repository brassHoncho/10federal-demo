import { describe, it, expect } from 'vitest'
import { fmtCurrency, fmtPct, fmtRelativeTime, fmtCompact, fmtDelta } from '../lib/format'

describe('fmtCurrency', () => {
  it('formats millions with $X.XXM', () => {
    expect(fmtCurrency(1_234_567)).toBe('$1.23M')
  })
  it('formats billions with $X.XXB', () => {
    expect(fmtCurrency(2_500_000_000)).toBe('$2.50B')
  })
  it('formats large four-figure values with grouped digits', () => {
    expect(fmtCurrency(125_000)).toBe('$125,000')
  })
  it('formats small values with grouped digits', () => {
    expect(fmtCurrency(1500)).toBe('$1,500')
  })
})

describe('fmtPct', () => {
  it('formats with one decimal by default', () => {
    expect(fmtPct(82.5)).toBe('82.5%')
  })
  it('respects the decimals arg', () => {
    expect(fmtPct(82.5, 0)).toBe('83%')
  })
})

describe('fmtRelativeTime', () => {
  it('renders minutes', () => {
    expect(fmtRelativeTime(2)).toBe('2m ago')
  })
  it('renders hours', () => {
    expect(fmtRelativeTime(75)).toBe('1h ago')
  })
  it('renders days', () => {
    expect(fmtRelativeTime(1500)).toBe('1d ago')
  })
  it('renders "just now" for <1 minute', () => {
    expect(fmtRelativeTime(0)).toBe('just now')
  })
})

describe('fmtCompact', () => {
  it('formats thousands', () => {
    expect(fmtCompact(7500)).toBe('7.5k')
  })
  it('formats millions', () => {
    expect(fmtCompact(2_400_000)).toBe('2.4M')
  })
  it('passes through small values', () => {
    expect(fmtCompact(42)).toBe('42')
  })
})

describe('fmtDelta', () => {
  it('adds + for positive', () => {
    expect(fmtDelta(2.3)).toBe('+2.3%')
  })
  it('preserves - for negative', () => {
    expect(fmtDelta(-1.1)).toBe('-1.1%')
  })
})
