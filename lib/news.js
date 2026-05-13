import { fetchText, getTag, normalizeTr, stripTags } from "./http";

const FEEDS = [
  { source: "KAPVeri", category: "KAP", url: "https://kapveri.com/rss" },
  { source: "AA Ekonomi", category: "Ekonomi", url: "https://www.aa.com.tr/tr/rss/default?cat=ekonomi" },
  { source: "NTV Ekonomi", category: "Ekonomi", url: "https://www.ntv.com.tr/ekonomi.rss" },
  { source: "TRT Haber", category: "Gündem", url: "https://www.trthaber.com/sondakika.rss" },
  { source: "Bloomberg HT", category: "Piyasa", url: "https://www.bloomberght.com/rss" }
];

const SYMBOLS = {
  THYAO: ["thy", "türk hava yolları", "havacılık", "yolcu"],
  ASELS: ["aselsan", "savunma", "ase ls", "asels"],
  GARAN: ["garanti", "garan", "banka"],
  TUPRS: ["tüpraş", "tupras", "rafineri", "petrol"],
  KCHOL: ["koç holding", "kchol"],
  SAHOL: ["sabancı", "sahol"],
  ISCTR: ["iş bankası", "isctr"]
};

function parseRss(xml, feed) {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
  return blocks.slice(0, 20).map((block, index) => {
    const title = stripTags(getTag(block, "title"));
    const summary = stripTags(getTag(block, "description") || getTag(block, "summary") || getTag(block, "content:encoded"));
    const link = stripTags(getTag(block, "link")) || block.match(/<link[^>]+href=["']([^"']+)/i)?.[1] || "";
    const dateRaw = getTag(block, "pubDate") || getTag(block, "updated") || getTag(block, "published");
    const publishedAt = Number.isNaN(new Date(dateRaw).getTime()) ? new Date().toISOString() : new Date(dateRaw).toISOString();
    const symbol = inferSymbol(`${title} ${summary}`);
    return {
      id: `${feed.source}-${index}-${title}`,
      source: feed.source,
      category: symbol ? "KAP/Şirket" : feed.category,
      title,
      summary: summary.slice(0, 420),
      url: link,
      symbol,
      publishedAt,
      score: scoreNews(title, summary, symbol)
    };
  }).filter((item) => item.title);
}

function inferSymbol(text) {
  const normalized = normalizeTr(text);
  return Object.entries(SYMBOLS).find(([, terms]) => terms.some((term) => normalized.includes(normalizeTr(term))))?.[0] || null;
}

function scoreNews(title, summary, symbol) {
  const text = normalizeTr(`${title} ${summary}`);
  let score = symbol ? 55 : 25;
  for (const word of ["kap", "bildirim", "finansal tablo", "bilanço", "kar", "zarar", "temettü", "ihale", "sözleşme", "pay alım"]) {
    if (text.includes(normalizeTr(word))) score += 8;
  }
  return Math.min(score, 100);
}

export async function getNewsFeed({ symbol, category, limit = 40 } = {}) {
  const fetched = await Promise.allSettled(FEEDS.map(async (feed) => parseRss(await fetchText(feed.url, { timeout: 8000 }), feed)));
  let news = fetched.flatMap((result) => (result.status === "fulfilled" ? result.value : []));

  if (symbol) news = news.filter((item) => item.symbol === symbol.toUpperCase() || normalizeTr(item.title).includes(normalizeTr(symbol)));
  if (category === "economy") {
    news = news.filter((item) => {
      const text = normalizeTr(`${item.source} ${item.category} ${item.title} ${item.summary}`);
      return ["ekonomi", "piyasa", "borsa", "dolar", "euro", "faiz", "enflasyon", "kap", "sirket", "bist"].some((term) =>
        text.includes(normalizeTr(term))
      );
    });
  }

  news.sort((a, b) => b.score - a.score || new Date(b.publishedAt) - new Date(a.publishedAt));
  return {
    news: news.slice(0, Number(limit)),
    updatedAt: new Date().toISOString(),
    sources: FEEDS.map((feed) => feed.source)
  };
}

export { SYMBOLS };
