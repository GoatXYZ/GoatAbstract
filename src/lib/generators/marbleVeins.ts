import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp, createRandom, format } from '../prng'

const generateMarbleVeins = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== 'marble-veins') return []
  const { width, height, veinCount, splitDepth, drift } = settings
  const random = createRandom(settings.seed)
  const paths: WavePath[] = []

  const driftScale = drift / 100

  const MAX_PATHS = 500

  const growVein = (
    startX: number,
    startY: number,
    angle: number,
    depth: number,
    parentWidth: number,
    parentOpacity: number,
  ) => {
    if (paths.length >= MAX_PATHS) return
    const steps = 12 + Math.round(random() * 8)
    const stepLen = Math.max(width, height) * (0.02 + random() * 0.04)
    const points: string[] = [`M ${format(startX)} ${format(startY)}`]

    let x = startX
    let y = startY
    let currentAngle = angle

    for (let step = 0; step < steps; step += 1) {
      currentAngle += (random() - 0.5) * 0.8 * driftScale
      x += Math.cos(currentAngle) * stepLen
      y += Math.sin(currentAngle) * stepLen
      points.push(`L ${format(x)} ${format(y)}`)

      // Branch at random points
      if (depth < splitDepth && step > 2 && random() > 0.7) {
        const branchAngle = currentAngle + (random() > 0.5 ? 1 : -1) * (0.3 + random() * 0.8)
        growVein(x, y, branchAngle, depth + 1, parentWidth * 0.6, parentOpacity * 0.7)
      }
    }

    paths.push({
      d: points.join(' '),
      opacity: format(parentOpacity),
      strokeWidth: format(parentWidth),
    })
  }

  for (let vein = 0; vein < veinCount; vein += 1) {
    const startX = random() * width
    const startY = random() * height
    const angle = random() * Math.PI * 2
    const baseWidth = 1.5 + random() * 2.5
    const baseOpacity = 0.4 + random() * 0.5

    growVein(startX, startY, angle, 0, baseWidth, baseOpacity)
  }

  return paths
}

export const marbleVeinsDefinition: ModeDefinition = {
  id: 'marble-veins',
  label: 'Marble Veins',
  themeColors: {
    dark: { lineColor: '#d6d3d1', backgroundColor: '#111110' },
    light: { lineColor: '#44403c', backgroundColor: '#fafaf9' },
  },
  params: [
    { key: 'veinCount', label: 'Veins', min: 2, max: 12, step: 1 },
    { key: 'splitDepth', label: 'Branching', min: 1, max: 5, step: 1 },
    { key: 'drift', label: 'Drift', min: 10, max: 100, step: 5 },
  ],
  defaults: { veinCount: 5, splitDepth: 3, drift: 60 },
  generate: generateMarbleVeins,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'marble-veins') return settings
    return {
      ...settings,
      veinCount: clamp(Math.round(settings.veinCount), 2, 12),
      splitDepth: clamp(Math.round(settings.splitDepth), 1, 5),
      drift: clamp(Math.round(settings.drift), 10, 100),
    }
  },
}
