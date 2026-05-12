type LatestNewsItem = {
  id: number;
  title: string;
  summary?: string;
  category?: string;
  date?: string;
  image?: string;
  source?: string;
  url?: string;
};

type NewsApiResponse = {
  news?: LatestNewsItem[];
};

const LATEST_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=450";

function normalizeLatestLabel(value = "") {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeLatestHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function upperLatestTR(value = "") {
  return String(value).toLocaleUpperCase("tr-TR");
}

function isLatestSeeAllClick(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;

  const control = target.closest("button, a");
  const label = normalizeLatestLabel(control?.textContent || "");
  if (label !== normalizeLatestLabel("Tümünü Gör") && label !== normalizeLatestLabel("See All")) {
    return false;
  }

  let parent = control?.parentElement || null;
  for (let depth = 0; parent && depth < 7; depth += 1) {
    const headingText = normalizeLatestLabel(parent.querySelector("h3")?.textContent || "");
    if (
      headingText.includes(normalizeLatestLabel("Son Gelişmeler")) ||
      headingText.includes(normalizeLatestLabel("Latest Updates"))
    ) {
      return true;
    }
    parent = parent.parentElement;
  }

  return false;
}

function installLatestStyles() {
  if (document.getElementById("sonarat-latest-see-all-style")) return;

  const style = document.createElement("style");
  style.id = "sonarat-latest-see-all-style";
  style.textContent = `
    .sonarat-category-view {
      min-height: calc(100vh - 65px);
      background: #f4f1eb !important;
      color: #0f172a !important;
      padding: 34px 16px 70px;
    }
    .sonarat-category-inner {
      max-width: 1280px;
      margin: 0 auto;
    }
    .sonarat-category-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 22px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.22);
      padding-bottom: 16px;
    }
    .sonarat-category-title {
      font-weight: 900;
      font-size: clamp(24px, 4vw, 42px);
      line-height: 0.95;
      letter-spacing: 0;
    }
    .sonarat-category-subtitle {
      color: #94a3b8 !important;
      font: italic 600 16px Georgia, serif;
      text-transform: lowercase;
    }
    .sonarat-category-count {
      color: #ef4444;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .sonarat-category-hero {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
      gap: 20px;
      margin-bottom: 28px;
    }
    .sonarat-hero-card,
    .sonarat-side-card,
    .sonarat-news-card {
      border: 1px solid rgba(226, 232, 240, 0.95) !important;
      background: rgba(255, 255, 255, 0.94) !important;
      color: #0f172a !important;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08) !important;
      overflow: hidden;
    }
    .sonarat-hero-card {
      position: relative;
      min-height: 360px;
      border-radius: 18px;
      cursor: pointer;
    }
    .sonarat-hero-card img,
    .sonarat-news-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      background: #e2e8f0;
    }
    .sonarat-hero-card img {
      position: absolute;
      inset: 0;
    }
    .sonarat-hero-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: end;
      gap: 14px;
      padding: 34px;
      background: linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.86));
      color: #fff !important;
    }
    .sonarat-source-row {
      display: flex;
      align-items: center;
      gap: 9px;
      color: #ef4444;
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .sonarat-dot {
      width: 4px;
      height: 4px;
      border-radius: 999px;
      background: #cbd5e1;
      display: inline-block;
    }
    .sonarat-hero-title {
      max-width: 850px;
      font-size: clamp(26px, 4vw, 52px);
      line-height: 0.98;
      font-weight: 950;
      letter-spacing: 0;
    }
    .sonarat-hero-link,
    .sonarat-card-link {
      align-self: start;
      border-radius: 999px;
      background: #fff !important;
      color: #0f172a !important;
      padding: 10px 18px;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .sonarat-side-list {
      display: grid;
      gap: 12px;
    }
    .sonarat-side-card {
      display: grid;
      grid-template-columns: 88px minmax(0, 1fr);
      gap: 12px;
      min-height: 92px;
      border-radius: 14px;
      cursor: pointer;
    }
    .sonarat-side-card img {
      width: 88px;
      height: 100%;
      object-fit: cover;
    }
    .sonarat-side-body {
      padding: 12px 12px 12px 0;
    }
    .sonarat-side-title,
    .sonarat-news-title {
      color: #0f172a !important;
      font-weight: 900;
      line-height: 1.12;
    }
    .sonarat-side-title {
      font-size: 12px;
    }
    .sonarat-news-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 18px;
    }
    .sonarat-news-card {
      border-radius: 16px;
      cursor: pointer;
      min-height: 250px;
      display: flex;
      flex-direction: column;
    }
    .sonarat-news-image {
      height: 132px;
      flex: 0 0 auto;
    }
    .sonarat-news-body {
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }
    .sonarat-news-title {
      font-size: 13px;
    }
    .sonarat-category-empty {
      padding: 70px 20px;
      text-align: center;
      color: #64748b !important;
      font-weight: 800;
      letter-spacing: 0.08em;
    }
    @media (max-width: 900px) {
      .sonarat-category-view { padding-top: 22px; }
      .sonarat-category-header { align-items: start; flex-direction: column; }
      .sonarat-category-hero { grid-template-columns: 1fr; }
      .sonarat-hero-card { min-height: 310px; border-radius: 16px; }
      .sonarat-hero-overlay { padding: 24px; }
      .sonarat-news-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    }
    @media (max-width: 560px) {
      .sonarat-news-grid { grid-template-columns: 1fr; }
      .sonarat-side-card { grid-template-columns: 78px minmax(0, 1fr); }
      .sonarat-side-card img { width: 78px; }
    }
  `;
  document.head.appendChild(style);
}

function ensureLatestShell() {
  installLatestStyles();

  let shell = document.getElementById("sonarat-category-view") as HTMLElement | null;
  if (!shell) {
    shell = document.createElement("div");
    shell.id = "sonarat-category-view";
    shell.className = "sonarat-category-view";
    shell.addEventListener("click", (event) => {
      const card = (event.target as Element | null)?.closest("[data-news-url]") as HTMLElement | null;
      const url = card?.dataset.newsUrl;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    });
    document.querySelector("nav")?.insertAdjacentElement("afterend", shell);
  }

  return shell;
}

function hideNativeMain() {
  const main = document.querySelector("main") as HTMLElement | null;
  if (main) main.style.display = "none";
}

function getLatestImage(item: LatestNewsItem) {
  return item.image || LATEST_FALLBACK_IMAGE;
}

function sourceRow(item: LatestNewsItem) {
  return `
    <div class="sonarat-source-row">
      <span>${escapeLatestHtml(item.source || "Haber")}</span>
      <span class="sonarat-dot"></span>
      <span>${escapeLatestHtml(item.date || "")}</span>
    </div>
  `;
}

function latestSideCard(item: LatestNewsItem) {
  return `
    <article class="sonarat-side-card" data-news-url="${escapeLatestHtml(item.url || "")}">
      <img src="${escapeLatestHtml(getLatestImage(item))}" alt="${escapeLatestHtml(item.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='${LATEST_FALLBACK_IMAGE}'" />
      <div class="sonarat-side-body">
        ${sourceRow(item)}
        <h3 class="sonarat-side-title">${escapeLatestHtml(upperLatestTR(item.title))}</h3>
      </div>
    </article>
  `;
}

function latestNewsCard(item: LatestNewsItem) {
  return `
    <article class="sonarat-news-card" data-news-url="${escapeLatestHtml(item.url || "")}">
      <div class="sonarat-news-image">
        <img src="${escapeLatestHtml(getLatestImage(item))}" alt="${escapeLatestHtml(item.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='${LATEST_FALLBACK_IMAGE}'" />
      </div>
      <div class="sonarat-news-body">
        ${sourceRow(item)}
        <h3 class="sonarat-news-title">${escapeLatestHtml(upperLatestTR(item.title))}</h3>
        <span class="sonarat-card-link">Haberi oku →</span>
      </div>
    </article>
  `;
}

function renderLatestLoading() {
  const shell = ensureLatestShell();
  hideNativeMain();
  shell.style.display = "block";
  shell.innerHTML = `
    <div class="sonarat-category-inner">
      <div class="sonarat-category-header">
        <h1 class="sonarat-category-title">SON GELİŞMELER <span class="sonarat-category-subtitle">haberleri</span></h1>
      </div>
      <div class="sonarat-category-empty">Yükleniyor...</div>
    </div>
  `;
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

function renderLatest(items: LatestNewsItem[]) {
  const shell = ensureLatestShell();
  const [hero, ...rest] = items;
  const side = rest.slice(0, 4);
  const grid = rest.slice(4, 40);

  if (!hero) {
    shell.innerHTML = `
      <div class="sonarat-category-inner">
        <div class="sonarat-category-header">
          <h1 class="sonarat-category-title">SON GELİŞMELER <span class="sonarat-category-subtitle">haberleri</span></h1>
        </div>
        <div class="sonarat-category-empty">Son gelişmeler yüklenemedi.</div>
      </div>
    `;
    return;
  }

  shell.innerHTML = `
    <div class="sonarat-category-inner">
      <div class="sonarat-category-header">
        <h1 class="sonarat-category-title">SON GELİŞMELER <span class="sonarat-category-subtitle">haberleri</span></h1>
        <div class="sonarat-category-count">${items.length} haber</div>
      </div>
      <section class="sonarat-category-hero">
        <article class="sonarat-hero-card" data-news-url="${escapeLatestHtml(hero.url || "")}">
          <img src="${escapeLatestHtml(getLatestImage(hero))}" alt="${escapeLatestHtml(hero.title)}" referrerpolicy="no-referrer" onerror="this.src='${LATEST_FALLBACK_IMAGE}'" />
          <div class="sonarat-hero-overlay">
            ${sourceRow(hero)}
            <h2 class="sonarat-hero-title">${escapeLatestHtml(upperLatestTR(hero.title))}</h2>
            <span class="sonarat-hero-link">Haberi oku →</span>
          </div>
        </article>
        <div class="sonarat-side-list">
          ${side.map(latestSideCard).join("")}
        </div>
      </section>
      <section class="sonarat-news-grid">
        ${grid.map(latestNewsCard).join("")}
      </section>
    </div>
  `;
}

async function showLatestUpdates() {
  renderLatestLoading();

  try {
    const response = await fetch(`/api/news?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as NewsApiResponse;
    renderLatest((data.news || []).slice(0, 45));
  } catch {
    renderLatest([]);
  }
}

function handleLatestSeeAllClick(event: MouseEvent) {
  if (!isLatestSeeAllClick(event.target)) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  void showLatestUpdates();
}

if (typeof window !== "undefined") {
  document.addEventListener("click", handleLatestSeeAllClick, true);
}
