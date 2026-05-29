/**
 * Deterministic seeded PRNG (linear congruential generator).
 * Returns a function that produces values in [0, 1) — identical sequence for the same seed.
 * Used for stable per-facility mock metrics so reloads don't flicker.
 */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}
