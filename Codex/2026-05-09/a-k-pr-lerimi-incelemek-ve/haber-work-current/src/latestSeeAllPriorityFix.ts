type PriorityLatestItem = {
  id: number;
  title: string;
  summary?: string;
  category?: string;
  date?: string;
  image?: string;
  source?: string;
  url?: string;
};

const PRIORITY_LATEST_FALLBACK =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=450";

function normalizePriorityText(value = "") {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[→›»]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePriorityHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function upperPriorityTR(value = "") {
  return String(value).toLocaleUpperCase("tr-TR");
}

function isPriorityLatestSeeAll(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;

  const control = target.closest("button, a");
  if (!control) return false;

  const label = normalizePriorityText(control.textContent || "");
  const isSeeAll =
    label.startsWith(normalizePriorityText("Tümünü Gör")) ||
    label.startsWith(normalizePriorityText("See All"));
  if (!isSeeAll) return false;

  let parent = control.parentElement;
  for (let depth = 0; parent && depth < 8; depth += 1) {
    const heading = normalizePriorityText(parent.querySelector("h3")?.textContent || "");
    if (
      heading.includes(normalizePriorityText("Son Gelişmeler")) ||
      heading.includes(normalizePriorityText("Latest Updates"))
    ) {
      return true;
    }
    parent = parent.parentElement;
  }

  return false;
}

function ensurePriorityLatestStyles() {
  if (document.getElementById("sonarat-priority-latest-style")) return;

  const style = document.createElement("style");
  style.id = "sonarat-priority-latest-style";
  style.textContent = `
    .sonarat-latest-view {
      min-height: calc(100vh - 65px);
      background: #f4f1eb !important;
      color: #0f172a !important;
      padding: 34px 16px 70px;
    }
    .sonarat-latest-inner {
      max-width: 1280px;
      margin: 0 auto;
    }
    .sonarat-latest-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 22px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.22);
      padding-bottom: 16px;
    }
    .sonarat-latest-title {
      font-weight: 900;
      font-size: clamp(24px, 4vw, 42px);
      line-height: 0.95;
      letter-spacing: 0;
    }
    .sonarat-latest-title span {
      color: #94a3b8;
      font: italic 600 16px Georgia, serif;
      text-transform: lowercase;
    }
    .sonarat-latest-count {
      color: #ef4444;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .sonarat-latest-hero {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
      gap: 20px;
      margin-bottom: 28px;
    }
    .sonarat-latest-hero-card,
    .sonarat-latest-side-card,
    .sonarat-latest-news-card {
      border: 1px solid rgba(226, 232, 240, 0.95);
      background: rgba(255, 255, 255, 0.94);
      color: #0f172a;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
      overflow: hidden;
      cursor: pointer;
    }
    .sonarat-latest-hero-card {
      position: relative;
      min-height: 360px;
      border-radius: 18px;
    }
    .sonarat-latest-hero-card img,
    .sonarat-latest-news-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      background: #e2e8f0;
    }
    .sonarat-latest-hero-card img {
      position: absolute;
      inset: 0;
    }
    .sonarat-latest-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: end;
      gap: 14px;
      padding: 34px;
      background: linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.86));
      color: #fff;
    }
    .sonarat-latest-source-row {
      display: flex;
      align-items: center;
      gap: 9px;
      color: #ef4444;
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .sonarat-latest-dot {
      width: 4px;
      height: 4px;
      border-radius: 999px;
      background: #cbd5e1;
      display: inline-block;
    }
    .sonarat-latest-hero-title {
      max-width: 850px;
      font-size: clamp(26px, 4vw, 52px);
      line-height: 0.98;
      font-weight: 950;
      letter-spacing: 0;
    }
    .sonarat-latest-link {
      align-self: start;
      border-radius: 999px;
      background: #fff;
      color: #0f172a;
      padding: 10px 18px;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .sonarat-latest-side-list {
      display: grid;
      gap: 12px;
    }
    .sonarat-latest-side-card {
      display: grid;
      grid-template-columns: 88px minmax(0, 1fr);
      gap: 12px;
      min-height: 92px;
      border-radius: 14px;
    }
    .sonarat-latest-side-card img {
      width: 88px;
      height: 100%;
      object-fit: cover;
    }
    .sonarat-latest-side-body {
      padding: 12px 12px 12px 0;
    }
    .sonarat-latest-side-title,
    .sonarat-latest-news-title {
      color: #0f172a;
      font-weight: 900;
      line-height: 1.12;
    }
    .sonarat-latest-side-title {
      font-size: 12px;
    }
    .sonarat-latest-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 18px;
    }
    .sonarat-latest-news-card {
      border-radius: 16px;
      min-height: 250px;
      display: flex;
      flex-direction: column;
    }
    .sonarat-latest-news-image {
      height: 132px;
      flex: 0 0 auto;
    }
    .sonarat-latest-news-body {
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }
    .sonarat-latest-news-title {
      font-size: 13px;
    }
    .sonarat-latest-empty {
      padding: 70px 20px;
      text-align: center;
      color: #64748b;
      font-weight: 800;
      letter-spacing: 0.08em;
    }
    @media (max-width: 900px) {
      .sonarat-latest-view { padding-top: 22px; }
      .sonarat-latest-header { align-items: start; flex-direction: column; }
      .sonarat-latest-hero { grid-template-columns: 1fr; }
      .sonarat-latest-hero-card { min-height: 310px; border-radius: 16px; }
      .sonarat-latest-overlay { padding: 24px; }
      .sonarat-latest-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    }
    @media (max-width: 560px) {
      .sonarat-latest-grid { grid-template-columns: 1fr; }
      .sonarat-latest-side-card { grid-template-columns: 78px minmax(0, 1fr); }
      .sonarat-latest-side-card img { width: 78px; }
    }
  `;
  document.head.appendChild(style);
}

function ensurePriorityLatestShell() {
  ensurePriorityLatestStyles();

  let shell = document.getElementById("sonarat-priority-latest-view") as HTMLElement | null;
  if (!shell) {
    shell = document.createElement("div");
    shell.id = "sonarat-priority-latest-view";
    shell.className = "sonarat-latest-view";
    shell.addEventListener("click", (event) => {
      const card = (event.target as Element | null)?.closest("[data-news-url]") as HTMLElement | null;
      const url = card?.dataset.newsUrl;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    });
    document.querySelector("nav")?.insertAdjacentElement("afterend", shell);
  }

  return shell;
}

function hidePriorityNativeViews() {
  const main = document.querySelector("main") as HTMLElement | null;
  if (main) main.style.display = "none";

  const categoryShell = document.getElementById("sonarat-category-view") as HTMLElement | null;
  if (categoryShell) categoryShell.style.display = "none";
}

function getPriorityImage(item: PriorityLatestItem) {
  return item.image || PRIORITY_LATEST_FALLBACK;
}

function sourcePriorityRow(item: PriorityLatestItem) {
  return `
    <div class="sonarat-latest-source-row">
      <span>${escapePriorityHtml(item.source || "Haber")}</span>
      <span class="sonarat-latest-dot"></span>
      <span>${escapePriorityHtml(item.date || "")}</span>
    </div>
  `;
}

function prioritySideCard(item: PriorityLatestItem) {
  return `
    <article class="sonarat-latest-side-card" data-news-url="${escapePriorityHtml(item.url || "")}">
      <img src="${escapePriorityHtml(getPriorityImage(item))}" alt="${escapePriorityHtml(item.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='${PRIORITY_LATEST_FALLBACK}'" />
      <div class="sonarat-latest-side-body">
        ${sourcePriorityRow(item)}
        <h3 class="sonarat-latest-side-title">${escapePriorityHtml(upperPriorityTR(item.title))}</h3>
      </div>
    </article>
  `;
}

function priorityNewsCard(item: PriorityLatestItem) {
  return `
    <article class="sonarat-latest-news-card" data-news-url="${escapePriorityHtml(item.url || "")}">
      <div class="sonarat-latest-news-image">
        <img src="${escapePriorityHtml(getPriorityImage(item))}" alt="${escapePriorityHtml(item.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='${PRIORITY_LATEST_FALLBACK}'" />
      </div>
      <div class="sonarat-latest-news-body">
        ${sourcePriorityRow(item)}
        <h3 class="sonarat-latest-news-title">${escapePriorityHtml(upperPriorityTR(item.title))}</h3>
        <span class="sonarat-latest-link">Haberi oku →</span>
      </div>
    </article>
  `;
}

function renderPriorityLatestLoading() {
  const shell = ensurePriorityLatestShell();
  hidePriorityNativeViews();
  shell.style.display = "block";
  shell.innerHTML = `
    <div class="sonarat-latest-inner">
      <div class="sonarat-latest-header">
        <h1 class="sonarat-latest-title">SON GELİŞMELER <span>haberleri</span></h1>
      </div>
      <div class="sonarat-latest-empty">Yükleniyor...</div>
    </div>
  `;
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

function renderPriorityLatest(items: PriorityLatestItem[]) {
  const shell = ensurePriorityLatestShell();
  const [hero, ...rest] = items;
  const side = rest.slice(0, 4);
  const grid = rest.slice(4, 40);

  if (!hero) {
    shell.innerHTML = `
      <div class="sonarat-latest-inner">
        <div class="sonarat-latest-header">
          <h1 class="sonarat-latest-title">SON GELİŞMELER <span>haberleri</span></h1>
        </div>
        <div class="sonarat-latest-empty">Son gelişmeler yüklenemedi.</div>
      </div>
    `;
    return;
  }

  shell.innerHTML = `
    <div class="sonarat-latest-inner">
      <div class="sonarat-latest-header">
        <h1 class="sonarat-latest-title">SON GELİŞMELER <span>haberleri</span></h1>
        <div class="sonarat-latest-count">${items.length} haber</div>
      </div>
      <section class="sonarat-latest-hero">
        <article class="sonarat-latest-hero-card" data-news-url="${escapePriorityHtml(hero.url || "")}">
          <img src="${escapePriorityHtml(getPriorityImage(hero))}" alt="${escapePriorityHtml(hero.title)}" referrerpolicy="no-referrer" onerror="this.src='${PRIORITY_LATEST_FALLBACK}'" />
          <div class="sonarat-latest-overlay">
            ${sourcePriorityRow(hero)}
            <h2 class="sonarat-latest-hero-title">${escapePriorityHtml(upperPriorityTR(hero.title))}</h2>
            <span class="sonarat-latest-link">Haberi oku →</span>
          </div>
        </article>
        <div class="sonarat-latest-side-list">
          ${side.map(prioritySideCard).join("")}
        </div>
      </section>
      <section class="sonarat-latest-grid">
        ${grid.map(priorityNewsCard).join("")}
      </section>
    </div>
  `;
}

async function showPriorityLatestUpdates() {
  renderPriorityLatestLoading();

  try {
    const response = await fetch(`/api/news?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as { news?: PriorityLatestItem[] };
    renderPriorityLatest((data.news || []).slice(0, 45));
  } catch {
    renderPriorityLatest([]);
  }
}

function handlePriorityLatestClick(event: MouseEvent) {
  if (!isPriorityLatestSeeAll(event.target)) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  void showPriorityLatestUpdates();
}

if (typeof window !== "undefined") {
  document.addEventListener("click", handlePriorityLatestClick, true);
}
