import type { ArtSettings, ModeDefinition, WavePath } from "../../types";
import { clamp, createRandom, format } from "../prng";

const generate = (settings: ArtSettings): WavePath[] => {
  if (settings.mode !== "spiral-arms") return [];
  const { width, height, armCount, turns, spread } = settings;
  const random = createRandom(settings.seed);
  const paths: WavePath[] = [];
  const cx = width / 2 + (random() - 0.5) * width * 0.1;
  const cy = height / 2 + (random() - 0.5) * height * 0.1;
  const maxR = Math.min(width, height) * 0.45;
  const spreadScale = spread / 100;

  for (let arm = 0; arm < armCount; arm++) {
    const baseAngle = (arm / armCount) * Math.PI * 2 + random() * 0.3;
    const steps = 80 + Math.round(random() * 40);
    const points: string[] = [];

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const theta = baseAngle + t * turns * Math.PI * 2;
      const r = t * maxR + (random() - 0.5) * maxR * 0.06 * spreadScale;
      const x = format(cx + Math.cos(theta) * r);
      const y = format(cy + Math.sin(theta) * r);
      points.push(s === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
    }

    paths.push({
      d: points.join(" "),
      opacity: format(0.3 + random() * 0.5),
      strokeWidth: format(0.8 + random() * 2),
    });
  }

  return paths;
};

export const spiralArmsDefinition: ModeDefinition = {
  id: "spiral-arms",
  label: "Spiral Arms",
  description: "Logarithmic galaxy-like spirals",
  themeColors: {
    dark: { lineColor: "#00d4ff", backgroundColor: "#0a0e1a" },
    light: { lineColor: "#0066aa", backgroundColor: "#f0f6ff" },
  },
  params: [
    { key: "armCount", label: "Arms", min: 1, max: 8, step: 1 },
    { key: "turns", label: "Turns", min: 1, max: 6, step: 1 },
    { key: "spread", label: "Spread", min: 0, max: 100, step: 5 },
  ],
  defaults: { armCount: 4, turns: 3, spread: 40 },
  generate,
  normalize(settings: ArtSettings): ArtSettings {
    if (settings.mode !== "spiral-arms") return settings;
    return {
      ...settings,
      armCount: clamp(Math.round(settings.armCount), 1, 8),
      turns: clamp(Math.round(settings.turns), 1, 6),
      spread: clamp(Math.round(settings.spread), 0, 100),
    };
  },
};
