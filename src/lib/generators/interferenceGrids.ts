import type { ArtSettings, ModeDefinition, WavePath } from "../../types";
import { clamp, createRandom, format } from "../prng";

const generateInterferenceGrids = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== "interference-grids") return [];
  const { width, height, gridLines, warpAmount, angle } = settings;
  const random = createRandom(settings.seed);
  const paths: WavePath[] = [];

  const warpScale = warpAmount / 100;
  const angleRad = (angle / 180) * Math.PI;
  const freq = 0.003 + random() * 0.006;
  const phase = random() * Math.PI * 2;

  // Family A: lines at +angle
  for (let i = 0; i < gridLines; i += 1) {
    const t = (i + 1) / (gridLines + 1);
    const segments = 40;
    const points: string[] = [];

    for (let seg = 0; seg <= segments; seg += 1) {
      const st = seg / segments;
      const baseX = st * width;
      const baseY = t * height;
      const warp = Math.sin(baseX * freq + phase) * height * 0.15 * warpScale;
      const cosA = Math.cos(angleRad);
      const sinA = Math.sin(angleRad);
      const x = format(baseX * cosA - (baseY + warp) * sinA + width * 0.5 * (1 - cosA + sinA));
      const y = format(baseX * sinA + (baseY + warp) * cosA + height * 0.5 * (1 - cosA - sinA));

      if (seg === 0) {
        points.push(`M ${x} ${y}`);
      } else {
        points.push(`L ${x} ${y}`);
      }
    }

    paths.push({
      d: points.join(" "),
      opacity: format(0.3 + random() * 0.4),
      strokeWidth: format(0.6 + random() * 1.0),
    });
  }

  // Family B: lines at -angle
  const phase2 = random() * Math.PI * 2;
  for (let i = 0; i < gridLines; i += 1) {
    const t = (i + 1) / (gridLines + 1);
    const segments = 40;
    const points: string[] = [];

    for (let seg = 0; seg <= segments; seg += 1) {
      const st = seg / segments;
      const baseX = st * width;
      const baseY = t * height;
      const warp = Math.sin(baseY * freq + phase2) * width * 0.15 * warpScale;
      const cosA = Math.cos(-angleRad);
      const sinA = Math.sin(-angleRad);
      const x = format((baseX + warp) * cosA - baseY * sinA + width * 0.5 * (1 - cosA + sinA));
      const y = format((baseX + warp) * sinA + baseY * cosA + height * 0.5 * (1 - cosA - sinA));

      if (seg === 0) {
        points.push(`M ${x} ${y}`);
      } else {
        points.push(`L ${x} ${y}`);
      }
    }

    paths.push({
      d: points.join(" "),
      opacity: format(0.3 + random() * 0.4),
      strokeWidth: format(0.6 + random() * 1.0),
    });
  }

  return paths;
};

export const interferenceGridsDefinition: ModeDefinition = {
  id: "interference-grids",
  label: "Interference Grids",
  description: "Warped moiré line lattices",
  themeColors: {
    dark: { lineColor: "#fda4af", backgroundColor: "#1a090b" },
    light: { lineColor: "#be123c", backgroundColor: "#fff1f2" },
  },
  params: [
    { key: "gridLines", label: "Density", min: 6, max: 40, step: 1 },
    { key: "warpAmount", label: "Warp", min: 0, max: 100, step: 1 },
    { key: "angle", label: "Angle", min: 5, max: 85, step: 5 },
  ],
  defaults: { gridLines: 16, warpAmount: 50, angle: 30 },
  generate: generateInterferenceGrids,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== "interference-grids") return settings;
    return {
      ...settings,
      gridLines: clamp(Math.round(settings.gridLines), 6, 40),
      warpAmount: clamp(Math.round(settings.warpAmount), 0, 100),
      angle: clamp(Math.round(settings.angle), 5, 85),
    };
  },
};
