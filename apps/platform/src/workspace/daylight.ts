import { getPosition, getTimes } from "suncalc";
export type SkyLocation = {
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a: number[], b: number[], t: number) =>
  a.map((v, i) => v + (b[i] - v) * t);
const color = (rgb: number[]) =>
  `rgb(${rgb.map((v) => Math.round(v)).join(" ")})`;
const luminance = (rgb: number[]) =>
  rgb
    .map((v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    })
    .reduce((v, c, i) => v + c * [0.2126, 0.7152, 0.0722][i], 0);
export function validLocation(value: unknown): value is SkyLocation {
  const v = value as SkyLocation;
  if (v?.timezone !== undefined) {
    if (typeof v.timezone !== "string") return false;
    try {
      new Intl.DateTimeFormat(undefined, { timeZone: v.timezone });
    } catch {
      return false;
    }
  }
  return (
    !!v &&
    typeof v.name === "string" &&
    v.name.length <= 100 &&
    Number.isFinite(v.latitude) &&
    Math.abs(v.latitude) <= 90 &&
    Number.isFinite(v.longitude) &&
    Math.abs(v.longitude) <= 180
  );
}
/** Background colors depend on solar height, never the binary component theme.
 * SunCalc v2 uses degrees (v1 used radians). No network or location inference. */
export function daylightAt(date: Date, location: SkyLocation | null = null) {
  const hour =
    date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const altitude = location
    ? getPosition(date, location.latitude, location.longitude).altitude
    : 36 * Math.sin(((hour - 6) / 24) * Math.PI * 2);
  const daylight = smooth(-12, 8, altitude);
  const twilight = Math.exp(-(((altitude + 2) / 7) ** 2));
  const ground = mix(
    mix([25, 28, 39], [211, 220, 225], daylight),
    [183, 157, 151],
    twilight * 0.16,
  );
  const times = location
    ? getTimes(date, location.latitude, location.longitude)
    : null;
  // Quiet the cloud contrast near the ink switch. The sky keeps changing,
  // without a brighter cloud passing behind white text at the crossover.
  const groundLight = luminance(ground);
  const skyColor = (rgb: number[]) =>
    color(mix(ground, rgb, clamp(Math.abs(groundLight - 0.179) / 0.25)));
  return {
    altitude,
    daylight,
    twilight,
    ground: color(ground),
    upper: skyColor(mix([36, 43, 67], [159, 187, 207], daylight)),
    lower: skyColor(
      mix(
        mix([47, 43, 61], [205, 211, 215], daylight),
        [215, 162, 139],
        twilight * 0.55,
      ),
    ),
    cloud: skyColor(mix([83, 86, 106], [239, 237, 232], daylight)),
    isLight: groundLight > 0.179,
    sunrise: times?.sunrise || null,
    sunset: times?.sunset || null,
    alwaysUp: times?.alwaysUp || false,
    alwaysDown: times?.alwaysDown || false,
  };
}
