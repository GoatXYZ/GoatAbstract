import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp, createRandom, format } from '../prng'

const generate = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== 'lightning-bolts') return []
  const { width, height, boltCount, branches, jaggedness } = settings
  const random = createRandom(settings.seed)
  const paths: WavePath[] = []
  const jagScale = jaggedness / 100

  const MAX_PATHS = 500

  const growBolt = (sx: number, sy: number, angle: number, depth: number, sw: number, op: number) => {
    if (paths.length >= MAX_PATHS) return
    const steps = 8 + Math.round(random() * 6)
    const stepLen = Math.max(width, height) * (0.03 + random() * 0.04)
    const pts: string[] = [`M ${format(sx)} ${format(sy)}`]
    let x = sx, y = sy, a = angle

    for (let i = 0; i < steps; i++) {
      a += (random() - 0.5) * 1.5 * jagScale
      x += Math.cos(a) * stepLen
      y += Math.sin(a) * stepLen
      pts.push(`L ${format(x)} ${format(y)}`)
      if (depth < branches && i > 1 && random() > 0.6) {
        const ba = a + (random() > 0.5 ? 1 : -1) * (0.4 + random() * 0.8)
        growBolt(x, y, ba, depth + 1, sw * 0.5, op * 0.6)
      }
    }

    paths.push({ d: pts.join(' '), opacity: format(op), strokeWidth: format(sw) })
  }

  for (let b = 0; b < boltCount; b++) {
    const sx = width * (0.1 + random() * 0.8)
    const sy = random() * height * 0.15
    const angle = Math.PI / 2 + (random() - 0.5) * 0.4
    growBolt(sx, sy, angle, 0, 1.5 + random() * 2.5, 0.4 + random() * 0.5)
  }

  return paths
}

export const lightningBoltsDefinition: ModeDefinition = {
  id: 'lightning-bolts',
  label: 'Lightning Bolts',
  themeColors: {
    dark: { lineColor: '#ffd700', backgroundColor: '#0a0a1a' },
    light: { lineColor: '#7c6800', backgroundColor: '#fefce8' },
  },
  params: [
    { key: 'boltCount', label: 'Bolts', min: 1, max: 8, step: 1 },
    { key: 'branches', label: 'Branching', min: 0, max: 4, step: 1 },
    { key: 'jaggedness', label: 'Jaggedness', min: 10, max: 100, step: 5 },
  ],
  defaults: { boltCount: 3, branches: 2, jaggedness: 60 },
  generate,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'lightning-bolts') return settings
    return { ...settings, boltCount: clamp(Math.round(settings.boltCount), 1, 8), branches: clamp(Math.round(settings.branches), 0, 4), jaggedness: clamp(Math.round(settings.jaggedness), 10, 100) }
  },
}
