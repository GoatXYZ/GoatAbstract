import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp, createRandom, format } from '../prng'

const generateThreadMesh = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== 'thread-mesh') return []
  const { width, height, strandCount, curvature, spacing } = settings
  const random = createRandom(settings.seed)
  const paths: WavePath[] = []

  const curveScale = curvature / 100
  const spacingScale = spacing / 100
  const segments = 20

  // Vertical strands
  for (let i = 0; i < strandCount; i += 1) {
    const baseX = width * ((i + 0.5) / strandCount) * spacingScale +
      width * (1 - spacingScale) * 0.5
    const points: string[] = []

    for (let seg = 0; seg <= segments; seg += 1) {
      const t = seg / segments
      const drift = Math.sin(t * Math.PI * (2 + random() * 2)) * width * 0.06 * curveScale
      const x = format(baseX + drift)
      const y = format(t * height)
      points.push(seg === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
    }

    paths.push({
      d: points.join(' '),
      opacity: format(0.3 + random() * 0.5),
      strokeWidth: format(0.6 + random() * 1.4),
    })
  }

  // Horizontal strands
  for (let i = 0; i < strandCount; i += 1) {
    const baseY = height * ((i + 0.5) / strandCount) * spacingScale +
      height * (1 - spacingScale) * 0.5
    const points: string[] = []

    for (let seg = 0; seg <= segments; seg += 1) {
      const t = seg / segments
      const drift = Math.sin(t * Math.PI * (2 + random() * 2)) * height * 0.06 * curveScale
      const x = format(t * width)
      const y = format(baseY + drift)
      points.push(seg === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
    }

    paths.push({
      d: points.join(' '),
      opacity: format(0.25 + random() * 0.45),
      strokeWidth: format(0.5 + random() * 1.2),
    })
  }

  return paths
}

export const threadMeshDefinition: ModeDefinition = {
  id: 'thread-mesh',
  label: 'Thread Mesh',
  description: 'Woven bidirectional strand fields',
  themeColors: {
    dark: { lineColor: '#c4b5fd', backgroundColor: '#130f1e' },
    light: { lineColor: '#6d28d9', backgroundColor: '#f5f3ff' },
  },
  params: [
    { key: 'strandCount', label: 'Strands', min: 4, max: 32, step: 1 },
    { key: 'curvature', label: 'Curvature', min: 0, max: 100, step: 1 },
    { key: 'spacing', label: 'Spacing', min: 20, max: 100, step: 5 },
  ],
  defaults: { strandCount: 12, curvature: 50, spacing: 80 },
  generate: generateThreadMesh,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'thread-mesh') return settings
    return {
      ...settings,
      strandCount: clamp(Math.round(settings.strandCount), 4, 32),
      curvature: clamp(Math.round(settings.curvature), 0, 100),
      spacing: clamp(Math.round(settings.spacing), 20, 100),
    }
  },
}
