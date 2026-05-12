import { getNewsFeed } from "./news";

const universe = [
  { symbol: "THYAO", name: "Türk Hava Yolları", sector: "Havacılık", last: 292.5, change: 1.84, fk: 4.8, pdDd: 0.92, volumeRatio: 1.7, discount: 38, momentum: 72 },
  { symbol: "TUPRS", name: "Tüpraş", sector: "Enerji", last: 168.2, change: 0.96, fk: 6.1, pdDd: 1.08, volumeRatio: 1.42, discount: 31, momentum: 64 },
  { symbol: "SAHOL", name: "Sabancı", sector: "Yatırım", last: 93.65, change: 1.22, fk: 5.4, pdDd: 0.76, volumeRatio: 1.35, discount: 44, momentum: 59 },
  { symbol: "KCHOL", name: "Koç", sector: "Yatırım", last: 182.4, change: 0.74, fk: 7.2, pdDd: 1.0, volumeRatio: 1.18, discount: 35, momentum: 56 },
  { symbol: "ISCTR", name: "İş Bankası C", sector: "Banka", last: 12.84, change: 2.1, fk: 4.2, pdDd: 0.82, volumeRatio: 1.92, discount: 28, momentum: 76 },
  { symbol: "EREGL", name: "Ereğli Demir Çelik", sector: "Sanayi", last: 47.18, change: -0.34, fk: 9.7, pdDd: 0.95, volumeRatio: 1.11, discount: 24, momentum: 43 },
  { symbol: "ASELS", name: "Aselsan", sector: "Savunma", last: 72.85, change: 1.56, fk: 18.6, pdDd: 2.18, volumeRatio: 2.24, discount: 12, momentum: 81 },
  { symbol: "AKSEN", name: "Aksa Enerji", sector: "Enerji", last: 41.62, change: 0.62, fk: 7.9, pdDd: 1.2, volumeRatio: 1.51, discount: 27, momentum: 61 },
  { symbol: "ENJSA", name: "Enerjisa", sector: "Enerji", last: 67.1, change: 0.44, fk: 8.4, pdDd: 1.18, volumeRatio: 1.06, discount: 22, momentum: 52 },
  { symbol: "SISE", name: "Şişecam", sector: "Sanayi", last: 49.76, change: -0.18, fk: 8.8, pdDd: 0.88, volumeRatio: 1.28, discount: 26, momentum: 48 }
];

export const screenerCriteria = [
  { label: "Değerleme", value: "F/K < 12 ve PD/DD < 1.50" },
  { label: "İskonto", value: "Model iskontosu %20 üzeri" },
  { label: "Akış", value: "KAP/haber etkisi pozitif veya nötr" },
  { label: "Likidite", value: "Hacim ortalamanın 1.10x üzeri" },
  { label: "Risk", value: "Kritik alarmda tek başına alım sinyali üretmez" }
];

function countNewsHits(news, symbol) {
  return news.filter((item) => {
    const text = `${item.tag || ""} ${item.title || ""} ${item.summary || ""}`.toUpperCase();
    return text.includes(symbol);
  }).length;
}

function scoreStock(stock, newsHits) {
  const valuation = stock.fk < 8 ? 18 : stock.fk < 12 ? 10 : -6;
  const book = stock.pdDd < 1 ? 16 : stock.pdDd < 1.5 ? 9 : -5;
  const flow = stock.volumeRatio > 1.5 ? 12 : stock.volumeRatio > 1.1 ? 6 : 0;
  const news = Math.min(newsHits * 7, 14);
  return Math.round(stock.discount + stock.momentum * 0.25 + valuation + book + flow + news);
}

export async function runScreener({ mode = "market", limit = 10 } = {}) {
  const { news } = await getNewsFeed({ limit: 50 });
  const discountOnly = mode === "discount";

  const rows = universe
    .map((stock) => {
      const newsHits = countNewsHits(news, stock.symbol);
      return {
        ...stock,
        newsHits,
        score: scoreStock(stock, newsHits),
        signal:
          stock.discount >= 30 && stock.fk < 8 && stock.pdDd < 1.2
            ? "Ucuz"
            : stock.volumeRatio > 1.5 && stock.momentum > 70
              ? "Akış Güçlü"
              : "İzle"
      };
    })
    .filter((stock) => !discountOnly || (stock.discount >= 20 && stock.fk < 12 && stock.pdDd < 1.5))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    updatedAt: new Date().toISOString(),
    mode,
    criteria: screenerCriteria,
    rows
  };
}
