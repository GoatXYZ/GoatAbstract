import type { ArtResult } from "../types";

export const serializeArtSvg = (
  art: Omit<ArtResult, "svg">,
  viewBoxWidth?: number,
  viewBoxHeight?: number,
) => {
  const { width, height, lineColor, backgroundColor } = art.settings;
  const vbW = viewBoxWidth ?? width;
  const vbH = viewBoxHeight ?? height;
  const ss = art.settings.strokeScale ?? 1;
  const os = art.settings.opacityScale ?? 1;
  const pathMarkup = art.paths
    .map((path) => {
      const sw = ss === 1 ? path.strokeWidth : Number((path.strokeWidth * ss).toFixed(2));
      const op = os === 1 ? path.opacity : Number(Math.min(1, path.opacity * os).toFixed(2));
      return `<path d="${path.d}" fill="none" stroke="${lineColor}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}" />`;
    })
    .join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${vbW} ${vbH}" fill="none">`,
    `<rect width="${vbW}" height="${vbH}" fill="${backgroundColor}" />`,
    pathMarkup,
    "</svg>",
  ].join("");
};
