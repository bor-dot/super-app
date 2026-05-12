const REQUEST_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; SonaratBot/1.0)",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

function parseTrNumber(value) {
  if (value === undefined || value === null) return null;
  const raw = String(value)
    .replace(/%/g, "")
    .trim();
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatSourceTime(value) {
  if (!value) return null;
  const parsed = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    signal: AbortSignal.timeout(7000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    signal: AbortSignal.timeout(7000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function currencyQuotes() {
  const data = await fetchJson("https://finans.truncgil.com/today.json");
  const usd = data.USD || {};
  const eur = data.EUR || {};

  return {
    updatedAt: formatSourceTime(data.Update_Date),
    usd: {
      key: "usd",
      label: "Dolar",
      symbol: "USD/TRY",
      value: parseTrNumber(usd.Satış || usd["Satış"] || usd.Alış || usd["Alış"]),
      changePercent: parseTrNumber(usd.Değişim || usd["Değişim"]),
      currency: "TRY",
    },
    eur: {
      key: "eur",
      label: "Euro",
      symbol: "EUR/TRY",
      value: parseTrNumber(eur.Satış || eur["Satış"] || eur.Alış || eur["Alış"]),
      changePercent: parseTrNumber(eur.Değişim || eur["Değişim"]),
      currency: "TRY",
    },
  };
}

async function bitcoinQuote() {
  const sources = [binanceBitcoinQuote, btcturkBitcoinQuote, coingeckoBitcoinQuote];
  let lastError = null;

  for (const source of sources) {
    try {
      return await source();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Bitcoin quote unavailable");
}

async function binanceBitcoinQuote() {
  const data = await fetchJson("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCTRY");
  return bitcoinPayload(Number(data.lastPrice), Number(data.priceChangePercent), data.closeTime);
}

async function btcturkBitcoinQuote() {
  const data = await fetchJson("https://api.btcturk.com/api/v2/ticker?pairSymbol=BTCTRY");
  const quote = data.data?.[0] || {};
  return bitcoinPayload(Number(quote.last), Number(quote.dailyPercent), quote.timestamp);
}

async function coingeckoBitcoinQuote() {
  const data = await fetchJson(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=try&include_24hr_change=true&include_last_updated_at=true",
  );
  const quote = data.bitcoin || {};
  return bitcoinPayload(Number(quote.try), Number(quote.try_24h_change), Number(quote.last_updated_at) * 1000);
}

function bitcoinPayload(value, changePercent, timestamp) {
  return {
    key: "btc",
    label: "Bitcoin",
    symbol: "BTC/TRY",
    value,
    changePercent,
    currency: "TRY",
    updatedAt: timestamp ? new Date(Number(timestamp)).toISOString() : null,
  };
}

async function bistQuote() {
  const html = await fetchText("https://www.cnbce.com/borsa/endeksler/bist-100");
  const value = html.match(/<span class="info-text">SON<\/span>\s*<span class="value-text">([^<]+)<\/span>/i)?.[1];
  const changeBlock = html.match(/<span class="info-text">GÜNLÜK DEĞİŞİM<\/span>\s*<div class="value-text[^"]*">([\s\S]*?)<\/div>/i)?.[1] || "";
  const changePercent = changeBlock.match(/\(([-+]?[\d.,]+)%\)/)?.[1];
  const updatedAt = html.match(/SON GÜNCELLEME:\s*([^<]+)</i)?.[1]?.trim();

  return {
    key: "bist",
    label: "BIST100",
    symbol: "XU100",
    value: parseTrNumber(value),
    changePercent: parseTrNumber(changePercent),
    currency: "PTS",
    updatedAt: updatedAt || null,
  };
}

function safeQuote(result, fallback) {
  if (result.status !== "fulfilled" || !Number.isFinite(result.value?.value)) {
    return { ...fallback, value: null, changePercent: null, unavailable: true };
  }
  return result.value;
}

export default async function handler(_req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store, no-cache, max-age=0, must-revalidate");
  res.setHeader("CDN-Cache-Control", "no-store");

  const [currenciesResult, bistResult, btcResult] = await Promise.allSettled([
    currencyQuotes(),
    bistQuote(),
    bitcoinQuote(),
  ]);

  const currencies =
    currenciesResult.status === "fulfilled"
      ? currenciesResult.value
      : {
          updatedAt: null,
          usd: { key: "usd", label: "Dolar", symbol: "USD/TRY", value: null, changePercent: null, currency: "TRY", unavailable: true },
          eur: { key: "eur", label: "Euro", symbol: "EUR/TRY", value: null, changePercent: null, currency: "TRY", unavailable: true },
        };

  const quotes = [
    currencies.usd,
    currencies.eur,
    safeQuote(bistResult, { key: "bist", label: "BIST100", symbol: "XU100", currency: "PTS" }),
    safeQuote(btcResult, { key: "btc", label: "Bitcoin", symbol: "BTC/TRY", currency: "TRY" }),
  ];

  res.status(200).json({
    quotes,
    updatedAt: new Date().toISOString(),
    sourceUpdatedAt: currencies.updatedAt,
  });
}
