export const hashSeed = (seed: string) => {
  let hash = 1779033703 ^ seed.length

  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353)
    hash = (hash << 13) | (hash >>> 19)
  }

  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507)
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909)
    hash ^= hash >>> 16
    return hash >>> 0
  }
}

export const mulberry32 = (seed: number) => {
  let state = seed

  return () => {
    state += 0x6d2b79f5
    let result = Math.imul(state ^ (state >>> 15), state | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

export const createRandom = (seed: string) => {
  const tick = hashSeed(seed)
  return mulberry32(tick())
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const format = (value: number) => Number(value.toFixed(2))
