export function Header() {
  return (
    <header className="page-header">
      <p className="eyebrow">GoatAbstract</p>
      <h1>Abstract line art from a single word.</h1>
      <p className="lede">
        Type a seed, get a unique wave composition. Same seed, same result
        every time. Export at whatever size you need.
      </p>
      <div className="header-chip-grid" aria-label="Features">
        <span>Reproducible</span>
        <span>SVG + PNG</span>
        <span>Any size</span>
      </div>
    </header>
  )
}
