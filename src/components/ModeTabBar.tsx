import type { ModeId } from '../types'
import { MODE_REGISTRY } from '../lib/registry'

type ModeTabBarProps = {
  activeMode: ModeId
  onSelect: (id: ModeId) => void
}

export function ModeTabBar({ activeMode, onSelect }: ModeTabBarProps) {
  return (
    <nav className="mode-tabs" role="tablist" aria-label="Art mode">
      {MODE_REGISTRY.map((mode) => (
        <button
          key={mode.id}
          className="mode-tab"
          role="tab"
          type="button"
          aria-selected={mode.id === activeMode}
          data-active={mode.id === activeMode || undefined}
          onClick={() => onSelect(mode.id)}
        >
          {mode.label}
        </button>
      ))}
    </nav>
  )
}
