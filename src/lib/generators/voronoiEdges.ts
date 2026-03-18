import type { ArtSettings, ModeDefinition, WavePath } from "../../types";
import { clamp, createRandom, format } from "../prng";

const generate = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== "voronoi-edges") return [];
  const { width, height, cellCount, jitter, thickness } = settings;
  const random = createRandom(settings.seed);
  const paths: WavePath[] = [];
  const jitterScale = jitter / 100;

  // Create grid-based points with jitter for irregular cells
  const cols = Math.max(2, Math.round(Math.sqrt(cellCount * (width / height))));
  const rows = Math.max(2, Math.round(cellCount / cols));
  const cw = width / cols;
  const ch = height / rows;
  const points: { x: number; y: number }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      points.push({
        x: (c + 0.5) * cw + (random() - 0.5) * cw * jitterScale,
        y: (r + 0.5) * ch + (random() - 0.5) * ch * jitterScale,
      });
    }
  }

  // Draw perpendicular bisectors between nearby point pairs
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > Math.max(cw, ch) * 1.8) continue;

      const mx = (points[i].x + points[j].x) / 2;
      const my = (points[i].y + points[j].y) / 2;
      const len = dist * (0.35 + random() * 0.25);
      const nx = -dy / dist;
      const ny = dx / dist;

      paths.push({
        d: `M ${format(mx - nx * len)} ${format(my - ny * len)} L ${format(mx + nx * len)} ${format(my + ny * len)}`,
        opacity: format(0.25 + random() * 0.45),
        strokeWidth: format(thickness * (0.5 + random() * 0.5)),
      });
    }
  }

  return paths;
};

export const voronoiEdgesDefinition: ModeDefinition = {
  id: "voronoi-edges",
  label: "Voronoi Edges",
  description: "Irregular cracked-glass cell boundaries",
  themeColors: {
    dark: { lineColor: "#f08070", backgroundColor: "#1a1214" },
    light: { lineColor: "#9a3020", backgroundColor: "#fef2f2" },
  },
  params: [
    { key: "cellCount", label: "Cells", min: 8, max: 60, step: 1 },
    { key: "jitter", label: "Jitter", min: 0, max: 100, step: 5 },
    { key: "thickness", label: "Thickness", min: 1, max: 4, step: 1 },
  ],
  defaults: { cellCount: 24, jitter: 70, thickness: 2 },
  generate,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== "voronoi-edges") return settings;
    return {
      ...settings,
      cellCount: clamp(Math.round(settings.cellCount), 8, 60),
      jitter: clamp(Math.round(settings.jitter), 0, 100),
      thickness: clamp(Math.round(settings.thickness), 1, 4),
    };
  },
};
