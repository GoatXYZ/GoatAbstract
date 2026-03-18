// ─── Shared primitives ───────────────────────────────────────────────────────

export type WavePath = {
  d: string
  opacity: number
  strokeWidth: number
}

// ─── Shared fields every mode carries ────────────────────────────────────────

export type SharedSettings = {
  width: number
  height: number
  seed: string
  lineColor: string
  backgroundColor: string
  strokeScale?: number
  opacityScale?: number
}

// ─── Per-mode params ─────────────────────────────────────────────────────────

export type NoiseDunesParams = {
  lineCount: number
}

export type ContourRingsParams = {
  ringCount: number
  centerCount: number
  distortion: number
}

export type RippleFieldsParams = {
  emitterCount: number
  ringCount: number
  distortion: number
}

export type OrbitArcsParams = {
  arcCount: number
  sweep: number
  tilt: number
}

export type InterferenceGridsParams = {
  gridLines: number
  warpAmount: number
  angle: number
}

export type FlowRibbonsParams = {
  ribbonCount: number
  ribbonWidth: number
  curvature: number
}

export type RadiantBurstsParams = {
  rayCount: number
  focalX: number
  focalY: number
}

export type ThreadMeshParams = {
  strandCount: number
  curvature: number
  spacing: number
}

export type MarbleVeinsParams = {
  veinCount: number
  splitDepth: number
  drift: number
}

export type IsoBlobsParams = {
  blobCount: number
  ringCount: number
  irregularity: number
}

export type SpiralArmsParams = { armCount: number; turns: number; spread: number }
export type DotMatrixParams = { columns: number; sizeRange: number; chaos: number }
export type LightningBoltsParams = { boltCount: number; branches: number; jaggedness: number }
export type VoronoiEdgesParams = { cellCount: number; jitter: number; thickness: number }
export type WaveCollisionParams = { sourceCount: number; waveCount: number; decay: number }
export type CrosshatchParams = { layerCount: number; density: number; angle: number }
export type PendulumTracesParams = { traceCount: number; complexity: number; decay: number }
export type ShatterLinesParams = { impactCount: number; rayCount: number; ringCount: number }
export type SmokePlumesParams = { plumeCount: number; turbulence: number; segments: number }
export type HexWeaveParams = { gridSize: number; displacement: number; irregularity: number }

// ─── Mode ID literal union ───────────────────────────────────────────────────

export type ModeId =
  | 'noise-dunes'
  | 'contour-rings'
  | 'ripple-fields'
  | 'orbit-arcs'
  | 'interference-grids'
  | 'flow-ribbons'
  | 'radiant-bursts'
  | 'thread-mesh'
  | 'marble-veins'
  | 'iso-blobs'
  | 'spiral-arms'
  | 'dot-matrix'
  | 'lightning-bolts'
  | 'voronoi-edges'
  | 'wave-collision'
  | 'crosshatch'
  | 'pendulum-traces'
  | 'shatter-lines'
  | 'smoke-plumes'
  | 'hex-weave'

// ─── Discriminated union of full settings ────────────────────────────────────

export type NoiseDunesSettings = SharedSettings & { mode: 'noise-dunes' } & NoiseDunesParams
export type ContourRingsSettings = SharedSettings & { mode: 'contour-rings' } & ContourRingsParams
export type RippleFieldsSettings = SharedSettings & { mode: 'ripple-fields' } & RippleFieldsParams
export type OrbitArcsSettings = SharedSettings & { mode: 'orbit-arcs' } & OrbitArcsParams
export type InterferenceGridsSettings = SharedSettings & { mode: 'interference-grids' } & InterferenceGridsParams
export type FlowRibbonsSettings = SharedSettings & { mode: 'flow-ribbons' } & FlowRibbonsParams
export type RadiantBurstsSettings = SharedSettings & { mode: 'radiant-bursts' } & RadiantBurstsParams
export type ThreadMeshSettings = SharedSettings & { mode: 'thread-mesh' } & ThreadMeshParams
export type MarbleVeinsSettings = SharedSettings & { mode: 'marble-veins' } & MarbleVeinsParams
export type IsoBlobsSettings = SharedSettings & { mode: 'iso-blobs' } & IsoBlobsParams
export type SpiralArmsSettings = SharedSettings & { mode: 'spiral-arms' } & SpiralArmsParams
export type DotMatrixSettings = SharedSettings & { mode: 'dot-matrix' } & DotMatrixParams
export type LightningBoltsSettings = SharedSettings & { mode: 'lightning-bolts' } & LightningBoltsParams
export type VoronoiEdgesSettings = SharedSettings & { mode: 'voronoi-edges' } & VoronoiEdgesParams
export type WaveCollisionSettings = SharedSettings & { mode: 'wave-collision' } & WaveCollisionParams
export type CrosshatchSettings = SharedSettings & { mode: 'crosshatch' } & CrosshatchParams
export type PendulumTracesSettings = SharedSettings & { mode: 'pendulum-traces' } & PendulumTracesParams
export type ShatterLinesSettings = SharedSettings & { mode: 'shatter-lines' } & ShatterLinesParams
export type SmokePlumesSettings = SharedSettings & { mode: 'smoke-plumes' } & SmokePlumesParams
export type HexWeaveSettings = SharedSettings & { mode: 'hex-weave' } & HexWeaveParams

export type ArtSettings =
  | NoiseDunesSettings
  | ContourRingsSettings
  | RippleFieldsSettings
  | OrbitArcsSettings
  | InterferenceGridsSettings
  | FlowRibbonsSettings
  | RadiantBurstsSettings
  | ThreadMeshSettings
  | MarbleVeinsSettings
  | IsoBlobsSettings
  | SpiralArmsSettings
  | DotMatrixSettings
  | LightningBoltsSettings
  | VoronoiEdgesSettings
  | WaveCollisionSettings
  | CrosshatchSettings
  | PendulumTracesSettings
  | ShatterLinesSettings
  | SmokePlumesSettings
  | HexWeaveSettings

// ─── Shared result ───────────────────────────────────────────────────────────

export type ArtResult = {
  settings: ArtSettings
  paths: WavePath[]
  svg: string
}

// ─── Mode param descriptor (drives UI rendering) ─────────────────────────────

export type ParamDescriptor = {
  key: string
  label: string
  min: number
  max: number
  step: number
}

// ─── Theme-aware color defaults ──────────────────────────────────────────────

export type ThemeColors = {
  dark: { lineColor: string; backgroundColor: string }
  light: { lineColor: string; backgroundColor: string }
}

// ─── Mode metadata (registry entry) ──────────────────────────────────────────

export type ModeDefinition = {
  id: ModeId
  label: string
  params: ParamDescriptor[]
  themeColors: ThemeColors
  defaults: Record<string, number>
  generate: (settings: ArtSettings) => WavePath[]
  normalize: (settings: ArtSettings) => ArtSettings
}

// ─── Backward-compat aliases for existing waveArt.ts ─────────────────────────

export type WaveArtSettings = NoiseDunesSettings
export type WaveArtResult = ArtResult
