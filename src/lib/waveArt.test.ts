import { describe, expect, it } from "vite-plus/test";
import { createRandomSeed, createWaveArt, normalizeSettings, serializeWaveArtSvg } from "./waveArt";
import type { WaveArtSettings } from "../types";

const baseSettings: WaveArtSettings = {
  mode: "noise-dunes",
  width: 640,
  height: 360,
  seed: "midnight-signal",
  lineColor: "#9ef5d4",
  backgroundColor: "#0b111d",
  lineCount: 7,
};

describe("waveArt", () => {
  it("returns identical art for identical settings and seed", () => {
    const first = createWaveArt(baseSettings);
    const second = createWaveArt(baseSettings);

    expect(first).toEqual(second);
  });

  it("changes output when the seed changes", () => {
    const first = createWaveArt(baseSettings);
    const second = createWaveArt({
      ...baseSettings,
      seed: "late-noise",
    });

    expect(first.paths).not.toEqual(second.paths);
    expect(first.svg).not.toEqual(second.svg);
  });

  it("serializes exact dimensions and colors into the svg output", () => {
    const svg = serializeWaveArtSvg(createWaveArt(baseSettings));

    expect(svg).toContain('width="640"');
    expect(svg).toContain('height="360"');
    expect(svg).toContain('viewBox="0 0 640 360"');
    expect(svg).toContain('stroke="#9ef5d4"');
    expect(svg).toContain('fill="#0b111d"');
  });

  it("creates multiple path layers for line art", () => {
    const result = createWaveArt(baseSettings);

    expect(result.paths).toHaveLength(baseSettings.lineCount);
    expect(result.paths.every((path) => path.d.startsWith("M 0 "))).toBe(true);
  });

  it("creates short random seeds suitable for the UI randomize action", () => {
    const seed = createRandomSeed();

    expect(seed).toMatch(/^[a-z0-9]{8}$/);
  });

  it("normalizes invalid dimensions and empty seed values", () => {
    const normalized = normalizeSettings({
      ...baseSettings,
      width: 12.2,
      height: 0,
      seed: "   ",
    });

    expect(normalized.width).toBe(64);
    expect(normalized.height).toBe(64);
    expect(normalized.seed).toBe("nightshift");
  });
});
