import { fetchJson } from "./http.js";
import { getBistSymbols, getYahooSymbol, normalizeSymbol } from "./symbols.js";

const DEFAULT_RANGE = "6mo";
const DEFAULT_INTERVAL = "1d";

export async function getChartData({ symbol = "BIST100", range = DEFAULT_RANGE, interval = DEFAULT_INTERVAL } = {}) {
  const normalized = normalizeSymbol(symbol);
  const symbolList = await getBistSymbols();
  const meta = symbolList.symbols.find((item) => item.symbol === normalized) || { symbol: normalized, name: normalized };

  try {
    const yahooSymbol = getYahooSymbol(normalized);
    const data = await fetchYahooChart(yahooSymbol, range, interval);
    return {
      symbol: normalized,
      name: meta.name,
      yahooSymbol,
      range,
      interval,
      isLive: true,
      ...data,
      symbols: symbolList.symbols,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    const candles = buildFallbackCandles(normalized);
    return {
      symbol: normalized,
      name: meta.name,
      yahooSymbol: getYahooSymbol(normalized),
      range,
      interval,
      isLive: false,
      error: error.message,
      candles,
      lastPrice: candles.at(-1)?.close || null,
      previousClose: candles.at(-2)?.close || null,
      changePercent: changePercent(candles.at(-1)?.close, candles.at(-2)?.close),
      symbols: symbolList.symbols,
      updatedAt: new Date().toISOString()
    };
  }
}

async function fetchYahooChart(yahooSymbol, range, interval) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=${encodeURIComponent(
    range
  )}&interval=${encodeURIComponent(interval)}&includePrePost=false`;
  const payload = await fetchJson(url, {
    timeout: 9000,
    headers: { "user-agent": "Mozilla/5.0 SonaratTerminal/1.0" }
  });

  const result = payload.chart?.result?.[0];
  const error = payload.chart?.error;
  if (!result || error) throw new Error(error?.description || "Grafik verisi alinamadi");

  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0] || {};
  const candles = timestamps
    .map((timestamp, index) => ({
      time: toDate(timestamp),
      open: round(quote.open?.[index]),
      high: round(quote.high?.[index]),
      low: round(quote.low?.[index]),
      close: round(quote.close?.[index]),
      volume: Number(quote.volume?.[index] || 0)
    }))
    .filter((item) => [item.open, item.high, item.low, item.close].every(Number.isFinite));

  if (!candles.length) throw new Error("Bos grafik verisi");

  const lastPrice = candles.at(-1).close;
  const previousClose = result.meta?.chartPreviousClose || candles.at(-2)?.close || null;
  return {
    candles,
    lastPrice,
    previousClose,
    changePercent: changePercent(lastPrice, previousClose)
  };
}

function toDate(timestamp) {
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

function round(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : null;
}

function changePercent(lastPrice, previousClose) {
  if (!Number.isFinite(lastPrice) || !Number.isFinite(previousClose) || previousClose === 0) return null;
  return Math.round(((lastPrice - previousClose) / previousClose) * 10000) / 100;
}

function buildFallbackCandles(symbol) {
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const start = symbol === "BIST100" ? 9200 : 55 + (seed % 180);
  const today = new Date();
  const candles = [];
  let close = start;

  for (let index = 180; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const day = date.getDay();
    if (day === 0 || day === 6) continue;

    const drift = Math.sin((candles.length + seed) / 8) * 1.8 + Math.cos((candles.length + seed) / 13) * 1.1;
    const open = close;
    close = Math.max(1, close * (1 + drift / 100));
    const high = Math.max(open, close) * (1 + (0.8 + Math.abs(Math.sin(index))) / 100);
    const low = Math.min(open, close) * (1 - (0.7 + Math.abs(Math.cos(index))) / 100);

    candles.push({
      time: date.toISOString().slice(0, 10),
      open: round(open),
      high: round(high),
      low: round(low),
      close: round(close),
      volume: Math.round(4000000 + Math.abs(Math.sin(index + seed)) * 24000000)
    });
  }

  return candles;
}
