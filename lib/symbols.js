import { BIST_SYMBOLS } from "../data/bistSymbols.js";
import { fetchJson } from "./http.js";

const SYMBOL_SOURCES = [
  "https://bigpara.hurriyet.com.tr/api/v1/hisse/list",
  "https://api.asenax.com/bist/list/"
];
const SYMBOL_CACHE_MS = 60 * 60 * 1000;

let symbolCache = null;
let symbolCacheAt = 0;

export async function getBistSymbols() {
  if (symbolCache && Date.now() - symbolCacheAt < SYMBOL_CACHE_MS) return symbolCache;

  for (const url of SYMBOL_SOURCES) {
    try {
      const payload = await fetchJson(url, {
        timeout: 8000,
        headers: { "user-agent": "Mozilla/5.0 SonaratTerminal/1.0" }
      });
      const symbols = normalizeRemoteSymbols(payload?.data || []);
      if (symbols.length > BIST_SYMBOLS.length) {
        return rememberSymbols({
          symbols: mergeWithBaseSymbols(symbols),
          source: url,
          isLive: true,
          updatedAt: new Date().toISOString()
        });
      }
    } catch {
      // Try the next source, then fall back to bundled symbols.
    }
  }

  if (symbolCache?.symbols?.length) {
    return {
      ...symbolCache,
      source: `stale:${symbolCache.source}`,
      isLive: false,
      updatedAt: new Date().toISOString()
    };
  }

  return rememberSymbols({
    symbols: BIST_SYMBOLS,
    source: "bundled",
    isLive: false,
    updatedAt: new Date().toISOString()
  });
}

export async function getBistSymbolMeta(symbol) {
  const normalized = normalizeSymbol(symbol);
  const { symbols } = await getBistSymbols();
  return symbols.find((item) => item.symbol === normalized) || { symbol: normalized, name: normalized };
}

export function normalizeSymbol(symbol) {
  const raw = String(symbol || "BIST100").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return raw === "XU100" ? "BIST100" : raw;
}

export function getYahooSymbol(symbol) {
  const normalized = normalizeSymbol(symbol);
  const base = BIST_SYMBOLS.find((item) => item.symbol === normalized);
  return base?.yahoo || `${normalized}.IS`;
}

function normalizeRemoteSymbols(items) {
  return items
    .filter((item) => item?.kod && (!item.tip || String(item.tip).toLocaleLowerCase("tr-TR") === "hisse"))
    .map((item) => ({
      symbol: normalizeSymbol(item.kod),
      name: String(item.ad || item.kod).trim(),
      yahoo: getYahooSymbol(item.kod)
    }))
    .filter((item) => item.symbol && item.symbol !== "BIST100")
    .sort((a, b) => a.symbol.localeCompare(b.symbol, "tr-TR"));
}

function mergeWithBaseSymbols(remoteSymbols) {
  const merged = new Map();
  BIST_SYMBOLS.forEach((item) => merged.set(item.symbol, item));
  remoteSymbols.forEach((item) => merged.set(item.symbol, item));
  return Array.from(merged.values()).sort((a, b) => {
    if (a.symbol === "BIST100") return -1;
    if (b.symbol === "BIST100") return 1;
    return a.symbol.localeCompare(b.symbol, "tr-TR");
  });
}

function rememberSymbols(payload) {
  symbolCache = payload;
  symbolCacheAt = Date.now();
  return payload;
}
