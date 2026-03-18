import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp, createRandom, format } from '../prng'

const generateIsoBlobs = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== 'iso-blobs') return []
  const { width, height, blobCount, ringCount, irregularity } = settings
  const random = createRandom(settings.seed)
  const paths: WavePath[] = []

  const irregularityScale = irregularity / 100

  // Place blob sources
  const sources = Array.from({ length: blobCount }, () => ({
    x: width * (0.15 + random() * 0.7),
    y: height * (0.15 + random() * 0.7),
    strength: 0.5 + random() * 0.5,
  }))

  // For each contour level, trace an iso-line around each source
  for (const source of sources) {
    const maxRadius = Math.min(width, height) * (0.12 + random() * 0.28) * source.strength

    for (let ring = 0; ring < ringCount; ring += 1) {
      const t = (ring + 1) / (ringCount + 1)
      const baseRadius = maxRadius * t
      const segments = 36
      const points: string[] = []

      // Generate irregular closed shape using harmonic noise
      const freqA = 2 + Math.floor(random() * 3)
      const freqB = 3 + Math.floor(random() * 4)
      const phaseA = random() * Math.PI * 2
      const phaseB = random() * Math.PI * 2
      const ampA = baseRadius * 0.2 * irregularityScale
      const ampB = baseRadius * 0.12 * irregularityScale

      for (let seg = 0; seg <= segments; seg += 1) {
        const angle = (seg / segments) * Math.PI * 2
        const noise = Math.sin(angle * freqA + phaseA) * ampA +
          Math.sin(angle * freqB + phaseB) * ampB
        const r = baseRadius + noise
        const x = format(source.x + Math.cos(angle) * r)
        const y = format(source.y + Math.sin(angle) * r)

        points.push(seg === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
      }

      points.push('Z')

      paths.push({
        d: points.join(' '),
        opacity: format(0.2 + random() * 0.5),
        strokeWidth: format(0.6 + random() * 1.2),
      })
    }
  }

  return paths
}

export const isoBlobsDefinition: ModeDefinition = {
  id: 'iso-blobs',
  label: 'Iso Blobs',
  description: 'Nested heat-map island contours',
  themeColors: {
    dark: { lineColor: '#86efac', backgroundColor: '#061610' },
    light: { lineColor: '#15803d', backgroundColor: '#f0fdf4' },
  },
  params: [
    { key: 'blobCount', label: 'Blobs', min: 1, max: 6, step: 1 },
    { key: 'ringCount', label: 'Rings', min: 3, max: 16, step: 1 },
    { key: 'irregularity', label: 'Irregularity', min: 0, max: 100, step: 1 },
  ],
  defaults: { blobCount: 3, ringCount: 8, irregularity: 50 },
  generate: generateIsoBlobs,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'iso-blobs') return settings
    return {
      ...settings,
      blobCount: clamp(Math.round(settings.blobCount), 1, 6),
      ringCount: clamp(Math.round(settings.ringCount), 3, 16),
      irregularity: clamp(Math.round(settings.irregularity), 0, 100),
    }
  },
}
