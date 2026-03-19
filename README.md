# 🐐 GoatAbstract

**Generative abstract line art from a single seed word.**

Type a seed, pick a style, get a unique vector composition. Same seed + same settings = same result, every time. Export at any size you need — pixel-perfect SVG and PNG.

🔗 **[Live Demo](https://goatxyz.github.io/GoatAbstract/)**

---

## ✨ Features

### 🎨 20 Generative Art Modes

Every mode uses a different geometric primitive and compositional rhythm — no two look alike.

|     | Mode                   | Visual Style                                    |
| --- | ---------------------- | ----------------------------------------------- |
| 🌊  | **Noise Dunes**        | Stacked horizontal wave bands                   |
| 🗺️  | **Contour Rings**      | Topographic elevation loops                     |
| 💧  | **Ripple Fields**      | Concentric ripples from emitters                |
| 🪐  | **Orbit Arcs**         | Partial elliptical orbital paths                |
| 📡  | **Interference Grids** | Warped moiré line lattices                      |
| 🎀  | **Flow Ribbons**       | Sweeping tapered ribbon currents                |
| ☀️  | **Radiant Bursts**     | Rays radiating from a focal point               |
| 🧵  | **Thread Mesh**        | Woven bidirectional strand fields               |
| 🪨  | **Marble Veins**       | Branching mineral crack networks                |
| 🫧  | **Iso Blobs**          | Nested heat-map island contours                 |
| 🌀  | **Spiral Arms**        | Logarithmic galaxy-like spirals                 |
| ⚡  | **Lightning Bolts**    | Branching electrical discharge                  |
| 🔵  | **Dot Matrix**         | Noise-modulated dot grids                       |
| 🔶  | **Voronoi Edges**      | Irregular cracked-glass cell boundaries         |
| 🌊  | **Wave Collision**     | Overlapping circular wave interference          |
| ✏️  | **Crosshatch**         | Engraving-style layered hatching                |
| 🎯  | **Pendulum Traces**    | Lissajous / harmonograph curves                 |
| 💥  | **Shatter Lines**      | Radiating fracture patterns with ring fragments |
| 💨  | **Smoke Plumes**       | Rising turbulent column traces                  |
| 🐝  | **Hex Weave**          | Organic hexagonal tessellation                  |

### 🛠️ Tools & Controls

- 📐 **Exact Dimensions** — Set pixel-perfect width and height
- 🔒 **Aspect Ratio Lock** — Toggle to maintain W/H ratio
- 📏 **Dimension Presets** — HD, OG Image, 1:1, 4K, Story, Banner
- 🎲 **Seed Input** — Type any word for deterministic output
- 🎚️ **Per-Mode Parameters** — 3 sliders unique to each art style
- 🖊️ **Stroke Weight Scale** — Global line thickness multiplier (0.2x–4x)
- 👁️ **Opacity Scale** — Global transparency multiplier (0.1x–2x)
- 🎨 **Color Pickers** — Stroke and background color
- 🌗 **Dark / Light Theme** — Full dual-theme support

### ⚡ Actions

- 🔀 **Randomize** — New seed + new color palette every click
- 🔍 **Explore** — Grid of 12 random seed variations, click to select
- 📋 **Copy SVG** — One-click SVG markup to clipboard
- 🔗 **Share** — Encode settings in URL, copy shareable link
- 💾 **Download SVG** — Vector export at exact dimensions
- 🖼️ **Download PNG** — Rasterized export via canvas pipeline
- 🖥️ **Fullscreen Preview** — Click the canvas to go fullscreen (Esc to close)

### ⌨️ Keyboard Shortcuts

| Key                    | Action                      |
| ---------------------- | --------------------------- |
| `R`                    | Randomize seed + colors     |
| `F`                    | Toggle fullscreen preview   |
| `G`                    | Open seed explorer gallery  |
| `1`–`9`, `0`           | Switch to mode 1–10         |
| `Cmd/Ctrl + Z`         | Undo                        |
| `Cmd/Ctrl + Shift + Z` | Redo                        |
| `Cmd/Ctrl + Shift + C` | Copy SVG to clipboard       |
| `Esc`                  | Close fullscreen / explorer |

---

## 🏗️ Architecture

```
src/
├── App.tsx                    # Root: state, shortcuts, URL sharing, undo/redo
├── App.css                    # Full layout: toolbar, sidebar, canvas
├── index.css                  # KolFluent design tokens & theme system
├── types.ts                   # Complete type system (discriminated union)
├── components/
│   ├── ControlPanel.tsx       # All controls: dimensions, seed, sliders, buttons
│   ├── ModeTabBar.tsx         # Dropdown grid mode selector
│   ├── ModeParamSlider.tsx    # Dual slider+number input with edit isolation
│   ├── PreviewFrame.tsx       # SVG injection via dangerouslySetInnerHTML
│   ├── FullscreenOverlay.tsx  # Fullscreen art overlay
│   └── SeedExplorer.tsx       # 12-seed gallery with shuffle
├── lib/
│   ├── registry.ts            # Mode registry, generateArt dispatch, normalization
│   ├── serialize.ts           # SVG serialization with stroke/opacity scaling
│   ├── prng.ts                # Seeded PRNG (MurmurHash3 + Mulberry32)
│   ├── waveArt.ts             # Original Noise Dunes generator
│   └── generators/            # 20 generator files, one per art mode
│       ├── noiseDunes.ts
│       ├── contourRings.ts
│       ├── spiralArms.ts
│       ├── lightningBolts.ts
│       └── ... (16 more)
└── test/
    └── setup.ts               # Vitest + Testing Library setup
```

### 🧠 Key Design Decisions

- **Zero rendering dependencies** — All art is pure math → SVG path strings. No canvas lib, no p5.js, no D3.
- **Deterministic output** — Seeded PRNG (`MurmurHash3` → `Mulberry32`) guarantees identical results for identical inputs.
- **Registry pattern** — Each mode is a self-contained `ModeDefinition` with its own generator, normalizer, params, and theme colors. Adding a new mode requires zero changes to UI code.
- **Render-time generation** — `generateArt(settings)` runs synchronously during render. Fast enough for all 20 modes at typical settings.
- **Discriminated union** — `ArtSettings` is a union of 20 mode-specific types, narrowed by the `mode` field. TypeScript enforces that each generator only accesses its own params.

---

## 🔌 Render API (Embeds)

Use query params to generate art with no UI — just the raw SVG filling the viewport. Works in iframes, browser tabs, and bookmarks.

### Base URL

```
https://goatxyz.github.io/GoatAbstract/?render
```

### Parameters

| Param    | Description                                       | Default |
| -------- | ------------------------------------------------- | ------- |
| `render` | **Required.** Enables render mode (no UI).        | —       |
| `seed`   | Seed string for deterministic output.             | Random  |
| `mode`   | Art mode ID (e.g. `spiral-arms`, `marble-veins`). | Random  |
| `w`      | Width in pixels.                                  | `1600`  |
| `h`      | Height in pixels.                                 | `900`   |
| `line`   | Stroke color as 6-digit hex (no `#`).             | Random  |
| `bg`     | Background color as 6-digit hex (no `#`).         | Random  |

### Examples

```
# 🎲 Fully random
https://goatxyz.github.io/GoatAbstract/?render

# 🌱 Deterministic — same seed = same art
https://goatxyz.github.io/GoatAbstract/?render&seed=hello

# 🎯 Specific mode + seed
https://goatxyz.github.io/GoatAbstract/?render&seed=galaxy&mode=spiral-arms

# 📐 Custom dimensions + colors
https://goatxyz.github.io/GoatAbstract/?render&seed=fire&mode=lightning-bolts&w=800&h=400&line=ffd700&bg=0a0a1a

# 🖼️ Embed in an iframe
<iframe src="https://goatxyz.github.io/GoatAbstract/?render&seed=poster" width="800" height="400" style="border:none"></iframe>
```

### Available Mode IDs

`noise-dunes` · `contour-rings` · `ripple-fields` · `orbit-arcs` · `interference-grids` · `flow-ribbons` · `radiant-bursts` · `thread-mesh` · `marble-veins` · `iso-blobs` · `spiral-arms` · `dot-matrix` · `lightning-bolts` · `voronoi-edges` · `wave-collision` · `crosshatch` · `pendulum-traces` · `shatter-lines` · `smoke-plumes` · `hex-weave`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** 8+

### Install & Dev

```bash
pnpm install
pnpm dev
```

### Build

```bash
pnpm build
```

Static output goes to `docs/` (configured for GitHub Pages).

### Test & Lint

```bash
pnpm test -- --run    # 175 tests
npx eslint .          # 0 warnings
npx tsc -b --noEmit   # 0 errors
```

---

## 📦 Tech Stack

| Layer              | Technology                 |
| ------------------ | -------------------------- |
| ⚛️ Framework       | React 19                   |
| 🔷 Language        | TypeScript 5.9             |
| ⚡ Build           | Vite 8                     |
| 🧪 Test            | Vitest 4 + Testing Library |
| 🎨 Design System   | KolFluent (Fluent 2)       |
| 📐 Lint            | ESLint + typescript-eslint |
| 📦 Package Manager | pnpm                       |

### 🎨 Design System: KolFluent

The UI follows the [KolFluent](https://github.com/GoatXYZ/KolFluent) design system (Fluent 2):

- 🔵 Blue brand accent (`#479ef5` dark / `#0f6cbd` light)
- 🌫️ Acrylic toolbar with `backdrop-filter: blur(20px)`
- 📐 Fluent spacing, border-radius, and shadow tokens
- ⏱️ Fluent motion tokens (8 durations × 8 easing curves)
- 🌗 Dual theme via `data-theme` attribute with full token swap

---

## 📊 Bundle

| Asset      | Size        | Gzipped    |
| ---------- | ----------- | ---------- |
| JavaScript | 229 KB      | 71 KB      |
| CSS        | 15.6 KB     | 3.3 KB     |
| HTML       | 0.74 KB     | 0.44 KB    |
| **Total**  | **~245 KB** | **~75 KB** |

Zero external runtime dependencies beyond React + ReactDOM.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Add your generator in `src/lib/generators/`
4. Register it in `src/lib/registry.ts` and `src/types.ts`
5. Tests run automatically across all registered modes
6. `pnpm build` and commit the `docs/` output
7. Open a PR

---

## 📄 License

MIT

---

<p align="center">
  🐐 Built by <a href="https://github.com/GoatXYZ">GOAT.XYZ</a>
</p>
