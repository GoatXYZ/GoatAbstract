import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp, createRandom, format } from '../prng'

const generate = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== 'smoke-plumes') return []
  const { width, height, plumeCount, turbulence, segments } = settings
  const random = createRandom(settings.seed)
  const paths: WavePath[] = []
  const turbScale = turbulence / 100

  for (let p = 0; p < plumeCount; p++) {
    const baseX = width * (0.15 + random() * 0.7)
    const strands = 3 + Math.round(random() * 3)

    for (let s = 0; s < strands; s++) {
      const pts: string[] = []
      let x = baseX + (random() - 0.5) * width * 0.05
      let y = height * (0.85 + random() * 0.1)
      const stepY = height / segments

      for (let seg = 0; seg <= segments; seg++) {
        const t = seg / segments
        const drift = (random() - 0.5) * width * 0.08 * turbScale * (1 + t)
        x += drift
        y -= stepY * (0.7 + random() * 0.6)
        pts.push(seg === 0 ? `M ${format(x)} ${format(y)}` : `L ${format(x)} ${format(y)}`)
      }

      paths.push({
        d: pts.join(' '),
        opacity: format(0.15 + random() * 0.4),
        strokeWidth: format(1 + random() * 3),
      })
    }
  }

  return paths
}

export const smokePlumesDefinition: ModeDefinition = {
  id: 'smoke-plumes',
  label: 'Smoke Plumes',
  themeColors: {
    dark: { lineColor: '#a0a0b0', backgroundColor: '#101014' },
    light: { lineColor: '#4a4a5a', backgroundColor: '#f0f0f6' },
  },
  params: [
    { key: 'plumeCount', label: 'Plumes', min: 1, max: 6, step: 1 },
    { key: 'turbulence', label: 'Turbulence', min: 10, max: 100, step: 5 },
    { key: 'segments', label: 'Segments', min: 6, max: 20, step: 1 },
  ],
  defaults: { plumeCount: 3, turbulence: 50, segments: 12 },
  generate,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'smoke-plumes') return settings
    return { ...settings, plumeCount: clamp(Math.round(settings.plumeCount), 1, 6), turbulence: clamp(Math.round(settings.turbulence), 10, 100), segments: clamp(Math.round(settings.segments), 6, 20) }
  },
}
