import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { ControlPanel } from './components/ControlPanel'
import { FullscreenOverlay } from './components/FullscreenOverlay'
import { ModeTabBar } from './components/ModeTabBar'
import { PreviewFrame } from './components/PreviewFrame'
import { SeedExplorer } from './components/SeedExplorer'
import { createRandomSeed } from './lib/waveArt'
import { applyThemeColors, buildModeSettings, generateArt, getModeDefinition, MODE_REGISTRY } from './lib/registry'
import type { ArtSettings, ModeId } from './types'

type Theme = 'dark' | 'light'

const getInitialTheme = (): Theme => {
  try {
    const stored = localStorage.getItem('goatabstract-theme') as Theme | null
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // localStorage unavailable in some environments
  }
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark'
  } catch {
    return 'dark'
  }
}

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

const normalizeSharedDimension = (value: number) => Math.max(64, Math.round(value))

const isHexColor = (value: string) => /^#[0-9a-f]{6}$/i.test(value)

const parseUrlSettings = (): ArtSettings | null => {
  try {
    const hash = window.location.hash.slice(1)
    if (!hash) return null
    const raw = JSON.parse(decodeURIComponent(atob(hash)))
    if (!raw || typeof raw !== 'object') return null
    if (typeof raw.mode !== 'string' || typeof raw.width !== 'number' || typeof raw.height !== 'number' || typeof raw.seed !== 'string') return null
    if (!MODE_REGISTRY.some(m => m.id === raw.mode)) return null
    const width = normalizeSharedDimension(raw.width)
    const height = normalizeSharedDimension(raw.height)
    const seed = raw.seed.trim() || 'nightshift'
    // Rebuild from safe defaults, only overlay validated fields
    const theme = getInitialTheme()
    const base = buildModeSettings(
      { width, height, seed },
      raw.mode as ModeId,
      theme,
    )
    const def = getModeDefinition(raw.mode as ModeId)
    const merged: Record<string, unknown> = { ...base }
    for (const param of def.params) {
      const v = raw[param.key]
      if (typeof v === 'number' && Number.isFinite(v)) {
        merged[param.key] = Math.min(param.max, Math.max(param.min, v))
      }
    }
    if (typeof raw.strokeScale === 'number' && Number.isFinite(raw.strokeScale)) {
      merged.strokeScale = Math.min(4, Math.max(0.2, raw.strokeScale))
    }
    if (typeof raw.opacityScale === 'number' && Number.isFinite(raw.opacityScale)) {
      merged.opacityScale = Math.min(2, Math.max(0.1, raw.opacityScale))
    }
    if (typeof raw.lineColor === 'string' && isHexColor(raw.lineColor)) {
      merged.lineColor = raw.lineColor
    }
    if (typeof raw.backgroundColor === 'string' && isHexColor(raw.backgroundColor)) {
      merged.backgroundColor = raw.backgroundColor
    }
    return merged as ArtSettings
  } catch {
    return null
  }
}

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 0)
}

const downloadSvg = (svgMarkup: string, fileName: string) => {
  downloadBlob(
    new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }),
    fileName,
  )
}

const downloadPng = async (svgMarkup: string, width: number, height: number, mode: string) => {
  const image = new Image()
  const canvas = document.createElement('canvas')
  const svgUrl = URL.createObjectURL(
    new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }),
  )
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  if (!context) {
    URL.revokeObjectURL(svgUrl)
    return
  }

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => {
        context.drawImage(image, 0, 0, width, height)
        resolve()
      }
      image.onerror = () => reject(new Error('PNG export failed'))
      image.src = svgUrl
    })
  } finally {
    URL.revokeObjectURL(svgUrl)
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  )

  if (!blob) {
    return
  }

  downloadBlob(blob, `goatabstract-${mode}.png`)
}

