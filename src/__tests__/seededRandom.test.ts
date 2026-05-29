import { describe, it, expect } from 'vitest'
import { seededRandom } from '../lib/seededRandom'

describe('seededRandom', () => {
  it('returns identical sequences for the same seed', () => {
    const a = seededRandom(42)
    const b = seededRandom(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('returns different sequences for different seeds', () => {
    const a = seededRandom(1)
    const b = seededRandom(2)
    expect(a()).not.toBe(b())
  })

  it('returns values in [0, 1)', () => {
    const r = seededRandom(7)
    for (let i = 0; i < 1000; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
