import { useEffect, useRef, useState } from 'react'
import type { ModeId } from '../types'
import { MODE_REGISTRY } from '../lib/registry'

type ModeTabBarProps = {
  activeMode: ModeId
  onSelect: (id: ModeId) => void
}

export function ModeTabBar({ activeMode, onSelect }: ModeTabBarProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const activeLabel = MODE_REGISTRY.find(m => m.id === activeMode)?.label ?? activeMode

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="mode-selector" ref={ref}>
      <button
        className="mode-trigger"
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Art mode"
      >
        <span className="mode-trigger-label">{activeLabel}</span>
        <svg className="mode-trigger-chevron" data-open={open || undefined} viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </button>

      {open && (
        <div className="mode-menu" role="listbox" aria-label="Art mode">
          {MODE_REGISTRY.map((mode) => (
            <button
              key={mode.id}
              className="mode-menu-item"
              role="option"
              type="button"
              aria-selected={mode.id === activeMode}
              data-active={mode.id === activeMode || undefined}
              onClick={() => { onSelect(mode.id); setOpen(false) }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