function App() {
  const initialUrlSettings = parseUrlSettings()
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [settings, setSettings] = useState<ArtSettings>(() => {
    if (initialUrlSettings) {
      return initialUrlSettings
    }
    const randomModeIndex = Math.floor(Math.random() * MODE_REGISTRY.length)
    const randomMode = MODE_REGISTRY[randomModeIndex].id
    const palette = randomPalette()
    return {
      ...buildModeSettings({ width: 1600, height: 900, seed: createRandomSeed() }, randomMode, getInitialTheme()),
      ...palette,
    } as ArtSettings
  })
  const [aspectLocked, setAspectLocked] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [exploring, setExploring] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const art = generateArt(settings)
  const modeDef = getModeDefinition(settings.mode)
  const themeRef = useRef(theme)
  const aspectRatioRef = useRef(settings.width / settings.height)

  // Undo/redo history
  const historyRef = useRef<ArtSettings[]>([settings])
  const historyIndexRef = useRef(0)
  const skipHistoryRef = useRef(false)
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false
      return
    }
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current)
    historyTimerRef.current = setTimeout(() => {
      const h = historyRef.current
      h.length = historyIndexRef.current + 1
      h.push(settings)
      if (h.length > 50) h.shift()
      historyIndexRef.current = h.length - 1
    }, 400)
    return () => {
      if (historyTimerRef.current) clearTimeout(historyTimerRef.current)
    }
  }, [settings])

  useEffect(() => {
    themeRef.current = theme
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [toast])

  const showToast = (msg: string) => setToast(msg)

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      localStorage.setItem('goatabstract-theme', next)
      setSettings((settingsCurrent) => applyThemeColors(settingsCurrent, next))
      return next
    })
  }

  const handleModeChange = useCallback((id: ModeId) => {
    startTransition(() => {
      setSettings((current) =>
        buildModeSettings(
          { width: current.width, height: current.height, seed: current.seed },
          id,
          themeRef.current,
        ),
      )
    })
  }, [])

  const handleSettingChange = (key: string, value: string | number) => {
    setSettings((current) => {
      if (aspectLocked && key === 'width' && typeof value === 'number') {
        return { ...current, width: value, height: Math.max(64, Math.round(value / aspectRatioRef.current)) }
      }
      if (aspectLocked && key === 'height' && typeof value === 'number') {
        return { ...current, width: Math.max(64, Math.round(value * aspectRatioRef.current)), height: value }
      }
      return { ...current, [key]: value }
    })
  }

  const handleParamChange = (key: string, value: number) => {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  const handlePreset = (width: number, height: number) => {
    setSettings((current) => ({ ...current, width, height }))
    aspectRatioRef.current = width / height
  }

  const toggleAspectLock = () => {
    if (!aspectLocked) {
      aspectRatioRef.current = settings.width / settings.height
    }
    setAspectLocked((prev) => !prev)
  }

  const randomize = useCallback(() => {
    startTransition(() => {
      const palette = randomPalette()
      setSettings((current) => ({
        ...current,
        seed: createRandomSeed(),
        ...palette,
      }))
    })
  }, [])

  const undo = useCallback(() => {
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current)
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1
      skipHistoryRef.current = true
      setSettings(historyRef.current[historyIndexRef.current])
    }
  }, [])

  const redo = useCallback(() => {
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current)
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1
      skipHistoryRef.current = true
      setSettings(historyRef.current[historyIndexRef.current])
    }
  }, [])

  const copySvg = useCallback(() => {
    navigator.clipboard.writeText(art.svg)
      .then(() => showToast('SVG copied'))
      .catch(() => showToast('Copy failed'))
  }, [art.svg])

  const shareUrl = () => {
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(settings)))
      const url = `${window.location.origin}${window.location.pathname}#${encoded}`
      navigator.clipboard.writeText(url)
        .then(() => showToast('Link copied'))
        .catch(() => showToast('Copy failed'))
      window.history.replaceState(null, '', `#${encoded}`)
    } catch {
      showToast('Share failed')
    }
  }

  const handleSeedSelect = (seed: string, lineColor: string, backgroundColor: string) => {
    startTransition(() => {
      setSettings((current) => ({ ...current, seed, lineColor, backgroundColor }))
    })
    setExploring(false)
  }

  const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {})

  useEffect(() => {
    keyHandlerRef.current = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      else if (mod && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo() }
      else if (mod && e.shiftKey && e.key.toLowerCase() === 'c') { e.preventDefault(); copySvg() }
      else if (e.key === 'r' && !mod) { e.preventDefault(); randomize() }
      else if (e.key === 'f' && !mod) { e.preventDefault(); setFullscreen(f => !f) }
      else if (e.key === 'g' && !mod) { e.preventDefault(); setExploring(x => !x) }
      else if (e.key === 'Escape') { setFullscreen(false); setExploring(false) }
      else if (!mod && !e.shiftKey && e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1
        if (idx < MODE_REGISTRY.length) { e.preventDefault(); handleModeChange(MODE_REGISTRY[idx].id) }
      }
      else if (!mod && !e.shiftKey && e.key === '0' && MODE_REGISTRY.length >= 10) {
        e.preventDefault(); handleModeChange(MODE_REGISTRY[9].id)
      }
    }
  }, [copySvg, handleModeChange, randomize, redo, undo])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => keyHandlerRef.current(e)
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="app-shell">
      <header className="toolbar">
        <button
          className="brand"
          type="button"
          onClick={() => {
            const modeIndex = Math.floor(Math.random() * MODE_REGISTRY.length)
            const mode = MODE_REGISTRY[modeIndex].id
            const palette = randomPalette()
            setSettings({
              ...buildModeSettings({ width: 1600, height: 900, seed: createRandomSeed() }, mode, themeRef.current),
              ...palette,
            } as ArtSettings)
            setAspectLocked(false)
            window.history.replaceState(null, '', window.location.pathname)
          }}
          title="Randomize everything"
        >
          GoatAbstract
        </button>
        <div className="toolbar-right">
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="theme-toggle-icon">
              {theme === 'dark' ? '\u263C' : '\u263E'}
            </span>
            {theme === 'dark' ? 'LIGHT' : 'DARK'}
          </button>
          <a
            className="github-link"
            href="https://github.com/GoatXYZ/GoatAbstract"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on GitHub"
            title="View on GitHub"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <ModeTabBar activeMode={settings.mode} onSelect={handleModeChange} />
          <ControlPanel
            settings={settings}
            modeParams={modeDef.params}
            aspectLocked={aspectLocked}
            onSettingChange={handleSettingChange}
            onParamChange={handleParamChange}
            onDownloadPng={() =>
              void downloadPng(art.svg, art.settings.width, art.settings.height, art.settings.mode)
            }
            onDownloadSvg={() => downloadSvg(art.svg, `goatabstract-${art.settings.mode}.svg`)}
            onRandomize={randomize}
            onCopySvg={copySvg}
            onShare={shareUrl}
            onExplore={() => setExploring(true)}
            onPreset={handlePreset}
            onToggleAspectLock={toggleAspectLock}
          />
        </aside>

        <main className="canvas">
          <PreviewFrame
            height={art.settings.height}
            svgMarkup={art.svg}
            width={art.settings.width}
            onFullscreen={() => setFullscreen(true)}
          />
        </main>
      </div>

      {fullscreen && (
        <FullscreenOverlay svgMarkup={art.svg} onClose={() => setFullscreen(false)} />
      )}
      {exploring && (
        <SeedExplorer settings={settings} onSelect={handleSeedSelect} onClose={() => setExploring(false)} />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default App
