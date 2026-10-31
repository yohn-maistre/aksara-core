import { test } from "node:test";
import assert from "node:assert/strict";
import { createWeatherPort } from "./weather.mjs";
test("weather broker fixes destinations, rounds city coordinates and caches conditions without account data", async () => {
  const requests = [];
  const weather = createWeatherPort({
    fetchImpl: async (url, options) => {
      requests.push(url);
      assert.equal(options.redirect, "error");
      assert.deepEqual(options.headers, { accept: "application/json" });
      return Response.json(
        url.hostname.startsWith("geocoding-")
          ? {
              results: [
                {
                  name: "Jayapura",
                  latitude: -2.533,
                  longitude: 140.718,
                  country_code: "ID",
                  timezone: "Asia/Jayapura",
                },
              ],
            }
          : {
              current: {
                weather_code: 45,
                cloud_cover: 75,
                time: "2026-10-31T12:00",
              },
            },
      );
    },
  });
  const places = await weather.search("Jayapura");
  assert.equal(places[0].latitude, -2.53);
  assert.equal((await weather.current(-2.533, 140.718)).scene, "haze");
  await weather.current(-2.534, 140.719);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].hostname, "api.open-meteo.com");
  assert.equal(requests[1].searchParams.get("longitude"), "140.72");
  await assert.rejects(weather.current(100, 0));
  await assert.rejects(weather.search("x"));
});
