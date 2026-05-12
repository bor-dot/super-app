type CategoryNewsItem = {
  id: number;
  title: string;
  summary?: string;
  category: string;
  date?: string;
  image?: string;
  source?: string;
  url?: string;
};

type NewsApiResponse = {
  news?: CategoryNewsItem[];
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=450";

const HOME_LABELS = ["Gündem", "Timeline"];

const CATEGORY_LABELS: Record<string, string> = {
  Ekonomi: "Ekonomi",
  Economy: "Ekonomi",
  Teknoloji: "Teknoloji",
  Technology: "Teknoloji",
  Spor: "Spor",
  Sports: "Spor",
  Yaşam: "Yaşam",
  Lifestyle: "Yaşam",
  Bilim: "Bilim",
  Science: "Bilim",
  Dünya: "Dünya",
  World: "Dünya",
};

const CATEGORY_NAMES = Object.values(CATEGORY_LABELS).filter(
  (value, index, list) => list.indexOf(value) === index,
);

const normalizedCategoryLabels = new Map(
  Object.entries(CATEGORY_LABELS).map(([label, category]) => [
    normalizeLabel(label),
    category,
  ]),
);

function normalizeLabel(text: string) {
  return decodeEntities(text)
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/\s+/g, " ")
    .trim();
}

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

