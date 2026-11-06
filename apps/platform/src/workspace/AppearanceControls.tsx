import { PALETTES, type Palette } from "./appearance";
import { useWorkspace } from "./state";
import { SkyControls } from "./SkyControls";

export function AppearanceControls() {
  const { palette, setPalette, previewHour, setPreviewHour } = useWorkspace();
  return (
    <div className="appearance-controls">
      <fieldset>
        <legend>Palette</legend>
        <div className="palette-choices">
          {Object.keys(PALETTES).map((p) => (
            <button
              key={p}
              aria-pressed={palette === p}
              onClick={() => setPalette(p as Palette)}
            >
              {p[0].toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </fieldset>
      <SkyControls />
      <details>
        <summary>Simulate time of day</summary>
        <label className="field-label">
          Hour · {previewHour === null ? "Local clock" : `${previewHour}:00`}
          <input
            aria-label="Atmosphere preview hour"
            type="range"
            min="0"
            max="23"
            value={previewHour ?? new Date().getHours()}
            onChange={(e) => setPreviewHour(Number(e.target.value))}
          />
        </label>
        <button className="text-button" onClick={() => setPreviewHour(null)}>
          Use local clock
        </button>
      </details>
    </div>
  );
}
