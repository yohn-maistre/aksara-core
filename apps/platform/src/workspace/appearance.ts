import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
} from "@material/material-color-utilities";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { apiFetch, PREVIEW } from "../transport";
import { daylightAt, validLocation, type SkyLocation } from "./daylight";
export const PALETTES = {
  lilac: "#aa8bd5",
  clay: "#b7775c",
  sage: "#7b9287",
  neutral: "#8b8b95",
};
export type Palette = keyof typeof PALETTES;
const read = (key: string, fallback: string) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};
/** Clock phases, not astronomical sunrise or observed weather. Circular interpolation. */
export function atmosphereForHour(hour: number) {
  const stops = [
    [0, 245, 18],
    [5, 270, 22],
    [8, 32, 50],
    [13, 220, 57],
    [17, 25, 42],
    [20, 260, 22],
    [24, 245, 18],
  ];
  const h = ((hour % 24) + 24) % 24;
  const i = stops.findIndex(
    (s, index) =>
      index < stops.length - 1 && h >= s[0] && h < stops[index + 1][0],
  );
  const a = stops[Math.max(0, i)],
    b = stops[Math.max(0, i) + 1];
  const t = (h - a[0]) / (b[0] - a[0]);
  const delta = ((b[1] - a[1] + 540) % 360) - 180;
  return {
    hue: (a[1] + delta * t + 360) % 360,
    lightness: a[2] + (b[2] - a[2]) * t,
  };
}
export function useAppearance(theme: string, scope = "") {
  const [skyLocation, setSkyLocation] = useState<SkyLocation | null>(() => {
    try {
      const value = JSON.parse(read("aksara-sky-location", "null"));
      return validLocation(value) ? value : null;
    } catch {
      return null;
    }
  });
  const [weatherEnabled, setWeatherEnabled] = useState(
    () => read("aksara-weather", "off") === "on",
  );
  const [skyScene, setSkyScene] = useState(() => {
    const v = read("aksara-sky-scene", "auto");
    return ["auto", "clear", "haze", "cloudy", "rain"].includes(v) ? v : "auto";
  });
  const [weather, setWeather] = useState<{
    scene: string;
    cloud_cover: number;
    fetched_at: number;
  } | null>(null);
  useEffect(() => {
    let live = true;
    setWeather(null);
    if (!skyLocation || !weatherEnabled || !scope || PREVIEW) return;
    const update = async () => {
      if (document.hidden) return;
      try {
        const r = await apiFetch("/api/weather/current", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-aksara-scope": scope,
          },
          body: JSON.stringify({
            latitude: skyLocation.latitude,
            longitude: skyLocation.longitude,
            service_consent: true,
          }),
        });
        if (r.ok) {
          const value = await r.json();
          if (live) setWeather(value);
        }
      } catch {
        /* Solar daylight keeps working offline. */
      }
    };
    void update();
    const timer = setInterval(update, 15 * 60 * 1000);
    document.addEventListener("visibilitychange", update);
    return () => {
      live = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, [skyLocation, weatherEnabled, scope]);
  const [palette, setPalette] = useState<Palette>(() => {
    const p = read("aksara-palette", "lilac");
    return Object.hasOwn(PALETTES, p) ? (p as Palette) : "lilac";
  });
  const [atmosphere, setAtmosphere] = useState(() =>
    read("aksara-atmosphere", "time") === "off" ? "off" : "time",
  );
  const [reducedEffects, setReducedEffects] = useState(
    () => read("aksara-effects", "full") === "reduced",
  );
  const [previewHour, setPreviewHour] = useState<number | null>(null);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const update = () => {
      if (!document.hidden) setNow(new Date());
    };
    const timer = setInterval(update, 15000);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("focus", update);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("focus", update);
    };
  }, []);
  const hour = previewHour ?? now.getHours() + now.getMinutes() / 60;
  const skyDate = new Date(now);
  if (previewHour !== null) skyDate.setHours(previewHour, 0, 0, 0);
  const solar = daylightAt(skyDate, skyLocation);
  const resolvedTheme =
    theme === "auto" ? (solar.isLight ? "light" : "dark") : theme;
  const colors = useMemo(
    () =>
      themeFromSourceColor(argbFromHex(PALETTES[palette])).schemes[
        resolvedTheme === "dark" ? "dark" : "light"
      ].toJSON(),
    [palette, resolvedTheme],
  );
  const phase = atmosphereForHour(hour);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
    root.dataset.appearance = resolvedTheme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        resolvedTheme === "dark" ? "#23222b" : "#e7e5eb",
      );
    const c = (role: keyof typeof colors) => hexFromArgb(colors[role]);
    const roles = {
      "--canvas": "background",
      "--panel": "surface",
      "--soft": "surfaceVariant",
      "--ink": "onSurface",
      "--ink-muted": "onSurfaceVariant",
      "--line": "outlineVariant",
      "--green": "primary",
      "--primary": "primary",
      "--primary-foreground": "onPrimary",
      "--duet-user": "primaryContainer",
      "--user-ink": "onPrimaryContainer",
    } as const;
    for (const [token, role] of Object.entries(roles))
      root.style.setProperty(token, c(role));
    root.style.setProperty("--glass-tint", c("surface"));
    // The atmosphere never reads resolvedTheme: Auto's binary role switch
    // cannot make the sky jump. Explicit theme overrides add a gentle scrim.
    root.style.setProperty("--canvas", solar.ground);
    root.style.setProperty("--sky-ground", solar.ground);
    root.style.setProperty("--sky-upper", solar.upper);
    root.style.setProperty("--sky-lower", solar.lower);
    root.style.setProperty("--sky-cloud", solar.cloud);
    root.style.setProperty("--sky-daylight", String(solar.daylight));
    root.style.setProperty(
      "--sky-theme-scrim",
      theme === "auto"
        ? "transparent"
        : resolvedTheme === "dark"
          ? "#171923bc"
          : "#e3e5e7b8",
    );
    if (solar.twilight > 0.35 && theme === "auto") {
      const ink = solar.isLight ? "#000000" : "#ffffff";
      root.style.setProperty("--ink", ink);
      root.style.setProperty("--ink-muted", ink);
    }
    root.dataset.sky =
      skyScene === "auto"
        ? weather && Date.now() - weather.fetched_at < 60 * 60 * 1000
          ? weather.scene
          : "clear"
        : skyScene;
    root.style.setProperty("--atmo-hue", String(phase.hue));
    root.style.setProperty("--atmo-light", `${phase.lightness}%`);
    root.dataset.atmosphere = atmosphere;
    root.dataset.effects = reducedEffects ? "reduced" : "full";
  }, [
    colors,
    phase.hue,
    phase.lightness,
    atmosphere,
    reducedEffects,
    resolvedTheme,
    solar.ground,
    solar.upper,
    solar.lower,
    solar.cloud,
    solar.daylight,
    solar.twilight,
    solar.isLight,
    theme,
    skyScene,
    weather,
  ]);
  useEffect(() => {
    try {
      localStorage.setItem("aksara-palette", palette);
      localStorage.setItem("aksara-atmosphere", atmosphere);
      localStorage.setItem(
        "aksara-effects",
        reducedEffects ? "reduced" : "full",
      );
      localStorage.setItem("aksara-sky-location", JSON.stringify(skyLocation));
      localStorage.setItem("aksara-weather", weatherEnabled ? "on" : "off");
      localStorage.setItem("aksara-sky-scene", skyScene);
    } catch {
      /* Presentation still works when storage is unavailable. */
    }
  }, [
    palette,
    atmosphere,
    reducedEffects,
    skyLocation,
    weatherEnabled,
    skyScene,
  ]);
  return {
    resolvedTheme,
    palette,
    setPalette,
    atmosphere,
    setAtmosphere,
    reducedEffects,
    setReducedEffects,
    previewHour,
    setPreviewHour,
    skyLocation,
    setSkyLocation,
    weatherEnabled,
    setWeatherEnabled,
    skyScene,
    setSkyScene,
    weather,
    solar,
  };
}
