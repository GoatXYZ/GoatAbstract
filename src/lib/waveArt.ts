import type { WaveArtResult, WaveArtSettings, WavePath } from "../types";
import { clamp, createRandom, format } from "./prng";
import { serializeArtSvg } from "./serialize";

const POINT_COUNT = 8;

const normalizeDimension = (value: number) => Math.max(64, Math.round(value));

const normalizeHex = (value: string) => (/^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff");

const buildPath = (width: number, points: number[]) => {
  const stepX = width / (points.length - 1);
  let path = `M 0 ${format(points[0])}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const x1 = stepX * index;
    const x2 = stepX * (index + 1);
    const cp1x = x1 + stepX / 3;
    const cp2x = x1 + (2 * stepX) / 3;
    const y1 = points[index];
    const y2 = points[index + 1];

    path += ` C ${format(cp1x)} ${format(y1)} ${format(cp2x)} ${format(y2)} ${format(x2)} ${format(y2)}`;
  }

  return path;
};

const createLine = (
  random: () => number,
  settings: WaveArtSettings,
  layerIndex: number,
): WavePath => {
  const baseY = (settings.height / (settings.lineCount + 1)) * (layerIndex + 1);
  const amplitude = settings.height * (0.08 + random() * 0.14);
  const points = Array.from({ length: POINT_COUNT }, (_, pointIndex) => {
    const drift = (random() - 0.5) * amplitude;
    const taper = 1 - Math.abs(pointIndex - (POINT_COUNT - 1) / 2) / POINT_COUNT;

    return clamp(baseY + drift * (0.55 + taper), 18, settings.height - 18);
  });

  return {
    d: buildPath(settings.width, points),
    opacity: format(0.38 + random() * 0.52),
    strokeWidth: format(1.1 + random() * 2.6),
  };
};

export const createRandomSeed = () =>
  Math.random().toString(36).slice(2, 10).padEnd(8, "0").slice(0, 8);

export const normalizeSettings = (settings: WaveArtSettings): WaveArtSettings => ({
  ...settings,
  width: normalizeDimension(settings.width),
  height: normalizeDimension(settings.height),
  seed: settings.seed.trim() || "nightshift",
  lineColor: normalizeHex(settings.lineColor),
  backgroundColor: normalizeHex(settings.backgroundColor),
  lineCount: clamp(Math.round(settings.lineCount), 3, 14),
});

export const generateNoiseDunes = (settings: WaveArtSettings): WavePath[] => {
  const random = createRandom(settings.seed);
  return Array.from({ length: settings.lineCount }, (_, layerIndex) =>
    createLine(random, settings, layerIndex),
  );
};

export const serializeWaveArtSvg = (art: WaveArtResult) => serializeArtSvg(art);

export const createWaveArt = (input: WaveArtSettings): WaveArtResult => {
  const settings = normalizeSettings(input);
  const paths = generateNoiseDunes(settings);

  const art: WaveArtResult = {
    settings,
    paths,
    svg: "",
  };

  art.svg = serializeArtSvg(art);

  return art;
};
