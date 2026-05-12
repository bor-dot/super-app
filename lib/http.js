export async function fetchText(url, options = {}) {
  const response = await fetch(url, { headers: { "user-agent": "SonaratAkisi/1.0", accept: "text/html,application/rss+xml,application/xml,application/json;q=0.9,*/*;q=0.8", ...(options.headers || {}) }, signal: AbortSignal.timeout(options.timeout || 9000), cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
  return response.text();
}
export async function fetchJson(url, options = {}) { return JSON.parse(await fetchText(url, { ...options, headers: { accept: "application/json", ...(options.headers || {}) } })); }
export function decodeHtml(value = "") { return String(value).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16))).replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number.parseInt(num, 10))).trim(); }
export function stripTags(value = "") { return decodeHtml(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
export function getTag(block, tag) { const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i")); return match ? decodeHtml(match[1]) : ""; }
export function normalizeTr(value = "") { return decodeHtml(value).toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").trim(); }
