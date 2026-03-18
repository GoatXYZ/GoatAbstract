import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp, createRandom, format } from '../prng'

const generate = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== 'hex-weave') return []
  const { width, height, gridSize, displacement, irregularity } = settings
  const random = createRandom(settings.seed)
  const paths: WavePath[] = []
  const dispScale = displacement / 100
  const irregScale = irregularity / 100
  const hexW = width / gridSize
  const hexH = hexW * 0.866
  const rows = Math.ceil(height / hexH) + 1

  // Generate hex grid vertices with displacement
  const verts: Map<string, { x: number; y: number }> = new Map()
  const key = (r: number, c: number) => `${r},${c}`

  for (let r = -1; r <= rows; r++) {
    const cols = Math.ceil(width / hexW) + 2
    for (let c = -1; c <= cols; c++) {
      const offset = r % 2 === 0 ? 0 : hexW * 0.5
      const bx = c * hexW + offset
      const by = r * hexH
      const dx = (random() - 0.5) * hexW * dispScale
      const dy = (random() - 0.5) * hexH * dispScale
      verts.set(key(r, c), { x: bx + dx, y: by + dy })
    }
  }

  // Draw edges between neighboring hex vertices
  for (let r = 0; r <= rows; r++) {
    const cols = Math.ceil(width / hexW) + 1
    for (let c = 0; c <= cols; c++) {
      const v = verts.get(key(r, c))
      if (!v) continue

      const neighbors = [key(r, c + 1), key(r + 1, c), key(r + 1, c + (r % 2 === 0 ? -1 : 1))]
      for (const nk of neighbors) {
        const n = verts.get(nk)
        if (!n) continue
        if (irregScale > 0 && random() < irregScale * 0.3) continue // skip some edges

        paths.push({
          d: `M ${format(v.x)} ${format(v.y)} L ${format(n.x)} ${format(n.y)}`,
          opacity: format(0.2 + random() * 0.5),
          strokeWidth: format(0.6 + random() * 1.4),
        })
      }
    }
  }

  return paths
}

export const hexWeaveDefinition: ModeDefinition = {
  id: 'hex-weave',
  label: 'Hex Weave',
  description: 'Organic hexagonal tessellation',
  themeColors: {
    dark: { lineColor: '#e0a050', backgroundColor: '#141008' },
    light: { lineColor: '#8a5a20', backgroundColor: '#fef8ee' },
  },
  params: [
    { key: 'gridSize', label: 'Grid Size', min: 4, max: 20, step: 1 },
    { key: 'displacement', label: 'Displacement', min: 0, max: 100, step: 5 },
    { key: 'irregularity', label: 'Irregularity', min: 0, max: 100, step: 5 },
  ],
  defaults: { gridSize: 10, displacement: 30, irregularity: 20 },
  generate,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'hex-weave') return settings
    return { ...settings, gridSize: clamp(Math.round(settings.gridSize), 4, 20), displacement: clamp(Math.round(settings.displacement), 0, 100), irregularity: clamp(Math.round(settings.irregularity), 0, 100) }
  },
}
