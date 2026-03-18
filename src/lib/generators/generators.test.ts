import { describe, expect, it } from "vite-plus/test";
import { generateArt, getModeDefinition, MODE_REGISTRY, buildModeSettings } from "../registry";
import type { ModeId } from "../../types";

const SHARED = { width: 800, height: 600, seed: "test-seed" };

describe("mode registry", () => {
  it("contains exactly 20 modes", () => {
    expect(MODE_REGISTRY).toHaveLength(20);
  });

  it("has unique IDs", () => {
    const ids = MODE_REGISTRY.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every mode has at least one param", () => {
    for (const mode of MODE_REGISTRY) {
      expect(mode.params.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("every mode has both dark and light theme colors", () => {
    for (const mode of MODE_REGISTRY) {
      expect(mode.themeColors.dark.lineColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(mode.themeColors.dark.backgroundColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(mode.themeColors.light.lineColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(mode.themeColors.light.backgroundColor).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe.each(MODE_REGISTRY.map((m) => [m.id, m.label]))("%s (%s)", (id) => {
  const modeId = id as ModeId;

  it("produces deterministic output", () => {
    const settings = buildModeSettings(SHARED, modeId, "dark");
    const first = generateArt(settings);
    const second = generateArt(settings);
    expect(first.svg).toBe(second.svg);
    expect(first.paths).toEqual(second.paths);
  });

  it("changes output when seed changes", () => {
    const settingsA = buildModeSettings({ ...SHARED, seed: "alpha" }, modeId, "dark");
    const settingsB = buildModeSettings({ ...SHARED, seed: "bravo" }, modeId, "dark");
    const a = generateArt(settingsA);
    const b = generateArt(settingsB);
    expect(a.svg).not.toBe(b.svg);
  });

  it("respects exact dimensions in SVG output", () => {
    const settings = buildModeSettings(SHARED, modeId, "dark");
    const result = generateArt(settings);
    expect(result.svg).toContain('width="800"');
    expect(result.svg).toContain('height="600"');
    expect(result.svg).toContain('viewBox="0 0 800 600"');
  });

  it("generates at least one path", () => {
    const settings = buildModeSettings(SHARED, modeId, "dark");
    const result = generateArt(settings);
    expect(result.paths.length).toBeGreaterThanOrEqual(1);
  });

  it("produces valid WavePath objects", () => {
    const settings = buildModeSettings(SHARED, modeId, "dark");
    const result = generateArt(settings);
    for (const path of result.paths) {
      expect(path.d).toMatch(/^M /);
      expect(path.opacity).toBeGreaterThan(0);
      expect(path.opacity).toBeLessThanOrEqual(1);
      expect(path.strokeWidth).toBeGreaterThan(0);
    }
  });

  it("works with dark and light theme colors", () => {
    const dark = generateArt(buildModeSettings(SHARED, modeId, "dark"));
    const light = generateArt(buildModeSettings(SHARED, modeId, "light"));
    const def = getModeDefinition(modeId);
    expect(dark.svg).toContain(def.themeColors.dark.lineColor);
    expect(light.svg).toContain(def.themeColors.light.lineColor);
  });

  it("handles extreme dimensions", () => {
    const wide = generateArt(
      buildModeSettings({ ...SHARED, width: 3000, height: 100 }, modeId, "dark"),
    );
    const tall = generateArt(
      buildModeSettings({ ...SHARED, width: 100, height: 3000 }, modeId, "dark"),
    );
    expect(wide.paths.length).toBeGreaterThanOrEqual(1);
    expect(tall.paths.length).toBeGreaterThanOrEqual(1);
  });

  it("handles minimum dimensions", () => {
    const tiny = generateArt(
      buildModeSettings({ ...SHARED, width: 64, height: 64 }, modeId, "dark"),
    );
    expect(tiny.paths.length).toBeGreaterThanOrEqual(1);
    expect(tiny.svg).toContain('width="64"');
  });
});
