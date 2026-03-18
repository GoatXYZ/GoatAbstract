import type { ArtResult } from '../types'

export const serializeArtSvg = (art: Omit<ArtResult, 'svg'>) => {
  const { width, height, lineColor, backgroundColor } = art.settings
  const ss = art.settings.strokeScale ?? 1
  const os = art.settings.opacityScale ?? 1
  const pathMarkup = art.paths
    .map((path) => {
      const sw = ss === 1 ? path.strokeWidth : Number((path.strokeWidth * ss).toFixed(2))
      const op = os === 1 ? path.opacity : Number((Math.min(1, path.opacity * os)).toFixed(2))
      return `<path d="${path.d}" fill="none" stroke="${lineColor}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}" />`
    })
    .join('')

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">`,
    `<rect width="${width}" height="${height}" fill="${backgroundColor}" />`,
    pathMarkup,
    '</svg>',
  ].join('')
}
