import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp, createRandom, format } from '../prng'

const generate = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== 'wave-collision') return []
  const { width, height, sourceCount, waveCount, decay } = settings
  const random = createRandom(settings.seed)
  const paths: WavePath[] = []
  const decayScale = decay / 100

  const sources = Array.from({ length: sourceCount }, () => ({
    x: width * (0.15 + random() * 0.7),
    y: height * (0.15 + random() * 0.7),
  }))

  for (const src of sources) {
    const maxR = Math.max(width, height) * 0.6
    const spacing = maxR / waveCount

    for (let w = 1; w <= waveCount; w++) {
      const r = w * spacing
      const segments = 64
      const pts: string[] = []

      for (let s = 0; s <= segments; s++) {
        const angle = (s / segments) * Math.PI * 2
        const x = format(src.x + Math.cos(angle) * r)
        const y = format(src.y + Math.sin(angle) * r)
        pts.push(s === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
      }
      pts.push('Z')

      const fadeOpacity = Math.max(0.08, (1 - (w / waveCount) * decayScale) * 0.6)
      paths.push({
        d: pts.join(' '),
        opacity: format(fadeOpacity),
        strokeWidth: format(0.6 + random() * 1.2),
      })
    }
  }

  return paths
}

export const waveCollisionDefinition: ModeDefinition = {
  id: 'wave-collision',
  label: 'Wave Collision',
  description: 'Overlapping circular wave interference',
  themeColors: {
    dark: { lineColor: '#60c0e0', backgroundColor: '#0a1018' },
    light: { lineColor: '#0a6080', backgroundColor: '#f0f8ff' },
  },
  params: [
    { key: 'sourceCount', label: 'Sources', min: 2, max: 6, step: 1 },
    { key: 'waveCount', label: 'Waves', min: 4, max: 20, step: 1 },
    { key: 'decay', label: 'Decay', min: 10, max: 100, step: 5 },
  ],
  defaults: { sourceCount: 3, waveCount: 12, decay: 60 },
  generate,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'wave-collision') return settings
    return { ...settings, sourceCount: clamp(Math.round(settings.sourceCount), 2, 6), waveCount: clamp(Math.round(settings.waveCount), 4, 20), decay: clamp(Math.round(settings.decay), 10, 100) }
  },
}
