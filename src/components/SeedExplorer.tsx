import { useMemo, useState } from 'react'
import type { ArtSettings } from '../types'
import { generateArt } from '../lib/registry'
import { createRandomSeed } from '../lib/waveArt'

const hslToHex = (h: number, s: number, l: number): string => {
  const s1 = s / 100
  const l1 = l / 100
  const a = s1 * Math.min(l1, 1 - l1)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l1 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * c).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

const randomPalette = () => {
  const hue = Math.random() * 360
  const bgHue = (hue + 90 + Math.random() * 180) % 360
  return {
    lineColor: hslToHex(hue, 30 + Math.random() * 50, 55 + Math.random() * 30),
    backgroundColor: hslToHex(bgHue, 10 + Math.random() * 25, 5 + Math.random() * 12),
  }
}

type SeedExplorerProps = {
  settings: ArtSettings
  onSelect: (seed: string, lineColor: string, backgroundColor: string) => void
  onClose: () => void
}

export function SeedExplorer({ settings, onSelect, onClose }: SeedExplorerProps) {
  const [generation, setGeneration] = useState(0)

  const previews = useMemo(() => {
    return Array.from({ length: 12 }, () => {
      const seed = createRandomSeed()
      const palette = randomPalette()
      const art = generateArt({ ...settings, seed, ...palette } as ArtSettings)
      return { seed, svg: art.svg, ...palette }
    })
    // Intentionally depends only on generation counter and mode, not the full settings.
    // Non-mode settings changes while explorer is open won't update previews —
    // press Shuffle to regenerate with current settings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation, settings.mode])

  return (
    <div className="explorer-overlay" onClick={onClose} role="dialog" aria-label="Seed explorer">
      <div className="explorer-panel" onClick={e => e.stopPropagation()}>
        <div className="explorer-header">
          <h2>Explore Seeds</h2>
          <div className="explorer-actions">
            <button type="button" onClick={() => setGeneration(g => g + 1)}>Shuffle</button>
            <button type="button" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="explorer-grid">
          {previews.map(({ seed, svg, lineColor, backgroundColor }) => (
            <button
              key={seed}
              type="button"
              className="explorer-item"
              onClick={() => onSelect(seed, lineColor, backgroundColor)}
            >
              <div className="explorer-thumb" dangerouslySetInnerHTML={{ __html: svg }} />
              <span className="explorer-seed">{seed}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
