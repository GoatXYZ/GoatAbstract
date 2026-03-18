import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp, createRandom, format } from '../prng'

const generateContourRings = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== 'contour-rings') return []
  const { width, height, ringCount, centerCount, distortion } = settings
  const random = createRandom(settings.seed)
  const paths: WavePath[] = []

  const centers = Array.from({ length: centerCount }, () => ({
    x: width * (0.2 + random() * 0.6),
    y: height * (0.2 + random() * 0.6),
  }))

  const distortionScale = distortion / 100

  for (const center of centers) {
    const maxRadius = Math.min(width, height) * (0.15 + random() * 0.35)

    for (let ring = 0; ring < ringCount; ring += 1) {
      const t = (ring + 1) / (ringCount + 1)
      const baseRadius = maxRadius * t
      const segments = 48
      const points: string[] = []

      for (let seg = 0; seg <= segments; seg += 1) {
        const angle = (seg / segments) * Math.PI * 2
        const noise = (random() - 0.5) * baseRadius * 0.3 * distortionScale
        const r = baseRadius + noise
        const x = format(center.x + Math.cos(angle) * r)
        const y = format(center.y + Math.sin(angle) * r)

        if (seg === 0) {
          points.push(`M ${x} ${y}`)
        } else {
          points.push(`L ${x} ${y}`)
        }
      }

      points.push('Z')

      paths.push({
        d: points.join(' '),
        opacity: format(0.3 + random() * 0.5),
        strokeWidth: format(0.8 + random() * 1.5),
      })
    }
  }

  return paths
}

export const contourRingsDefinition: ModeDefinition = {
  id: 'contour-rings',
  label: 'Contour Rings',
  description: 'Topographic elevation loops',
  themeColors: {
    dark: { lineColor: '#7dd3a8', backgroundColor: '#0f1f1a' },
    light: { lineColor: '#1a5c3e', backgroundColor: '#f0f9f4' },
  },
  params: [
    { key: 'ringCount', label: 'Rings', min: 3, max: 18, step: 1 },
    { key: 'centerCount', label: 'Centers', min: 1, max: 4, step: 1 },
    { key: 'distortion', label: 'Distortion', min: 0, max: 100, step: 1 },
  ],
  defaults: { ringCount: 10, centerCount: 2, distortion: 40 },
  generate: generateContourRings,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'contour-rings') return settings
    return {
      ...settings,
      ringCount: clamp(Math.round(settings.ringCount), 3, 18),
      centerCount: clamp(Math.round(settings.centerCount), 1, 4),
      distortion: clamp(Math.round(settings.distortion), 0, 100),
    }
  },
}
