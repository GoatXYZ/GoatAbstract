import { useMemo, useState } from 'react'
import type { ArtSettings } from '../types'
import { generateArt } from '../lib/registry'
import { createRandomSeed } from '../lib/waveArt'

type SeedExplorerProps = {
  settings: ArtSettings
  onSelect: (seed: string) => void
  onClose: () => void
}

export function SeedExplorer({ settings, onSelect, onClose }: SeedExplorerProps) {
  const [generation, setGeneration] = useState(0)

  const previews = useMemo(() => {
    return Array.from({ length: 12 }, () => {
      const seed = createRandomSeed()
      const art = generateArt({ ...settings, seed } as ArtSettings)
      return { seed, svg: art.svg }
    })
    // Intentionally depends only on generation counter and mode, not the full settings.
    // Non-mode settings changes (colors, scales) while explorer is open won't update
    // previews — press Shuffle to regenerate with current settings.
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
          {previews.map(({ seed, svg }) => (
            <button
              key={seed}
              type="button"
              className="explorer-item"
              onClick={() => onSelect(seed)}
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
