type PreviewFrameProps = {
  svgMarkup: string;
  width: number;
  height: number;
  onFullscreen: () => void;
};

export function PreviewFrame({ svgMarkup, width, height, onFullscreen }: PreviewFrameProps) {
  return (
    <section className="preview-panel">
      <div className="preview-meta">
        <p>Preview</p>
        <span>
          {width}
          {"\u2009\u00d7\u2009"}
          {height}
        </span>
      </div>
      <div
        className="preview-stage"
        role="button"
        tabIndex={0}
        onClick={onFullscreen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onFullscreen();
          }
        }}
        aria-label="Open fullscreen preview"
      >
        <div
          className="preview-svg"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
          title="Wave art preview"
        />
      </div>
    </section>
  );
}
