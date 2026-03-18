import type { ArtSettings, ModeDefinition, WavePath } from "../../types";
import { clamp, createRandom, format } from "../prng";

const generate = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== "dot-matrix") return [];
  const { width, height, columns, sizeRange, chaos } = settings;
  const random = createRandom(settings.seed);
  const paths: WavePath[] = [];
  const chaosScale = chaos / 100;
  const spacing = width / (columns + 1);
  const rows = Math.max(2, Math.round(height / spacing));

  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= columns; col++) {
      const bx = col * spacing + (random() - 0.5) * spacing * 0.5 * chaosScale;
      const by = row * (height / (rows + 1)) + (random() - 0.5) * spacing * 0.5 * chaosScale;
      const size = 0.5 + random() * sizeRange * 0.3;
      // Short segment with round linecap = dot
      paths.push({
        d: `M ${format(bx)} ${format(by)} l 0.01 0`,
        opacity: format(0.2 + random() * 0.7),
        strokeWidth: format(size),
      });
    }
  }

  return paths;
};

export const dotMatrixDefinition: ModeDefinition = {
  id: "dot-matrix",
  label: "Dot Matrix",
  description: "Noise-modulated dot grids",
  themeColors: {
    dark: { lineColor: "#4ade80", backgroundColor: "#0a120a" },
    light: { lineColor: "#166534", backgroundColor: "#f0fdf4" },
  },
  params: [
    { key: "columns", label: "Columns", min: 5, max: 40, step: 1 },
    { key: "sizeRange", label: "Size Range", min: 1, max: 10, step: 1 },
    { key: "chaos", label: "Chaos", min: 0, max: 100, step: 5 },
  ],
  defaults: { columns: 20, sizeRange: 5, chaos: 30 },
  generate,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== "dot-matrix") return settings;
    return {
      ...settings,
      columns: clamp(Math.round(settings.columns), 5, 40),
      sizeRange: clamp(Math.round(settings.sizeRange), 1, 10),
      chaos: clamp(Math.round(settings.chaos), 0, 100),
    };
  },
};
