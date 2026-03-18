import type { ArtResult, ArtSettings, ModeDefinition, ModeId, SharedSettings } from "../types";
import { contourRingsDefinition } from "./generators/contourRings";
import { flowRibbonsDefinition } from "./generators/flowRibbons";
import { interferenceGridsDefinition } from "./generators/interferenceGrids";
import { isoBlobsDefinition } from "./generators/isoBlobs";
import { marbleVeinsDefinition } from "./generators/marbleVeins";
import { noiseDunesDefinition } from "./generators/noiseDunes";
import { orbitArcsDefinition } from "./generators/orbitArcs";
import { radiantBurstsDefinition } from "./generators/radiantBursts";
import { rippleFieldsDefinition } from "./generators/rippleFields";
import { threadMeshDefinition } from "./generators/threadMesh";
import { spiralArmsDefinition } from "./generators/spiralArms";
import { dotMatrixDefinition } from "./generators/dotMatrix";
import { lightningBoltsDefinition } from "./generators/lightningBolts";
import { voronoiEdgesDefinition } from "./generators/voronoiEdges";
import { waveCollisionDefinition } from "./generators/waveCollision";
import { crosshatchDefinition } from "./generators/crosshatch";
import { pendulumTracesDefinition } from "./generators/pendulumTraces";
import { shatterLinesDefinition } from "./generators/shatterLines";
import { smokePlumesDefinition } from "./generators/smokePlumes";
import { hexWeaveDefinition } from "./generators/hexWeave";
import { serializeArtSvg } from "./serialize";

export const MODE_REGISTRY: ModeDefinition[] = [
  noiseDunesDefinition,
  contourRingsDefinition,
  rippleFieldsDefinition,
  orbitArcsDefinition,
  interferenceGridsDefinition,
  flowRibbonsDefinition,
  radiantBurstsDefinition,
  threadMeshDefinition,
  marbleVeinsDefinition,
  isoBlobsDefinition,
  spiralArmsDefinition,
  dotMatrixDefinition,
  lightningBoltsDefinition,
  voronoiEdgesDefinition,
  waveCollisionDefinition,
  crosshatchDefinition,
  pendulumTracesDefinition,
  shatterLinesDefinition,
  smokePlumesDefinition,
  hexWeaveDefinition,
];

export const ORDERED_MODE_IDS: ModeId[] = MODE_REGISTRY.map((m) => m.id);

export const getModeDefinition = (id: ModeId): ModeDefinition =>
  MODE_REGISTRY.find((m) => m.id === id) ?? noiseDunesDefinition;

// ─── Shared normalization ────────────────────────────────────────────────────

const normalizeDimension = (v: number) => Math.max(64, Math.round(v));
const normalizeHex = (v: string) => (/^#[0-9a-f]{6}$/i.test(v) ? v : "#ffffff");

const normalizeShared = <S extends ArtSettings>(settings: S): S => ({
  ...settings,
  width: normalizeDimension(settings.width),
  height: normalizeDimension(settings.height),
  seed: settings.seed.trim() || "nightshift",
  lineColor: normalizeHex(settings.lineColor),
  backgroundColor: normalizeHex(settings.backgroundColor),
  strokeScale:
    settings.strokeScale != null ? Math.min(4, Math.max(0.2, settings.strokeScale)) : undefined,
  opacityScale:
    settings.opacityScale != null ? Math.min(2, Math.max(0.1, settings.opacityScale)) : undefined,
});

// ─── Resolution-independent generation ──────────────────────────────────────

const REF_SHORT_SIDE = 900;

export const generateArt = (input: ArtSettings): ArtResult => {
  const def = getModeDefinition(input.mode);
  const normalized = def.normalize(normalizeShared(input));

  // Generate at a reference resolution so visual weight stays consistent.
  // SVG viewBox→viewport mapping scales everything uniformly (paths, strokes,
  // spacing) to the actual output dimensions.
  const scale = Math.max(1, Math.min(normalized.width, normalized.height) / REF_SHORT_SIDE);
  const refW = Math.round(normalized.width / scale);
  const refH = Math.round(normalized.height / scale);
  const genSettings = scale > 1 ? { ...normalized, width: refW, height: refH } : normalized;

  const paths = def.generate(genSettings);
  const result: ArtResult = { settings: normalized, paths, svg: "" };
  result.svg = serializeArtSvg(result, refW, refH);
  return result;
};

// ─── Theme color helpers ─────────────────────────────────────────────────────

export const applyThemeColors = <S extends ArtSettings>(
  settings: S,
  theme: "dark" | "light",
): S => {
  const def = getModeDefinition(settings.mode);
  return { ...settings, ...def.themeColors[theme] };
};

export const buildModeSettings = (
  shared: Pick<SharedSettings, "width" | "height" | "seed">,
  id: ModeId,
  theme: "dark" | "light",
): ArtSettings => {
  const def = getModeDefinition(id);
  return {
    ...shared,
    mode: id,
    strokeScale: 1,
    opacityScale: 1,
    ...def.defaults,
    ...def.themeColors[theme],
  } as ArtSettings;
};
