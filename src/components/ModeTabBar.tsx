import { useState } from "react";
import type { ModeId } from "../types";
import { MODE_REGISTRY } from "../lib/registry";

type ModeTabBarProps = {
  activeMode: ModeId;
  onSelect: (id: ModeId) => void;
};

export function ModeTabBar({ activeMode, onSelect }: ModeTabBarProps) {
  const [expanded, setExpanded] = useState(false);
  const activeDef = MODE_REGISTRY.find((m) => m.id === activeMode);

  return (
    <div className="mode-picker">
      <button
        className="mode-picker-toggle"
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-label="Art mode"
      >
        <div className="mode-picker-current">
          <span className="mode-picker-label">{activeDef?.label}</span>
          <span className="mode-picker-desc">{activeDef?.description}</span>
        </div>
        <svg
          className="mode-picker-chevron"
          data-open={expanded || undefined}
          viewBox="0 0 12 12"
          width="10"
          height="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </button>

      {expanded && (
        <div className="mode-card-grid" role="listbox" aria-label="Art mode">
          {MODE_REGISTRY.map((mode) => (
            <button
              key={mode.id}
              className="mode-card"
              role="option"
              type="button"
              aria-selected={mode.id === activeMode}
              data-active={mode.id === activeMode || undefined}
              onClick={() => {
                onSelect(mode.id);
                setExpanded(false);
              }}
            >
              <span className="mode-card-name">{mode.label}</span>
              <span className="mode-card-desc">{mode.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
