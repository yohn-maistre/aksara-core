import { test } from "node:test";
import assert from "node:assert/strict";
import {
  daylightAt,
  validLocation,
} from "../apps/platform/src/workspace/daylight.ts";
const rgb = (value) => value.match(/\d+/g).map(Number);
test("stored sky locations reject malformed coordinates and invalid timezones", () => {
  const place = { name: "Jayapura", latitude: -2.53, longitude: 140.72 };
  assert.ok(validLocation({ ...place, timezone: "Asia/Jayapura" }));
  assert.equal(validLocation({ ...place, timezone: "invalid-zone" }), false);
  assert.equal(validLocation({ ...place, latitude: 91 }), false);
  assert.equal(validLocation(null), false);
});
test("solar background stays continuous across sunrise, sunset and component-theme changes", () => {
  const location = { name: "Jayapura", latitude: -2.53, longitude: 140.72 };
  const noon = daylightAt(new Date("2026-10-31T03:00:00Z"), location);
  const night = daylightAt(new Date("2026-10-31T15:00:00Z"), location);
  assert.ok(noon.daylight > 0.99);
  assert.ok(night.daylight < 0.01);
  assert.ok(noon.sunrise instanceof Date);
  assert.ok(noon.sunset instanceof Date);
  let previous,
    themeChanges = 0;
  for (
    let t = Date.parse("2026-10-30T15:00:00Z");
    t <= Date.parse("2026-10-31T15:00:00Z");
    t += 15000
  ) {
    const value = daylightAt(new Date(t), location);
    if (previous) {
      assert.ok(
        ["ground", "upper", "lower", "cloud"].every((role) =>
          rgb(value[role]).every(
            (v, i) => Math.abs(v - rgb(previous[role])[i]) <= 3,
          ),
        ),
      );
      if (value.isLight !== previous.isLight) themeChanges++;
    }
    previous = value;
  }
  assert.equal(themeChanges, 2);
});
test("polar daylight and a missing location produce finite colors without invented sunrise times", () => {
  const polar = daylightAt(new Date("2026-06-21T12:00:00Z"), {
    name: "North",
    latitude: 89,
    longitude: 0,
  });
  assert.equal(polar.alwaysUp, true);
  assert.equal(polar.sunrise, null);
  assert.ok(!polar.ground.includes("NaN"));
  const fallback = daylightAt(new Date("2026-10-31T12:00:00"));
  assert.equal(fallback.sunrise, null);
  assert.ok(fallback.isLight);
});
