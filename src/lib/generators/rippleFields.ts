import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp, createRandom, format } from '../prng'

const generateRippleFields = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== 'ripple-fields') return []
  const { width, height, emitterCount, ringCount, distortion } = settings
  const random = createRandom(settings.seed)
  const paths: WavePath[] = []

  const emitters = Array.from({ length: emitterCount }, () => ({
    x: width * (0.1 + random() * 0.8),
    y: height * (0.1 + random() * 0.8),
  }))

  const maxRadius = Math.max(width, height) * 0.5
  const distortionScale = distortion / 100

  for (const emitter of emitters) {
    for (let ring = 0; ring < ringCount; ring += 1) {
      const t = (ring + 1) / (ringCount + 1)
      const baseRadius = maxRadius * t
      const segments = 64
      const points: string[] = []

      for (let seg = 0; seg <= segments; seg += 1) {
        const angle = (seg / segments) * Math.PI * 2
        const stretch = 1 + (random() - 0.5) * 0.4 * distortionScale
        const rx = baseRadius * stretch
        const ry = baseRadius * (2 - stretch)
        const x = format(emitter.x + Math.cos(angle) * rx)
        const y = format(emitter.y + Math.sin(angle) * ry)

        if (seg === 0) {
          points.push(`M ${x} ${y}`)
        } else {
          points.push(`L ${x} ${y}`)
        }
      }

      points.push('Z')

      paths.push({
        d: points.join(' '),
        opacity: format(0.15 + random() * 0.45),
        strokeWidth: format(0.6 + random() * 1.2),
      })
    }
  }

  return paths
}

export const rippleFieldsDefinition: ModeDefinition = {
  id: 'ripple-fields',
  label: 'Ripple Fields',
  themeColors: {
    dark: { lineColor: '#67e8f9', backgroundColor: '#061418' },
    light: { lineColor: '#0e7490', backgroundColor: '#ecfeff' },
  },
  params: [
    { key: 'emitterCount', label: 'Emitters', min: 1, max: 8, step: 1 },
    { key: 'ringCount', label: 'Rings', min: 4, max: 24, step: 1 },
    { key: 'distortion', label: 'Distortion', min: 0, max: 100, step: 1 },
  ],
  defaults: { emitterCount: 3, ringCount: 12, distortion: 30 },
  generate: generateRippleFields,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'ripple-fields') return settings
    return {
      ...settings,
      emitterCount: clamp(Math.round(settings.emitterCount), 1, 8),
      ringCount: clamp(Math.round(settings.ringCount), 4, 24),
      distortion: clamp(Math.round(settings.distortion), 0, 100),
    }
  },
}
