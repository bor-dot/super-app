const REQUEST_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; SonaratBot/1.0)",
};

const BLOCKED_TEXT = [
  "çerez",
  "cookie",
  "gizlilik",
  "reklam",
  "abonelik",
  "son dakika",
  "haberin devamı",
  "tüm hakları",
  "javascript",
];

function decodeNumericEntity(match, value, radix) {
  const codePoint = Number.parseInt(value, radix);
  if (!Number.isFinite(codePoint)) return match;

  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return match;
  }
}

function decodeText(value = "") {
  let text = String(value);

  for (let i = 0; i < 2; i += 1) {
    text = text
      .replace(/&amp;/g, "&")
      .replace(/&#x([0-9a-f]+);/gi, (match, hex) => decodeNumericEntity(match, hex, 16))
      .replace(/&#(\d+);/g, (match, decimal) => decodeNumericEntity(match, decimal, 10))
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }

  return text.replace(/\s+/g, " ").trim();
}

function stripTags(value = "") {
  return decodeText(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeForMatch(value = "") {
  return decodeText(value)
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim();
}

function trimSummary(value = "") {
  const clean = stripTags(value);
  if (!clean) return "";

  if (clean.length <= 520) return clean;

  const slice = clean.slice(0, 520);
  const lastSentence = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  return `${slice.slice(0, lastSentence > 180 ? lastSentence + 1 : 500).trim()}...`;
}

function isUsefulParagraph(text, title = "") {
  const clean = normalizeForMatch(text);
  if (clean.length < 90) return false;
  if (title && clean === normalizeForMatch(title)) return false;
  return !BLOCKED_TEXT.some((blocked) => clean.includes(normalizeForMatch(blocked)));
}

function getMeta(html, name) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern)?.[1];
    if (match) return decodeText(match);
  }

  return "";
}

function findInJsonLd(value) {
  if (!value || typeof value !== "object") return "";

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findInJsonLd(item);
      if (found) return found;
    }
    return "";
  }

  const type = Array.isArray(value["@type"]) ? value["@type"].join(" ") : value["@type"];
  if (/Article|NewsArticle|ReportageNewsArticle/i.test(String(type || ""))) {
    return value.articleBody || value.description || "";
  }

  return findInJsonLd(value["@graph"]);
}

function getJsonLdSummary(html) {
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];

  for (const script of scripts) {
    const jsonText = script.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "").trim();
    try {
      const found = findInJsonLd(JSON.parse(decodeText(jsonText)));
      if (found) return String(found);
    } catch {
      // Keep trying other structured data blocks.
    }
  }

  return "";
}

function getFirstParagraph(html, title = "") {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  const paragraphs = body.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) || [];

  for (const paragraph of paragraphs) {
    const clean = stripTags(paragraph);
    if (isUsefulParagraph(clean, title)) return clean;
  }

  return "";
}

function validateUrl(url) {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    if (["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  const url = validateUrl(req.query?.url || "");
  const title = decodeText(req.query?.title || "");

  if (!url) {
    res.status(400).json({ summary: "" });
    return;
  }

  try {
    const response = await fetch(url, {
      headers: REQUEST_HEADERS,
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const summary =
      trimSummary(getFirstParagraph(html, title)) ||
      trimSummary(getJsonLdSummary(html)) ||
      trimSummary(getMeta(html, "og:description")) ||
      trimSummary(getMeta(html, "description")) ||
      trimSummary(getMeta(html, "twitter:description"));

    res.status(200).json({ summary });
  } catch (error) {
    res.status(200).json({ summary: "" });
  }
}
