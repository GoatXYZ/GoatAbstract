import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp, createRandom, format } from '../prng'

const generate = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== 'crosshatch') return []
  const { width, height, layerCount, density, angle } = settings
  const random = createRandom(settings.seed)
  const paths: WavePath[] = []
  const diag = Math.sqrt(width * width + height * height)

  for (let layer = 0; layer < layerCount; layer++) {
    const layerAngle = (angle * Math.PI / 180) + (layer * Math.PI / layerCount) + (random() - 0.5) * 0.15
    const cos = Math.cos(layerAngle)
    const sin = Math.sin(layerAngle)
    const spacing = diag / density

    for (let i = -density; i <= density * 2; i++) {
      if (random() > 0.75) continue // skip some lines for variation
      const offset = i * spacing
      const cx = width / 2 + cos * offset
      const cy = height / 2 + sin * offset
      const halfLen = diag * 0.6

      const x1 = cx - sin * halfLen
      const y1 = cy + cos * halfLen
      const x2 = cx + sin * halfLen
      const y2 = cy - cos * halfLen

      paths.push({
        d: `M ${format(x1)} ${format(y1)} L ${format(x2)} ${format(y2)}`,
        opacity: format(0.15 + random() * 0.35),
        strokeWidth: format(0.5 + random() * 1.5),
      })
    }
  }

  return paths
}

export const crosshatchDefinition: ModeDefinition = {
  id: 'crosshatch',
  label: 'Crosshatch',
  themeColors: {
    dark: { lineColor: '#a0a0a0', backgroundColor: '#121212' },
    light: { lineColor: '#333333', backgroundColor: '#f8f8f4' },
  },
  params: [
    { key: 'layerCount', label: 'Layers', min: 2, max: 6, step: 1 },
    { key: 'density', label: 'Density', min: 8, max: 40, step: 1 },
    { key: 'angle', label: 'Angle', min: 0, max: 90, step: 5 },
  ],
  defaults: { layerCount: 3, density: 20, angle: 30 },
  generate,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'crosshatch') return settings
    return { ...settings, layerCount: clamp(Math.round(settings.layerCount), 2, 6), density: clamp(Math.round(settings.density), 8, 40), angle: clamp(Math.round(settings.angle), 0, 90) }
  },
}
