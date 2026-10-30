import { PALETTES, type Palette } from "./appearance";
import { useWorkspace } from "./state";
export function AppearanceControls() {
  const {
    palette,
    setPalette,
    atmosphere,
    setAtmosphere,
    reducedEffects,
    setReducedEffects,
    previewHour,
    setPreviewHour,
  } = useWorkspace();
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
      <label className="field-label">
        Atmosphere
        <select
          aria-label="Atmosphere"
          value={atmosphere}
          onChange={(e) => setAtmosphere(e.target.value)}
        >
          <option value="time">Follow local time</option>
          <option value="off">Plain background</option>
        </select>
      </label>
      <label className="check-label">
        <input
          type="checkbox"
          checked={reducedEffects}
          onChange={(e) => setReducedEffects(e.target.checked)}
        />
        Reduce glass & shader effects
      </label>
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
