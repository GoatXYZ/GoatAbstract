import type { ArtSettings, ModeDefinition, WavePath } from '../../types'
import { clamp } from '../prng'
import { generateNoiseDunes } from '../waveArt'

export const noiseDunesDefinition: ModeDefinition = {
  id: 'noise-dunes',
  label: 'Noise Dunes',
  description: 'Stacked horizontal wave bands',
  themeColors: {
    dark: { lineColor: '#c2956a', backgroundColor: '#1c1917' },
    light: { lineColor: '#9a6b3d', backgroundColor: '#faf8f5' },
  },
  params: [
    { key: 'lineCount', label: 'Layers', min: 3, max: 14, step: 1 },
  ],
  defaults: { lineCount: 7 },
  generate(settings: ArtSettings): WavePath[] {
    if (settings.mode !== 'noise-dunes') return []
    return generateNoiseDunes(settings)
  },
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== 'noise-dunes') return settings
    return {
      ...settings,
      lineCount: clamp(Math.round(settings.lineCount), 3, 14),
    }
  },
}
