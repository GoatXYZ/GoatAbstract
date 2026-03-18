# Wave Placeholder Site Implementation Plan

> **For agentic workers:** Execute this plan task-by-task using subagent-driven-development.

**Goal:** Build a Vite React + TypeScript dark-mode website that generates seeded abstract wave line art placeholder images with exact width and height controls, customizable line/background colors, live SVG preview, and export to SVG and PNG.
**Architecture:** The app will remain a client-only single-page React application. A small pure generator module will transform user controls plus a deterministic seed into SVG path data and a serialized SVG document, while the UI layer manages form state, preview rendering, randomization, and export actions for both exact-size SVG download and rasterized PNG download.
**Tech Stack:** Vite, React 19, TypeScript, Vitest, Testing Library, SVG
***

## File Impact

### Create

- `docs/plans/2026-03-18-wave-placeholder-site.md`
- `src/lib/waveArt.ts`
- `src/lib/waveArt.test.ts`
- `src/App.test.tsx`
- `src/components/ControlPanel.tsx`
- `src/components/PreviewFrame.tsx`
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/types.ts`
- `src/test/setup.ts`

### Modify

- `package.json`
- `vite.config.ts`
- `src/App.tsx`
- `src/App.css`
- `src/index.css`
- `src/main.tsx`
- `README.md`

### Delete

- `src/assets/react.svg`
- `src/assets/vite.svg`
- `src/assets/hero.png`

## Tasks

- [ ] Install runtime and test dependencies before feature work.
  Files: `package.json`
  Commands: `npm install`; `npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`
  Expected output: `node_modules/` exists, `package-lock.json` exists, `npm` exits with code 0, and `package.json` includes the new dev dependencies.

- [ ] Configure test and app entry points so the project can run unit and component tests.
  Files: `vite.config.ts`, `src/test/setup.ts`, `package.json`, `src/main.tsx`
  Commands: `sed -n '1,220p' vite.config.ts`; `npm run test -- --run`
  Expected output: Vite config exposes a Vitest `test` block using `jsdom`, the setup file registers jest-dom matchers, `package.json` contains a `test` script, and the test command exits successfully once tests are present.

- [ ] Define the deterministic wave-art domain model and write failing unit tests first.
  Files: `src/types.ts`, `src/lib/waveArt.test.ts`
  Commands: `npm run test -- --run src/lib/waveArt.test.ts`
  Expected output: Tests initially fail because `src/lib/waveArt.ts` does not exist yet, and the test file asserts exact-dimension SVG output, deterministic seeded regeneration, and valid line/background color propagation.

- [ ] Implement the pure generator that creates layered wave paths and serializes exact-size SVG output.
  Files: `src/lib/waveArt.ts`, `src/types.ts`
  Commands: `npm run test -- --run src/lib/waveArt.test.ts`
  Expected output: The generator returns stable output for the same seed and settings, different output for different seeds, and serialized SVG strings with the requested pixel width and height.

- [ ] Replace the starter UI with a focused dark-only generator shell and write component tests first for critical interactions.
  Files: `src/App.test.tsx`, `src/App.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/ControlPanel.tsx`, `src/components/PreviewFrame.tsx`, `src/App.css`, `src/index.css`
  Commands: `npm run test -- --run src/App.test.tsx`
  Expected output: New component tests fail first for width/height inputs, seed updates, color pickers, randomize behavior, SVG export button presence, PNG export button presence, and preview rendering hooks before the UI implementation is completed.

- [ ] Implement the generator UI with exact-size controls, seed entry, randomize action, dark presentation, and live SVG preview.
  Files: `src/App.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/ControlPanel.tsx`, `src/components/PreviewFrame.tsx`, `src/App.css`, `src/index.css`, `src/types.ts`
  Commands: `npm run test -- --run`; `npm run build`
  Expected output: The app renders a dark-only layout, users can change width, height, seed, line color, and background color, and the preview updates immediately with no TypeScript or build errors.

- [ ] Add export behavior and verify exact-dimension downloadable output.
  Files: `src/App.tsx`, `src/components/ControlPanel.tsx`, `src/lib/waveArt.ts`
  Commands: `npm run test -- --run`; `npm run build`
  Expected output: The UI exposes SVG export and PNG export controls, exported files use the current width and height exactly, and tests confirm the serialized SVG contains those dimensions.

- [ ] Remove unused starter assets and document the finished product.
  Files: `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`, `README.md`
  Commands: `npm run lint`; `npm run build`
  Expected output: Unused assets are removed, the README explains setup and features, and lint/build both exit with code 0.

- [ ] Run the full validation pass and record operational blockers.
  Files: `package.json`
  Commands: `npm run test -- --run`; `npm run lint`; `npm run build`; `git status --short`
  Expected output: Tests, lint, and build pass. If the workspace is not a Git repo or has no remote, note PR creation as blocked instead of guessing.
