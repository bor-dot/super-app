const ISTANBUL_LATITUDE = 41.0082;
const ISTANBUL_LONGITUDE = 28.9784;

const WEATHER_CODES = {
  0: "Açık",
  1: "Az bulutlu",
  2: "Parçalı bulutlu",
  3: "Bulutlu",
  45: "Sisli",
  48: "Sisli",
  51: "Çisenti",
  53: "Çisenti",
  55: "Çisenti",
  61: "Yağmurlu",
  63: "Yağmurlu",
  65: "Kuvvetli yağmur",
  71: "Karlı",
  73: "Karlı",
  75: "Kuvvetli kar",
  80: "Sağanak",
  81: "Sağanak",
  82: "Kuvvetli sağanak",
  95: "Gök gürültülü",
  96: "Fırtınalı",
  99: "Fırtınalı",
};

export default async function handler(_req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store, no-cache, max-age=0, must-revalidate");
  res.setHeader("CDN-Cache-Control", "no-store");

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", ISTANBUL_LATITUDE.toString());
    url.searchParams.set("longitude", ISTANBUL_LONGITUDE.toString());
    url.searchParams.set("current", "temperature_2m,apparent_temperature,weather_code,wind_speed_10m");
    url.searchParams.set("timezone", "Europe/Istanbul");

    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const current = data.current || {};
    const code = Number(current.weather_code);

    res.status(200).json({
      location: "İstanbul",
      temperature: Math.round(Number(current.temperature_2m)),
      apparentTemperature: Math.round(Number(current.apparent_temperature)),
      windSpeed: Math.round(Number(current.wind_speed_10m)),
      condition: WEATHER_CODES[code] || "Güncel",
      code,
      observedAt: current.time,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
}
