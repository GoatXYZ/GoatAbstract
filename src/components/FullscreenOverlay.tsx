type FullscreenOverlayProps = {
  svgMarkup: string
  onClose: () => void
}

export function FullscreenOverlay({ svgMarkup, onClose }: FullscreenOverlayProps) {
  return (
    <div className="fullscreen-overlay" onClick={onClose} role="dialog" aria-label="Fullscreen preview">
      <div className="fullscreen-art" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
    </div>
  )
}
