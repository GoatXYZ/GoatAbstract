import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp, createRandom, format } from '../prng'

const generateRadiantBursts = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== 'radiant-bursts') return []
  const { width, height, rayCount, focalX, focalY } = settings
  const random = createRandom(settings.seed)
  const paths: WavePath[] = []

  const cx = width * (focalX / 100)
  const cy = height * (focalY / 100)
  const maxLen = Math.hypot(width, height) * 0.6

  for (let ray = 0; ray < rayCount; ray += 1) {
    const baseAngle = (ray / rayCount) * Math.PI * 2
    const jitter = (random() - 0.5) * (Math.PI * 2 / rayCount) * 0.8
    const angle = baseAngle + jitter
    const length = maxLen * (0.3 + random() * 0.7)

    // Add subtle curvature via a midpoint offset
    const midFraction = 0.3 + random() * 0.4
    const perpOffset = (random() - 0.5) * length * 0.15
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)

    const endX = cx + cosA * length
    const endY = cy + sinA * length
    const midX = cx + cosA * length * midFraction + (-sinA) * perpOffset
    const midY = cy + sinA * length * midFraction + cosA * perpOffset

    const d = `M ${format(cx)} ${format(cy)} Q ${format(midX)} ${format(midY)} ${format(endX)} ${format(endY)}`

    // Reduce density in some angular regions for asymmetry
    const densityMask = 0.5 + 0.5 * Math.sin(angle * 2 + random() * Math.PI)

    paths.push({
      d,
      opacity: format(Math.max(0.05, (0.2 + random() * 0.6) * densityMask)),
      strokeWidth: format(0.6 + random() * 2.2),
    })
  }

  return paths
}

export const radiantBurstsDefinition: ModeDefinition = {
  id: 'radiant-bursts',
  label: 'Radiant Bursts',
  themeColors: {
    dark: { lineColor: '#fcd34d', backgroundColor: '#1a1306' },
    light: { lineColor: '#b45309', backgroundColor: '#fffbeb' },
  },
  params: [
    { key: 'rayCount', label: 'Rays', min: 8, max: 64, step: 1 },
    { key: 'focalX', label: 'Focus X', min: 10, max: 90, step: 1 },
    { key: 'focalY', label: 'Focus Y', min: 10, max: 90, step: 1 },
  ],
  defaults: { rayCount: 32, focalX: 35, focalY: 45 },
  generate: generateRadiantBursts,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'radiant-bursts') return settings
    return {
      ...settings,
      rayCount: clamp(Math.round(settings.rayCount), 8, 64),
      focalX: clamp(Math.round(settings.focalX), 10, 90),
      focalY: clamp(Math.round(settings.focalY), 10, 90),
    }
  },
}
