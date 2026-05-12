type DetailNewsItem = {
  title: string;
  summary?: string;
  source?: string;
  url?: string;
};

type NewsResponse = {
  news?: DetailNewsItem[];
};

let newsCache: Promise<DetailNewsItem[]> | null = null;
const articleSummaryCache = new Map<string, Promise<string>>();
let activeTitleKey = "";

function decodeNumericEntity(match: string, value: string, radix: number) {
  const codePoint = Number.parseInt(value, radix);
  if (!Number.isFinite(codePoint)) return match;

  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return match;
  }
}

function decodeEntities(value = "") {
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

function normalizeForMatch(value = "") {
  return decodeEntities(value)
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim();
}

function cleanSummary(value = "", title = "") {
  const clean = decodeEntities(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (normalizeForMatch(clean) === normalizeForMatch(title)) return "";
  if (clean.length <= 560) return clean;

  const slice = clean.slice(0, 560);
  const lastSentence = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  return `${slice.slice(0, lastSentence > 180 ? lastSentence + 1 : 530).trim()}...`;
}

function escapeHtml(value = "") {
  return decodeEntities(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getNewsList() {
  if (!newsCache) {
    newsCache = fetch(`/api/news?detail=${Date.now()}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { news: [] }))
      .then((data: NewsResponse) => data.news || [])
      .catch(() => []);
  }

  return newsCache;
}

function findDetailElements() {
  const note = [...document.querySelectorAll<HTMLElement>("p")].find((element) =>
    normalizeForMatch(element.textContent || "").includes("haberin tamamini okumak icin kaynaga gidin"),
  );
  if (!note) return null;

  const detailRoot = note.closest(".fixed") as HTMLElement | null;
  const title = detailRoot?.querySelector("h1")?.textContent?.trim() || "";
  const box = note.closest("div") as HTMLElement | null;

  if (!detailRoot || !title || !box) return null;

  return { box, note, title };
}

function matchNewsItem(title: string, items: DetailNewsItem[]) {
  const normalizedTitle = normalizeForMatch(title);

  return (
    items.find((item) => normalizeForMatch(item.title) === normalizedTitle) ||
    items.find((item) => normalizedTitle.includes(normalizeForMatch(item.title)) || normalizeForMatch(item.title).includes(normalizedTitle)) ||
    null
  );
}

function getArticleSummary(url: string, title: string) {
  if (!url) return Promise.resolve("");

  if (!articleSummaryCache.has(url)) {
    articleSummaryCache.set(
      url,
      fetch(`/api/article-summary?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, {
        cache: "no-store",
      })
        .then((response) => (response.ok ? response.json() : { summary: "" }))
        .then((data: { summary?: string }) => data.summary || "")
        .catch(() => ""),
    );
  }

  return articleSummaryCache.get(url)!;
}

function fallbackSummary(item: DetailNewsItem | null, title: string) {
  if (item?.source) {
    return `${item.source} tarafından aktarılan bu haber, “${decodeEntities(title)}” başlığıyla öne çıkan gelişmenin temel ayrıntılarını özetliyor. Haberin tamamı ve tüm bağlamı kaynak bağlantısında yer alıyor.`;
  }

  return `Bu haber, “${decodeEntities(title)}” başlığıyla öne çıkan gelişmenin temel ayrıntılarını özetliyor. Haberin tamamı ve tüm bağlamı kaynak bağlantısında yer alıyor.`;
}

function ensureStyles() {
  if (document.getElementById("sonarat-detail-summary-style")) return;

  const style = document.createElement("style");
  style.id = "sonarat-detail-summary-style";
  style.textContent = `
    .sonarat-detail-summary {
      width: 100%;
      text-align: left;
      border-radius: 18px;
      border: 1px solid rgba(226, 232, 240, 0.9);
      background: #ffffff;
      padding: 20px 22px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
    }
    .dark .sonarat-detail-summary {
      background: rgba(15, 23, 42, 0.65);
      border-color: rgba(30, 41, 59, 0.95);
    }
    .sonarat-detail-summary-label {
      color: #dc2626;
      font-size: 10px;
      font-weight: 950;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      margin-bottom: 9px;
    }
    .sonarat-detail-summary-text {
      color: #334155;
      font-size: 16px;
      line-height: 1.72;
      font-weight: 650;
      margin: 0;
    }
    .dark .sonarat-detail-summary-text {
      color: #cbd5e1;
    }
    .sonarat-detail-source-note {
      width: 100%;
      text-align: center;
    }
  `;
  document.head.appendChild(style);
}

function renderSummary(box: HTMLElement, note: HTMLElement, summary: string, title: string) {
  ensureStyles();

  box.style.alignItems = "stretch";
  box.style.textAlign = "left";
  note.classList.add("sonarat-detail-source-note");

  let summaryNode = box.querySelector<HTMLElement>(".sonarat-detail-summary");
  if (!summaryNode) {
    summaryNode = document.createElement("div");
    summaryNode.className = "sonarat-detail-summary";
    box.insertBefore(summaryNode, note);
  }

  summaryNode.dataset.title = normalizeForMatch(title);
  summaryNode.innerHTML = `
    <div class="sonarat-detail-summary-label">Kısa Özet</div>
    <p class="sonarat-detail-summary-text">${escapeHtml(summary)}</p>
  `;
}

async function hydrateDetailSummary() {
  const detail = findDetailElements();
  if (!detail) return;

  const titleKey = normalizeForMatch(detail.title);
  const existing = detail.box.querySelector<HTMLElement>(".sonarat-detail-summary");
  if (existing?.dataset.title === titleKey && activeTitleKey === titleKey) return;
  activeTitleKey = titleKey;

  const items = await getNewsList();
  const item = matchNewsItem(detail.title, items);
  const rssSummary = cleanSummary(item?.summary || "", detail.title);
  const articleSummary = cleanSummary(await getArticleSummary(item?.url || "", detail.title), detail.title);
  const summary = articleSummary || rssSummary || fallbackSummary(item, detail.title);

  renderSummary(detail.box, detail.note, summary, detail.title);
}

if (typeof window !== "undefined") {
  hydrateDetailSummary();

  const observer = new MutationObserver(() => {
    window.setTimeout(hydrateDetailSummary, 50);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