function escapeHtml(value = "") {
  return decodeEntities(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function upperTR(value = "") {
  return decodeEntities(value).toLocaleUpperCase("tr-TR");
}

function resolveCategoryFromControl(control: Element) {
  const label = normalizeLabel(control.textContent || "");

  if (HOME_LABELS.some((home) => normalizeLabel(home) === label)) return "home";

  const exactCategory = normalizedCategoryLabels.get(label);
  if (exactCategory) return exactCategory;

  const isSeeAll = label === normalizeLabel("Tümünü Gör") || label === normalizeLabel("See All");
  if (!isSeeAll) return null;

  let parent: Element | null = control.parentElement;
  for (let depth = 0; parent && depth < 6; depth += 1) {
    const heading = parent.querySelector("h3");
    const headingText = normalizeLabel(heading?.textContent || "");
    const category = CATEGORY_NAMES.find((name) =>
      headingText.startsWith(normalizeLabel(name)),
    );
    if (category) return category;
    parent = parent.parentElement;
  }

  return null;
}

function getCategoryAction(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;

  const control = target.closest("button, li");
  if (control) return resolveCategoryFromControl(control);

  const logo = target.closest("nav [class*='cursor-pointer']");
  if (logo && normalizeLabel(logo.textContent || "").includes("sonarat")) {
    return "home";
  }

  return null;
}

function getNativeMain() {
  return document.querySelector("main") as HTMLElement | null;
}

function ensureCategoryStyles() {
  if (document.getElementById("sonarat-category-style")) return;

  const style = document.createElement("style");
  style.id = "sonarat-category-style";
  style.textContent = `
    nav .sonarat-active-tab { color: #dc2626 !important; }
    nav .sonarat-muted-tab { color: #64748b !important; }
    .dark nav .sonarat-muted-tab { color: #94a3b8 !important; }
    nav .sonarat-active-marker {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 4px;
      background: #dc2626;
      pointer-events: none;
    }
    .sonarat-category-view {
      min-height: calc(100vh - 65px);
      background: #f4f1eb;
      color: #0f172a;
      padding: 34px 16px 70px;
    }
    .dark .sonarat-category-view {
      background: #020617;
      color: #f8fafc;
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
      color: #94a3b8;
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
      border: 1px solid rgba(226, 232, 240, 0.9);
      background: rgba(255,255,255,0.92);
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
      overflow: hidden;
    }
    .dark .sonarat-hero-card,
    .dark .sonarat-side-card,
    .dark .sonarat-news-card {
      background: rgba(15, 23, 42, 0.95);
      border-color: rgba(30, 41, 59, 0.95);
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
      color: #fff;
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
      background: #fff;
      color: #0f172a;
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
      color: #64748b;
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

function ensureCategoryShell() {
  ensureCategoryStyles();

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

function hideNativeActiveMarkers() {
  document.querySelectorAll("nav button > *").forEach((child) => {
    const element = child as HTMLElement;
    const className = String(element.className || "");
    if (className.includes("bottom-0") && className.includes("bg-red-600")) {
      element.style.display = "none";
    }
  });
}

function labelsForAction(action: string) {
  if (action === "home") return HOME_LABELS.map(normalizeLabel);

  return Object.entries(CATEGORY_LABELS)
    .filter(([, category]) => category === action)
    .map(([label]) => normalizeLabel(label));
}

function isNavigationLabel(label: string) {
  return (
    HOME_LABELS.some((home) => normalizeLabel(home) === label) ||
    normalizedCategoryLabels.has(label)
  );
}

function setActiveNavigation(action: string) {
  ensureCategoryStyles();
  hideNativeActiveMarkers();

  const activeLabels = labelsForAction(action);

  document.querySelectorAll("nav button, nav li").forEach((control) => {
    const element = control as HTMLElement;
    const label = normalizeLabel(element.textContent || "");
    if (!isNavigationLabel(label)) return;

    const isActive = activeLabels.includes(label);
    element.classList.toggle("sonarat-active-tab", isActive);
    element.classList.toggle("sonarat-muted-tab", !isActive);
    element.querySelectorAll(":scope > .sonarat-active-marker").forEach((marker) => marker.remove());

    const className = String(element.className || "");
    if (isActive && element.tagName === "BUTTON" && className.includes("h-[65px]")) {
      const marker = document.createElement("span");
      marker.className = "sonarat-active-marker";
      element.appendChild(marker);
    }
  });
}

function hideNativeMobileMenu() {
  document.querySelectorAll("nav div").forEach((element) => {
    const className = String((element as HTMLElement).className || "");
    if (className.includes("absolute") && className.includes("top-[65px]")) {
      (element as HTMLElement).style.display = "none";
    }
  });
}

function showNativeHome() {
  const shell = document.getElementById("sonarat-category-view");
  if (shell) shell.style.display = "none";

  const main = getNativeMain();
  if (main) main.style.display = "";

  setActiveNavigation("home");
  window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" }));
}

function getImage(item: CategoryNewsItem) {
  return item.image || FALLBACK_IMAGE;
}

function newsCard(item: CategoryNewsItem) {
  return `
    <article class="sonarat-news-card" data-news-url="${escapeHtml(item.url || "")}">
      <div class="sonarat-news-image">
        <img src="${escapeHtml(getImage(item))}" alt="${escapeHtml(item.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='${FALLBACK_IMAGE}'" />
      </div>
      <div class="sonarat-news-body">
        <div class="sonarat-source-row">
          <span>${escapeHtml(item.source || "Haber")}</span>
          <span class="sonarat-dot"></span>
          <span>${escapeHtml(item.date || "")}</span>
        </div>
        <h3 class="sonarat-news-title">${escapeHtml(upperTR(item.title))}</h3>
        <span class="sonarat-card-link">Haberi oku →</span>
      </div>
    </article>
  `;
}

function sideCard(item: CategoryNewsItem) {
  return `
    <article class="sonarat-side-card" data-news-url="${escapeHtml(item.url || "")}">
      <img src="${escapeHtml(getImage(item))}" alt="${escapeHtml(item.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='${FALLBACK_IMAGE}'" />
      <div class="sonarat-side-body">
        <div class="sonarat-source-row">
          <span>${escapeHtml(item.source || "Haber")}</span>
          <span class="sonarat-dot"></span>
          <span>${escapeHtml(item.date || "")}</span>
        </div>
        <h3 class="sonarat-side-title">${escapeHtml(upperTR(item.title))}</h3>
      </div>
    </article>
  `;
}

function renderLoading(category: string) {
  const shell = ensureCategoryShell();
  const main = getNativeMain();
  if (main) main.style.display = "none";
  shell.style.display = "block";
  shell.innerHTML = `
    <div class="sonarat-category-inner">
      <div class="sonarat-category-header">
        <h1 class="sonarat-category-title">${escapeHtml(upperTR(category))} <span class="sonarat-category-subtitle">haberleri</span></h1>
      </div>
      <div class="sonarat-category-empty">Yükleniyor...</div>
    </div>
  `;
  setActiveNavigation(category);
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

function renderCategory(category: string, items: CategoryNewsItem[]) {
  const shell = ensureCategoryShell();
  const [hero, ...rest] = items;
  const side = rest.slice(0, 4);
  const grid = rest.slice(4, 28);

  setActiveNavigation(category);

  if (!hero) {
    shell.innerHTML = `
      <div class="sonarat-category-inner">
        <div class="sonarat-category-header">
          <h1 class="sonarat-category-title">${escapeHtml(upperTR(category))} <span class="sonarat-category-subtitle">haberleri</span></h1>
        </div>
        <div class="sonarat-category-empty">Bu kategori için haber bulunamadı.</div>
      </div>
    `;
    return;
  }

  shell.innerHTML = `
    <div class="sonarat-category-inner">
      <div class="sonarat-category-header">
        <h1 class="sonarat-category-title">${escapeHtml(upperTR(category))} <span class="sonarat-category-subtitle">haberleri</span></h1>
        <div class="sonarat-category-count">${items.length} haber</div>
      </div>
      <section class="sonarat-category-hero">
        <article class="sonarat-hero-card" data-news-url="${escapeHtml(hero.url || "")}">
          <img src="${escapeHtml(getImage(hero))}" alt="${escapeHtml(hero.title)}" referrerpolicy="no-referrer" onerror="this.src='${FALLBACK_IMAGE}'" />
          <div class="sonarat-hero-overlay">
            <div class="sonarat-source-row">
              <span>${escapeHtml(hero.source || "Haber")}</span>
              <span class="sonarat-dot"></span>
              <span>${escapeHtml(hero.date || "")}</span>
            </div>
            <h2 class="sonarat-hero-title">${escapeHtml(upperTR(hero.title))}</h2>
            <span class="sonarat-hero-link">Haberi oku →</span>
          </div>
        </article>
        <div class="sonarat-side-list">
          ${side.map(sideCard).join("")}
        </div>
      </section>
      <section class="sonarat-news-grid">
        ${grid.map(newsCard).join("")}
      </section>
    </div>
  `;
}

async function showCategory(category: string) {
  hideNativeMobileMenu();
  renderLoading(category);

  try {
    const response = await fetch(`/api/news?category=${encodeURIComponent(category)}&ts=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = (await response.json()) as NewsApiResponse;
    const items = (data.news || []).filter((item) => item.category === category);
    renderCategory(category, items);
  } catch {
    renderCategory(category, []);
  }
}

function handleCategoryClick(event: MouseEvent) {
  const action = getCategoryAction(event.target);
  if (!action) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  if (action === "home") {
    showNativeHome();
    return;
  }

  void showCategory(action);
}

if (typeof window !== "undefined") {
  window.history.scrollRestoration = "manual";
  document.addEventListener("click", handleCategoryClick, true);
}
