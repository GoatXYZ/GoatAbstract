import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp, createRandom, format } from '../prng'

const generateOrbitArcs = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== 'orbit-arcs') return []
  const { width, height, arcCount, sweep, tilt } = settings
  const random = createRandom(settings.seed)
  const paths: WavePath[] = []

  const cx = width * (0.3 + random() * 0.4)
  const cy = height * (0.3 + random() * 0.4)
  const sweepRad = (sweep / 360) * Math.PI * 2
  const tiltRad = (tilt / 180) * Math.PI

  for (let arc = 0; arc < arcCount; arc += 1) {
    const rx = Math.min(width, height) * (0.1 + random() * 0.45)
    const ry = rx * (0.4 + random() * 0.6)
    const rotation = tiltRad * (random() - 0.5) * 2
    const startAngle = random() * Math.PI * 2
    const segments = 32
    const segmentAngle = sweepRad / segments
    const points: string[] = []

    for (let seg = 0; seg <= segments; seg += 1) {
      const angle = startAngle + seg * segmentAngle
      const cosR = Math.cos(rotation)
      const sinR = Math.sin(rotation)
      const rawX = Math.cos(angle) * rx
      const rawY = Math.sin(angle) * ry
      const x = format(cx + rawX * cosR - rawY * sinR)
      const y = format(cy + rawX * sinR + rawY * cosR)

      if (seg === 0) {
        points.push(`M ${x} ${y}`)
      } else {
        points.push(`L ${x} ${y}`)
      }
    }

    paths.push({
      d: points.join(' '),
      opacity: format(0.3 + random() * 0.5),
      strokeWidth: format(0.8 + random() * 2.0),
    })
  }

  return paths
}

export const orbitArcsDefinition: ModeDefinition = {
  id: 'orbit-arcs',
  label: 'Orbit Arcs',
  description: 'Partial elliptical orbital paths',
  themeColors: {
    dark: { lineColor: '#93c5fd', backgroundColor: '#0d1520' },
    light: { lineColor: '#1d4ed8', backgroundColor: '#eff6ff' },
  },
  params: [
    { key: 'arcCount', label: 'Arcs', min: 4, max: 24, step: 1 },
    { key: 'sweep', label: 'Sweep', min: 30, max: 340, step: 10 },
    { key: 'tilt', label: 'Tilt', min: 0, max: 180, step: 5 },
  ],
  defaults: { arcCount: 12, sweep: 200, tilt: 60 },
  generate: generateOrbitArcs,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'orbit-arcs') return settings
    return {
      ...settings,
      arcCount: clamp(Math.round(settings.arcCount), 4, 24),
      sweep: clamp(Math.round(settings.sweep), 30, 340),
      tilt: clamp(Math.round(settings.tilt), 0, 180),
    }
  },
}
