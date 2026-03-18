import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp, createRandom, format } from '../prng'

const generate = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== 'pendulum-traces') return []
  const { width, height, traceCount, complexity, decay } = settings
  const random = createRandom(settings.seed)
  const paths: WavePath[] = []
  const decayScale = decay / 100

  for (let trace = 0; trace < traceCount; trace++) {
    const freqX = 1 + Math.round(random() * complexity)
    const freqY = 1 + Math.round(random() * complexity)
    const phase = random() * Math.PI * 2
    const ampX = width * (0.2 + random() * 0.25)
    const ampY = height * (0.2 + random() * 0.25)
    const cx = width / 2 + (random() - 0.5) * width * 0.1
    const cy = height / 2 + (random() - 0.5) * height * 0.1
    const steps = 300 + Math.round(random() * 200)
    const pts: string[] = []

    for (let s = 0; s <= steps; s++) {
      const t = (s / steps) * Math.PI * 2 * Math.max(freqX, freqY)
      const d = 1 - (s / steps) * decayScale * 0.5
      const x = format(cx + Math.sin(freqX * t + phase) * ampX * d)
      const y = format(cy + Math.sin(freqY * t) * ampY * d)
      pts.push(s === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
    }

    paths.push({
      d: pts.join(' '),
      opacity: format(0.25 + random() * 0.45),
      strokeWidth: format(0.6 + random() * 1.8),
    })
  }

  return paths
}

export const pendulumTracesDefinition: ModeDefinition = {
  id: 'pendulum-traces',
  label: 'Pendulum Traces',
  description: 'Lissajous / harmonograph curves',
  themeColors: {
    dark: { lineColor: '#c084fc', backgroundColor: '#120a1a' },
    light: { lineColor: '#7c3aed', backgroundColor: '#faf5ff' },
  },
  params: [
    { key: 'traceCount', label: 'Traces', min: 1, max: 8, step: 1 },
    { key: 'complexity', label: 'Complexity', min: 1, max: 8, step: 1 },
    { key: 'decay', label: 'Decay', min: 0, max: 100, step: 5 },
  ],
  defaults: { traceCount: 3, complexity: 4, decay: 40 },
  generate,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'pendulum-traces') return settings
    return { ...settings, traceCount: clamp(Math.round(settings.traceCount), 1, 8), complexity: clamp(Math.round(settings.complexity), 1, 8), decay: clamp(Math.round(settings.decay), 0, 100) }
  },
}
