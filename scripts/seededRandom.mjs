export function seededRandom(seed) {
  let s = seed >>> 0
  return function() {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}
