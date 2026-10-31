import { useState } from "react";
import { PREVIEW } from "../transport";
import { useWorkspace } from "./state";
import { validLocation, type SkyLocation } from "./daylight";
export function SkyControls() {
  const {
    skyLocation,
    setSkyLocation,
    weatherEnabled,
    setWeatherEnabled,
    skyScene,
    setSkyScene,
    weather,
    solar,
    api,
  } = useWorkspace();
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<SkyLocation[]>([]);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const format = (date: Date | null) =>
    date
      ? new Intl.DateTimeFormat(undefined, {
          hour: "numeric",
          minute: "2-digit",
          ...(skyLocation?.timezone ? { timeZone: skyLocation.timezone } : {}),
        }).format(date)
      : "—";
  return (
    <details className="sky-controls">
      <summary>Local sky{skyLocation ? ` · ${skyLocation.name}` : ""}</summary>
      <p className="composer-note">
        Sunrise and sunset are calculated on this device. Choose an approximate
        location; no device location permission is needed.
      </p>
      {skyLocation && (
        <div className="sky-times">
          <span>
            Sunrise <strong>{format(solar.sunrise)}</strong>
          </span>
          <span>
            Sunset <strong>{format(solar.sunset)}</strong>
          </span>
          {solar.alwaysUp && <span>Polar day</span>}
          {solar.alwaysDown && <span>Polar night</span>}
        </div>
      )}
      <label className="check-label">
        <input
          type="checkbox"
          checked={weatherEnabled}
          onChange={(e) => {
            setWeatherEnabled(e.target.checked);
            setPlaces([]);
          }}
        />{" "}
        Use Open-Meteo city search and weather
      </label>
      {weatherEnabled && (
        <>
          <p className="composer-note">
            Optional non-commercial public service. City searches and rounded
            city coordinates are sent to Open-Meteo.{" "}
            <a
              href="https://open-meteo.com/en/terms"
              target="_blank"
              rel="noreferrer"
            >
              Service terms
            </a>
          </p>
          {!PREVIEW ? (
            <div className="sky-search">
              <label className="field-label">
                City
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  maxLength={80}
                  placeholder="Find your city"
                />
              </label>
              <button
                className="secondary"
                disabled={searching || query.trim().length < 2}
                onClick={() => {
                  setSearching(true);
                  setError("");
                  void api("weather/search", { query, service_consent: true })
                    .then(setPlaces)
                    .catch(() =>
                      setError(
                        "City search is unavailable. You can enter coordinates below.",
                      ),
                    )
                    .finally(() => setSearching(false));
                }}
              >
                {searching ? "Finding…" : "Find"}
              </button>
            </div>
          ) : (
            <p className="composer-note">
              City search and live weather are available on your local host. You
              can test solar daylight with coordinates below.
            </p>
          )}
          {places.map((place) => (
            <button
              key={`${place.latitude}:${place.longitude}`}
              className="sky-place"
              onClick={() => {
                setSkyLocation(place);
                setPlaces([]);
                setQuery("");
              }}
            >
              {place.name}
            </button>
          ))}
          {skyLocation && (
            <p className="composer-note">
              {weather
                ? `${weather.scene} · updated ${new Date(weather.fetched_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                : "Weather unavailable; solar daylight continues locally."}{" "}
              ·{" "}
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
              >
                Weather by Open-Meteo
              </a>{" "}
              ·{" "}
              <a
                href="https://www.geonames.org/"
                target="_blank"
                rel="noreferrer"
              >
                GeoNames
              </a>
            </p>
          )}
        </>
      )}
      <details>
        <summary>Enter approximate coordinates</summary>
        <div className="sky-coordinates">
          <label className="field-label">
            Latitude
            <input
              inputMode="decimal"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="−2.53"
            />
          </label>
          <label className="field-label">
            Longitude
            <input
              inputMode="decimal"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="140.72"
            />
          </label>
        </div>
        <button
          className="text-button"
          disabled={!latitude.trim() || !longitude.trim()}
          onClick={() => {
            const value = {
              name: "Approximate location",
              latitude: Number(latitude),
              longitude: Number(longitude),
            };
            if (validLocation(value)) {
              setSkyLocation(value);
              setError("");
            } else
              setError(
                "Enter latitude from −90 to 90 and longitude from −180 to 180.",
              );
          }}
        >
          Use coordinates locally
        </button>
      </details>
      {skyLocation && (
        <button
          className="text-button"
          onClick={() => {
            setSkyLocation(null);
            setWeatherEnabled(false);
          }}
        >
          Forget location · use clock fallback
        </button>
      )}
      <label className="field-label">
        Sky character
        <select
          aria-label="Sky character"
          value={skyScene}
          onChange={(e) => setSkyScene(e.target.value)}
        >
          <option value="auto">Automatic</option>
          <option value="clear">Clear</option>
          <option value="haze">Haze</option>
          <option value="cloudy">Cloudy</option>
          <option value="rain">Rain</option>
        </select>
      </label>
      {error && (
        <p role="status" className="composer-note">
          {error}
        </p>
      )}
    </details>
  );
}
