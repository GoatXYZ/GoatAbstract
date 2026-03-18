import type { ChangeEvent } from "react";
import type { ArtSettings, ParamDescriptor } from "../types";
import { ModeParamSlider } from "./ModeParamSlider";

const PRESETS = [
  { label: "HD", w: 1920, h: 1080 },
  { label: "OG", w: 1200, h: 630 },
  { label: "1:1", w: 1080, h: 1080 },
  { label: "4K", w: 3840, h: 2160 },
  { label: "Story", w: 1080, h: 1920 },
  { label: "Banner", w: 1500, h: 500 },
];

const STROKE_SCALE: ParamDescriptor = {
  key: "strokeScale",
  label: "Stroke Weight",
  min: 0.2,
  max: 4,
  step: 0.1,
};
const OPACITY_SCALE: ParamDescriptor = {
  key: "opacityScale",
  label: "Opacity",
  min: 0.1,
  max: 2,
  step: 0.1,
};

type ControlPanelProps = {
  settings: ArtSettings;
  modeParams: ParamDescriptor[];
  aspectLocked: boolean;
  onSettingChange: (key: string, value: string | number) => void;
  onParamChange: (key: string, value: number) => void;
  onRandomize: () => void;
  onDownloadSvg: () => void;
  onDownloadPng: () => void;
  onCopySvg: () => void;
  onShare: () => void;
  onExplore: () => void;
  onPreset: (width: number, height: number) => void;
  onToggleAspectLock: () => void;
};

export function ControlPanel({
  settings,
  modeParams,
  aspectLocked,
  onSettingChange,
  onParamChange,
  onRandomize,
  onDownloadSvg,
  onDownloadPng,
  onCopySvg,
  onShare,
  onExplore,
  onPreset,
  onToggleAspectLock,
}: ControlPanelProps) {
  const handleNumber = (field: string) => (event: ChangeEvent<HTMLInputElement>) => {
    onSettingChange(field, Number(event.target.value));
  };

  const handleColor = (field: string) => (event: ChangeEvent<HTMLInputElement>) => {
    onSettingChange(field, event.target.value);
  };

  return (
    <section className="control-panel" aria-label="Generator controls">
      <div className="dimension-group">
        <label className="field">
          <span>W (px)</span>
          <input
            min={64}
            step={1}
            type="number"
            value={settings.width}
            onChange={handleNumber("width")}
          />
        </label>

        <button
          className="aspect-lock-btn"
          type="button"
          data-locked={aspectLocked || undefined}
          onClick={onToggleAspectLock}
          title={aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
          aria-label={aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
        >
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            {aspectLocked ? <path d="M3 5v6M13 5v6M3 8h10" /> : <path d="M3 5v6M13 5v6" />}
          </svg>
        </button>

        <label className="field">
          <span>H (px)</span>
          <input
            min={64}
            step={1}
            type="number"
            value={settings.height}
            onChange={handleNumber("height")}
          />
        </label>
      </div>

      <div className="preset-chips">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className="preset-chip"
            type="button"
            data-active={(settings.width === p.w && settings.height === p.h) || undefined}
            onClick={() => onPreset(p.w, p.h)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <label className="field">
        <span>Seed</span>
        <input
          type="text"
          value={settings.seed}
          onChange={(event) => onSettingChange("seed", event.target.value)}
        />
      </label>

      {modeParams.length > 0 && (
        <div className="control-group mode-params">
          {modeParams.map((param) => (
            <ModeParamSlider
              key={param.key}
              descriptor={param}
              value={(settings as Record<string, unknown>)[param.key] as number}
              onChange={onParamChange}
            />
          ))}
        </div>
      )}

      <div className="control-group mode-params">
        <ModeParamSlider
          descriptor={STROKE_SCALE}
          value={settings.strokeScale ?? 1}
          onChange={(key, val) => onSettingChange(key, val)}
        />
        <ModeParamSlider
          descriptor={OPACITY_SCALE}
          value={settings.opacityScale ?? 1}
          onChange={(key, val) => onSettingChange(key, val)}
        />
      </div>

      <div className="control-group two-up">
        <label className="field field-color">
          <span>Stroke</span>
          <input type="color" value={settings.lineColor} onChange={handleColor("lineColor")} />
        </label>

        <label className="field field-color">
          <span>Fill</span>
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={handleColor("backgroundColor")}
          />
        </label>
      </div>

      <div className="button-row">
        <button type="button" onClick={onRandomize}>
          Randomize
        </button>
        <button type="button" onClick={onExplore}>
          Explore
        </button>
      </div>
      <div className="button-row">
        <button type="button" onClick={onCopySvg}>
          Copy SVG
        </button>
        <button type="button" onClick={onShare}>
          Share
        </button>
      </div>
      <div className="button-row">
        <button type="button" onClick={onDownloadSvg}>
          Download SVG
        </button>
        <button type="button" className="button-strong" onClick={onDownloadPng}>
          Download PNG
        </button>
      </div>
    </section>
  );
}
