/** Optional public weather broker. No device geolocation, keys, arbitrary host,
 * model prompts or credentials are sent. User-selected city coordinates only. */
export function createWeatherPort({ fetchImpl = fetch } = {}) {
  const cache = new Map();
  async function read(url) {
    const r = await fetchImpl(url, {
      redirect: "error",
      signal: AbortSignal.timeout(8000),
      headers: { accept: "application/json" },
    });
    if (!r.ok) {
      await r.body?.cancel();
      throw new Error("Weather service is unavailable");
    }
    const chunks = [];
    let bytes = 0;
    for await (const chunk of r.body) {
      bytes += chunk.byteLength;
      if (bytes > 64000) {
        throw new Error("Weather response exceeded its budget");
      }
      chunks.push(Buffer.from(chunk));
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  }
  return {
    async search(query) {
      if (
        typeof query !== "string" ||
        query.trim().length < 2 ||
        query.length > 80
      )
        throw new Error("Enter a city name");
      const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
      url.search = new URLSearchParams({
        name: query.trim(),
        count: "5",
        language: "en",
        format: "json",
      }).toString();
      const data = await read(url);
      return (data.results || [])
        .slice(0, 5)
        .filter(
          (v) =>
            Number.isFinite(v.latitude) &&
            Math.abs(v.latitude) <= 90 &&
            Number.isFinite(v.longitude) &&
            Math.abs(v.longitude) <= 180,
        )
        .map((v) => ({
          name: `${String(v.name).slice(0, 60)}${v.country_code ? `, ${String(v.country_code).slice(0, 2)}` : ""}`,
          latitude: Math.round(v.latitude * 100) / 100,
          longitude: Math.round(v.longitude * 100) / 100,
          timezone: String(v.timezone || "").slice(0, 80),
        }));
    },
    async current(latitude, longitude) {
      if (
        !Number.isFinite(latitude) ||
        Math.abs(latitude) > 90 ||
        !Number.isFinite(longitude) ||
        Math.abs(longitude) > 180
      )
        throw new Error("Choose valid city coordinates");
      const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
      if (cache.has(key) && cache.get(key).expires > Date.now())
        return cache.get(key).value;
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.search = new URLSearchParams({
        latitude: latitude.toFixed(2),
        longitude: longitude.toFixed(2),
        current: "weather_code,cloud_cover",
        timezone: "auto",
      }).toString();
      const data = await read(url),
        code = data.current?.weather_code,
        cloud = data.current?.cloud_cover;
      if (!Number.isFinite(code) || !Number.isFinite(cloud))
        throw new Error("Weather data is unavailable");
      const value = {
        code,
        cloud_cover: Math.max(0, Math.min(100, cloud)),
        observed_at: String(data.current.time || "").slice(0, 30),
        fetched_at: Date.now(),
        source: "Open-Meteo",
        scene: [45, 48].includes(code)
          ? "haze"
          : code >= 51
            ? "rain"
            : code >= 2
              ? "cloudy"
              : "clear",
      };
      if (cache.size >= 64) cache.delete(cache.keys().next().value);
      cache.set(key, { expires: Date.now() + 10 * 60 * 1000, value });
      return value;
    },
  };
}
