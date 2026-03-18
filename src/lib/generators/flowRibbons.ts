import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp, createRandom, format } from '../prng'

const generateFlowRibbons = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== 'flow-ribbons') return []
  const { width, height, ribbonCount, ribbonWidth, curvature } = settings
  const random = createRandom(settings.seed)
  const paths: WavePath[] = []

  const curveScale = curvature / 100

  for (let ribbon = 0; ribbon < ribbonCount; ribbon += 1) {
    const segments = 24
    const halfWidth = ribbonWidth * (0.5 + random() * 0.5)

    // Generate a centerline using cubic bezier-like control points
    const centerPoints: Array<{ x: number; y: number }> = []
    const startY = height * (0.1 + random() * 0.8)

    for (let seg = 0; seg <= segments; seg += 1) {
      const t = seg / segments
      const drift = (random() - 0.5) * height * 0.6 * curveScale
      centerPoints.push({
        x: t * width,
        y: startY + drift * Math.sin(t * Math.PI),
      })
    }

    // Top edge
    const topPoints: string[] = []
    for (let i = 0; i < centerPoints.length; i += 1) {
      const taper = 1 - Math.abs(i / (centerPoints.length - 1) - 0.5) * 1.2
      const w = halfWidth * Math.max(0.1, taper)
      const x = format(centerPoints[i].x)
      const y = format(centerPoints[i].y - w)
      topPoints.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
    }

    // Bottom edge (reversed, starts with M)
    const bottomPoints: string[] = []
    for (let i = centerPoints.length - 1; i >= 0; i -= 1) {
      const taper = 1 - Math.abs(i / (centerPoints.length - 1) - 0.5) * 1.2
      const w = halfWidth * Math.max(0.1, taper)
      const x = format(centerPoints[i].x)
      const y = format(centerPoints[i].y + w)
      bottomPoints.push(i === centerPoints.length - 1 ? `M ${x} ${y}` : `L ${x} ${y}`)
    }

    // Render as two separate stroke lines (top and bottom edges)
    paths.push({
      d: topPoints.join(' '),
      opacity: format(0.3 + random() * 0.5),
      strokeWidth: format(1.0 + random() * 2.0),
    })

    paths.push({
      d: bottomPoints.join(' '),
      opacity: format(0.2 + random() * 0.4),
      strokeWidth: format(0.8 + random() * 1.5),
    })
  }

  return paths
}

export const flowRibbonsDefinition: ModeDefinition = {
  id: 'flow-ribbons',
  label: 'Flow Ribbons',
  description: 'Sweeping tapered ribbon currents',
  themeColors: {
    dark: { lineColor: '#f9a8d4', backgroundColor: '#1a0d13' },
    light: { lineColor: '#be185d', backgroundColor: '#fdf2f8' },
  },
  params: [
    { key: 'ribbonCount', label: 'Ribbons', min: 2, max: 14, step: 1 },
    { key: 'ribbonWidth', label: 'Width', min: 4, max: 60, step: 2 },
    { key: 'curvature', label: 'Curvature', min: 0, max: 100, step: 1 },
  ],
  defaults: { ribbonCount: 6, ribbonWidth: 24, curvature: 60 },
  generate: generateFlowRibbons,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'flow-ribbons') return settings
    return {
      ...settings,
      ribbonCount: clamp(Math.round(settings.ribbonCount), 2, 14),
      ribbonWidth: clamp(Math.round(settings.ribbonWidth), 4, 60),
      curvature: clamp(Math.round(settings.curvature), 0, 100),
    }
  },
}
