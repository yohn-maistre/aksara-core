import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
} from "@material/material-color-utilities";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
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
export function useAppearance(theme: string) {
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
    const timer = setInterval(update, 60000);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("focus", update);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("focus", update);
    };
  }, []);
  const hour = previewHour ?? now.getHours() + now.getMinutes() / 60;
  const resolvedTheme =
    theme === "auto" ? (hour >= 7 && hour < 18 ? "light" : "dark") : theme;
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
  ]);
  useEffect(() => {
    try {
      localStorage.setItem("aksara-palette", palette);
      localStorage.setItem("aksara-atmosphere", atmosphere);
      localStorage.setItem(
        "aksara-effects",
        reducedEffects ? "reduced" : "full",
      );
    } catch {
      /* Presentation still works when storage is unavailable. */
    }
  }, [palette, atmosphere, reducedEffects]);
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
  };
}
