import type { ArtSettings, ModeDefinition, WavePath } from "../../types";
import { clamp, createRandom, format } from "../prng";

const generate = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== "shatter-lines") return [];
  const { width, height, impactCount, rayCount, ringCount } = settings;
  const random = createRandom(settings.seed);
  const paths: WavePath[] = [];

  for (let imp = 0; imp < impactCount; imp++) {
    const ix = width * (0.15 + random() * 0.7);
    const iy = height * (0.15 + random() * 0.7);
    const maxLen = Math.min(width, height) * (0.2 + random() * 0.3);

    // Radiating rays
    for (let r = 0; r < rayCount; r++) {
      const angle = (r / rayCount) * Math.PI * 2 + (random() - 0.5) * 0.3;
      const len = maxLen * (0.4 + random() * 0.6);
      const x2 = ix + Math.cos(angle) * len;
      const y2 = iy + Math.sin(angle) * len;

      paths.push({
        d: `M ${format(ix)} ${format(iy)} L ${format(x2)} ${format(y2)}`,
        opacity: format(0.3 + random() * 0.5),
        strokeWidth: format(0.5 + random() * 1.5),
      });
    }

    // Concentric ring fragments
    for (let ring = 1; ring <= ringCount; ring++) {
      const r = (ring / (ringCount + 1)) * maxLen;
      const arcStart = random() * Math.PI * 2;
      const arcLen = 0.3 + random() * 1.2;
      const segs = 16;
      const pts: string[] = [];

      for (let s = 0; s <= segs; s++) {
        const angle = arcStart + (s / segs) * arcLen;
        const x = format(ix + Math.cos(angle) * r);
        const y = format(iy + Math.sin(angle) * r);
        pts.push(s === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
      }

      paths.push({
        d: pts.join(" "),
        opacity: format(0.2 + random() * 0.4),
        strokeWidth: format(0.4 + random() * 1),
      });
    }
  }

  return paths;
};

export const shatterLinesDefinition: ModeDefinition = {
  id: "shatter-lines",
  label: "Shatter Lines",
  description: "Radiating fracture patterns with ring fragments",
  themeColors: {
    dark: { lineColor: "#d0d0e0", backgroundColor: "#0e0e14" },
    light: { lineColor: "#3a3a50", backgroundColor: "#f5f5fa" },
  },
  params: [
    { key: "impactCount", label: "Impacts", min: 1, max: 5, step: 1 },
    { key: "rayCount", label: "Rays", min: 6, max: 24, step: 1 },
    { key: "ringCount", label: "Rings", min: 0, max: 6, step: 1 },
  ],
  defaults: { impactCount: 2, rayCount: 14, ringCount: 3 },
  generate,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== "shatter-lines") return settings;
    return {
      ...settings,
      impactCount: clamp(Math.round(settings.impactCount), 1, 5),
      rayCount: clamp(Math.round(settings.rayCount), 6, 24),
      ringCount: clamp(Math.round(settings.ringCount), 0, 6),
    };
  },
};
