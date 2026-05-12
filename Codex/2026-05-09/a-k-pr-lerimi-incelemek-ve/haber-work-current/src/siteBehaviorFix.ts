type SiteRoute =
  | { view: "home" }
  | { view: "category"; category: string }
  | { view: "latest" };

type SiteNewsItem = {
  id: number;
  title: string;
  summary?: string;
  category?: string;
  date?: string;
  image?: string;
  source?: string;
  url?: string;
};

const SITE_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=450";

const SITE_CATEGORY_LABELS: Record<string, string> = {
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

const SITE_CATEGORY_SLUGS: Record<string, string> = {
  Ekonomi: "ekonomi",
  Teknoloji: "teknoloji",
  Spor: "spor",
  Yaşam: "yasam",
  Bilim: "bilim",
  Dünya: "dunya",
};

let isApplyingSiteRoute = false;

function normalizeSiteText(value = "") {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[→›»]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeSiteHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function upperSiteTR(value = "") {
  return String(value).toLocaleUpperCase("tr-TR");
}

function compactLogoText(value = "") {
  return normalizeSiteText(value).replace(/\s+/g, "");
}

function setTextNodesLowercaseLogo(element: HTMLElement) {
  element.style.textTransform = "none";
  element.classList.remove("uppercase");

  element.querySelectorAll<HTMLElement>("*").forEach((child) => {
    child.style.textTransform = "none";
    child.classList.remove("uppercase");
  });

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const raw = node.textContent || "";
    const trimmed = raw.trim();
    if (trimmed === "SON") node.textContent = raw.replace("SON", "son");
    if (trimmed === "ARAT") node.textContent = raw.replace("ARAT", "arat");
    node = walker.nextNode();
  }
}

function polishLogoText() {
  document.querySelectorAll<HTMLElement>("nav div, nav span, footer div, footer span").forEach((element) => {
    if (compactLogoText(element.textContent || "") === "sonarat") {
      setTextNodesLowercaseLogo(element);
    }
  });
}

function isLogoTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  const logo = target.closest<HTMLElement>("nav [class*='cursor-pointer']");
  return Boolean(logo && compactLogoText(logo.textContent || "") === "sonarat");
}

function categoryFromLabel(label: string) {
  const normalized = normalizeSiteText(label);

  if (normalized === normalizeSiteText("Gündem") || normalized === normalizeSiteText("Timeline")) {
    return "home";
  }

  for (const [rawLabel, category] of Object.entries(SITE_CATEGORY_LABELS)) {
    if (normalized === normalizeSiteText(rawLabel)) return category;
  }

  return null;
}

function isSeeAllLabel(label: string) {
  const normalized = normalizeSiteText(label);
  return (
    normalized.startsWith(normalizeSiteText("Tümünü Gör")) ||
    normalized.startsWith(normalizeSiteText("See All"))
  );
}

function routeFromCategorySeeAll(control: Element) {
  let parent = control.parentElement;
  for (let depth = 0; parent && depth < 8; depth += 1) {
    const headingText = normalizeSiteText(parent.querySelector("h3")?.textContent || "");

    if (
      headingText.includes(normalizeSiteText("Son Gelişmeler")) ||
      headingText.includes(normalizeSiteText("Latest Updates"))
    ) {
      return { view: "latest" } as SiteRoute;
    }

    for (const category of Object.values(SITE_CATEGORY_LABELS)) {
      if (headingText.startsWith(normalizeSiteText(category))) {
        return { view: "category", category } as SiteRoute;
      }
    }

    parent = parent.parentElement;
  }

  return null;
}

function routeFromClickTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;

  if (isLogoTarget(target)) return { route: { view: "home" } as SiteRoute, exclusive: true };

  const control = target.closest("button, a, li");
  if (!control) return null;

  const label = control.textContent || "";
  if (isSeeAllLabel(label)) {
    const route = routeFromCategorySeeAll(control);
    if (route) return { route, exclusive: route.view === "latest" };
  }

  const category = categoryFromLabel(label);
  if (category === "home") return { route: { view: "home" } as SiteRoute, exclusive: false };
  if (category) return { route: { view: "category", category } as SiteRoute, exclusive: false };

  return null;
}

function routeToUrl(route: SiteRoute) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";

  if (route.view === "category") {
    url.searchParams.set("kategori", SITE_CATEGORY_SLUGS[route.category] || route.category.toLocaleLowerCase("tr-TR"));
  }

  if (route.view === "latest") {
    url.searchParams.set("liste", "son-gelismeler");
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

function routeFromUrl(): SiteRoute {
  const url = new URL(window.location.href);
  const latest = url.searchParams.get("liste");
  if (latest === "son-gelismeler") return { view: "latest" };

  const categorySlug = url.searchParams.get("kategori");
  if (categorySlug) {
    const normalizedSlug = normalizeSiteText(categorySlug);
    const category = Object.entries(SITE_CATEGORY_SLUGS).find(([, slug]) => slug === normalizedSlug)?.[0];
    if (category) return { view: "category", category };
  }

  return { view: "home" };
}

function sameRoute(a: SiteRoute, b: SiteRoute) {
  return a.view === b.view && (a.view !== "category" || b.view !== "category" || a.category === b.category);
}

function pushSiteRoute(route: SiteRoute) {
  const current = window.history.state?.sonaratRoute as SiteRoute | undefined;
  if (current && sameRoute(current, route)) return;
  window.history.pushState({ sonaratRoute: route }, "", routeToUrl(route));
}

function replaceInitialRoute() {
  const route = routeFromUrl();
  window.history.replaceState({ sonaratRoute: route }, "", routeToUrl(route));
}

function hideCustomShells() {
  document.querySelectorAll<HTMLElement>(
    "#sonarat-category-view, #sonarat-priority-latest-view, #sonarat-site-latest-view"
  ).forEach((shell) => {
    shell.style.display = "none";
  });
}

function showNativeMain() {
  hideCustomShells();
  const main = document.querySelector("main") as HTMLElement | null;
  if (main) main.style.display = "";
}

function setNavHomeActive() {
  document.querySelectorAll<HTMLElement>("nav button, nav li").forEach((control) => {
    const route = categoryFromLabel(control.textContent || "");
    const isHome = route === "home";
    control.classList.toggle("sonarat-active-tab", isHome);
    control.classList.toggle("sonarat-muted-tab", !isHome && Boolean(route));
    control.querySelectorAll(":scope > .sonarat-active-marker").forEach((marker) => marker.remove());
  });
}

function showHomeRoute(push = false) {
  if (push) pushSiteRoute({ view: "home" });
  showNativeMain();
  setNavHomeActive();
  window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" }));
}

function findControlForCategory(category: string) {
  return [...document.querySelectorAll<HTMLElement>("nav button, nav li")].find((control) => {
    const route = categoryFromLabel(control.textContent || "");
    return route === category;
  });
}

function findLatestSeeAllControl() {
  return [...document.querySelectorAll<HTMLElement>("button, a")].find((control) => {
    if (!isSeeAllLabel(control.textContent || "")) return false;
    return routeFromCategorySeeAll(control)?.view === "latest";
  });
}

function installSiteLatestStyles() {
  if (document.getElementById("sonarat-site-latest-style")) return;

  const style = document.createElement("style");
  style.id = "sonarat-site-latest-style";
  style.textContent = `
    .sonarat-site-latest-view {
      min-height: calc(100vh - 65px);
      background: #f4f1eb;
      color: #0f172a;
      padding: 34px 16px 70px;
    }
    html.dark .sonarat-site-latest-view {
      background: #020617;
      color: #f8fafc;
    }
    .sonarat-site-latest-inner {
      max-width: 1280px;
      margin: 0 auto;
    }
    .sonarat-site-latest-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 22px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.22);
      padding-bottom: 16px;
    }
    .sonarat-site-latest-title {
      font-weight: 900;
      font-size: clamp(24px, 4vw, 42px);
      line-height: 0.95;
      letter-spacing: 0;
    }
    .sonarat-site-latest-title span {
      color: #64748b;
      font: italic 600 16px Georgia, serif;
      text-transform: lowercase;
    }
    html.dark .sonarat-site-latest-title span {
      color: #94a3b8;
    }
    .sonarat-site-latest-count {
      color: #ef4444;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .sonarat-site-latest-hero {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
      gap: 20px;
      margin-bottom: 28px;
    }
    .sonarat-site-latest-hero-card,
    .sonarat-site-latest-side-card,
    .sonarat-site-latest-news-card {
      border: 1px solid rgba(226, 232, 240, 0.95);
      background: rgba(255, 255, 255, 0.94);
      color: #0f172a;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
      overflow: hidden;
      cursor: pointer;
    }
    html.dark .sonarat-site-latest-hero-card,
    html.dark .sonarat-site-latest-side-card,
    html.dark .sonarat-site-latest-news-card {
      background: rgba(15, 23, 42, 0.95);
      border-color: rgba(30, 41, 59, 0.95);
      color: #f8fafc;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    }
    .sonarat-site-latest-hero-card {
      position: relative;
      min-height: 360px;
      border-radius: 18px;
    }
    .sonarat-site-latest-hero-card img,
    .sonarat-site-latest-news-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      background: #e2e8f0;
    }
    .sonarat-site-latest-hero-card img {
      position: absolute;
      inset: 0;
    }
    .sonarat-site-latest-overlay {
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
    .sonarat-site-source-row {
      display: flex;
      align-items: center;
      gap: 9px;
      color: #ef4444;
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .sonarat-site-dot {
      width: 4px;
      height: 4px;
      border-radius: 999px;
      background: #cbd5e1;
      display: inline-block;
    }
    .sonarat-site-latest-hero-title {
      max-width: 850px;
      font-size: clamp(26px, 4vw, 52px);
      line-height: 0.98;
      font-weight: 950;
      letter-spacing: 0;
    }
    .sonarat-site-latest-link {
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
    html.dark .sonarat-site-latest-link {
      background: #f8fafc;
      color: #0f172a;
    }
    .sonarat-site-latest-side-list {
      display: grid;
      gap: 12px;
    }
    .sonarat-site-latest-side-card {
      display: grid;
      grid-template-columns: 88px minmax(0, 1fr);
      gap: 12px;
      min-height: 92px;
      border-radius: 14px;
    }
    .sonarat-site-latest-side-card img {
      width: 88px;
      height: 100%;
      object-fit: cover;
    }
    .sonarat-site-latest-side-body {
      padding: 12px 12px 12px 0;
    }
    .sonarat-site-latest-side-title,
    .sonarat-site-latest-news-title {
      font-weight: 900;
      line-height: 1.12;
      color: #0f172a;
    }
    html.dark .sonarat-site-latest-side-title,
    html.dark .sonarat-site-latest-news-title {
      color: #f8fafc;
    }
    .sonarat-site-latest-side-title {
      font-size: 12px;
    }
    .sonarat-site-latest-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 18px;
    }
    .sonarat-site-latest-news-card {
      border-radius: 16px;
      min-height: 250px;
      display: flex;
      flex-direction: column;
    }
    .sonarat-site-latest-news-image {
      height: 132px;
      flex: 0 0 auto;
    }
    .sonarat-site-latest-news-body {
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }
    .sonarat-site-latest-news-title {
      font-size: 13px;
    }
    .sonarat-site-latest-empty {
      padding: 70px 20px;
      text-align: center;
      color: #64748b;
      font-weight: 800;
      letter-spacing: 0.08em;
    }
    html.dark .sonarat-site-latest-empty {
      color: #94a3b8;
    }
    @media (max-width: 900px) {
      .sonarat-site-latest-view { padding-top: 22px; }
      .sonarat-site-latest-header { align-items: start; flex-direction: column; }
      .sonarat-site-latest-hero { grid-template-columns: 1fr; }
      .sonarat-site-latest-hero-card { min-height: 310px; border-radius: 16px; }
      .sonarat-site-latest-overlay { padding: 24px; }
      .sonarat-site-latest-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    }
    @media (max-width: 560px) {
      .sonarat-site-latest-grid { grid-template-columns: 1fr; }
      .sonarat-site-latest-side-card { grid-template-columns: 78px minmax(0, 1fr); }
      .sonarat-site-latest-side-card img { width: 78px; }
    }
  `;
  document.head.appendChild(style);
}

function ensureSiteLatestShell() {
  installSiteLatestStyles();
  let shell = document.getElementById("sonarat-site-latest-view") as HTMLElement | null;
  if (!shell) {
    shell = document.createElement("div");
    shell.id = "sonarat-site-latest-view";
    shell.className = "sonarat-site-latest-view";
    shell.addEventListener("click", (event) => {
      const card = (event.target as Element | null)?.closest("[data-news-url]") as HTMLElement | null;
      const url = card?.dataset.newsUrl;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    });
    document.querySelector("nav")?.insertAdjacentElement("afterend", shell);
  }
  return shell;
}

function siteSourceRow(item: SiteNewsItem) {
  return `
    <div class="sonarat-site-source-row">
      <span>${escapeSiteHtml(item.source || "Haber")}</span>
      <span class="sonarat-site-dot"></span>
      <span>${escapeSiteHtml(item.date || "")}</span>
    </div>
  `;
}

function siteImage(item: SiteNewsItem) {
  return item.image || SITE_FALLBACK_IMAGE;
}

function siteSideCard(item: SiteNewsItem) {
  return `
    <article class="sonarat-site-latest-side-card" data-news-url="${escapeSiteHtml(item.url || "")}">
      <img src="${escapeSiteHtml(siteImage(item))}" alt="${escapeSiteHtml(item.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='${SITE_FALLBACK_IMAGE}'" />
      <div class="sonarat-site-latest-side-body">
        ${siteSourceRow(item)}
        <h3 class="sonarat-site-latest-side-title">${escapeSiteHtml(upperSiteTR(item.title))}</h3>
      </div>
    </article>
  `;
}

function siteNewsCard(item: SiteNewsItem) {
  return `
    <article class="sonarat-site-latest-news-card" data-news-url="${escapeSiteHtml(item.url || "")}">
      <div class="sonarat-site-latest-news-image">
        <img src="${escapeSiteHtml(siteImage(item))}" alt="${escapeSiteHtml(item.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='${SITE_FALLBACK_IMAGE}'" />
      </div>
      <div class="sonarat-site-latest-news-body">
        ${siteSourceRow(item)}
        <h3 class="sonarat-site-latest-news-title">${escapeSiteHtml(upperSiteTR(item.title))}</h3>
        <span class="sonarat-site-latest-link">Haberi oku →</span>
      </div>
    </article>
  `;
}

function renderSiteLatestLoading() {
  const shell = ensureSiteLatestShell();
  hideCustomShells();
  const main = document.querySelector("main") as HTMLElement | null;
  if (main) main.style.display = "none";
  shell.style.display = "block";
  shell.innerHTML = `
    <div class="sonarat-site-latest-inner">
      <div class="sonarat-site-latest-header">
        <h1 class="sonarat-site-latest-title">SON GELİŞMELER <span>haberleri</span></h1>
      </div>
      <div class="sonarat-site-latest-empty">Yükleniyor...</div>
    </div>
  `;
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

function renderSiteLatest(items: SiteNewsItem[]) {
  const shell = ensureSiteLatestShell();
  const [hero, ...rest] = items;
  const side = rest.slice(0, 4);
  const grid = rest.slice(4, 40);

  if (!hero) {
    shell.innerHTML = `
      <div class="sonarat-site-latest-inner">
        <div class="sonarat-site-latest-header">
          <h1 class="sonarat-site-latest-title">SON GELİŞMELER <span>haberleri</span></h1>
        </div>
        <div class="sonarat-site-latest-empty">Son gelişmeler yüklenemedi.</div>
      </div>
    `;
    return;
  }

  shell.innerHTML = `
    <div class="sonarat-site-latest-inner">
      <div class="sonarat-site-latest-header">
        <h1 class="sonarat-site-latest-title">SON GELİŞMELER <span>haberleri</span></h1>
        <div class="sonarat-site-latest-count">${items.length} haber</div>
      </div>
      <section class="sonarat-site-latest-hero">
        <article class="sonarat-site-latest-hero-card" data-news-url="${escapeSiteHtml(hero.url || "")}">
          <img src="${escapeSiteHtml(siteImage(hero))}" alt="${escapeSiteHtml(hero.title)}" referrerpolicy="no-referrer" onerror="this.src='${SITE_FALLBACK_IMAGE}'" />
          <div class="sonarat-site-latest-overlay">
            ${siteSourceRow(hero)}
            <h2 class="sonarat-site-latest-hero-title">${escapeSiteHtml(upperSiteTR(hero.title))}</h2>
            <span class="sonarat-site-latest-link">Haberi oku →</span>
          </div>
        </article>
        <div class="sonarat-site-latest-side-list">
          ${side.map(siteSideCard).join("")}
        </div>
      </section>
      <section class="sonarat-site-latest-grid">
        ${grid.map(siteNewsCard).join("")}
      </section>
    </div>
  `;
}

async function showLatestRoute(push = false) {
  if (push) pushSiteRoute({ view: "latest" });
  renderSiteLatestLoading();
  try {
    const response = await fetch(`/api/news?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as { news?: SiteNewsItem[] };
    renderSiteLatest((data.news || []).slice(0, 45));
  } catch {
    renderSiteLatest([]);
  }
}

function applySiteRoute(route: SiteRoute) {
  isApplyingSiteRoute = true;

  if (route.view === "home") {
    showHomeRoute(false);
    window.setTimeout(() => {
      isApplyingSiteRoute = false;
    }, 0);
    return;
  }

  if (route.view === "latest") {
    void showLatestRoute(false).finally(() => {
      isApplyingSiteRoute = false;
    });
    return;
  }

  hideCustomShells();
  const control = findControlForCategory(route.category);
  if (control) {
    control.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }

  window.setTimeout(() => {
    isApplyingSiteRoute = false;
  }, 0);
}

function handleSiteClick(event: MouseEvent) {
  if (isApplyingSiteRoute) return;

  const targetRoute = routeFromClickTarget(event.target);
  if (!targetRoute) return;

  const { route, exclusive } = targetRoute;

  if (route.view === "home") {
    pushSiteRoute(route);
    hideCustomShells();
    if (exclusive) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      showHomeRoute(false);
    }
    return;
  }

  if (route.view === "latest") {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    void showLatestRoute(true);
    return;
  }

  pushSiteRoute(route);
  hideCustomShells();
}

function handlePopState(event: PopStateEvent) {
  const route = (event.state?.sonaratRoute as SiteRoute | undefined) || routeFromUrl();
  applySiteRoute(route);
}

if (typeof window !== "undefined") {
  replaceInitialRoute();
  polishLogoText();

  document.addEventListener("click", handleSiteClick, true);
  window.addEventListener("popstate", handlePopState);

  const observer = new MutationObserver(() => polishLogoText());
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  window.setTimeout(() => {
    const route = routeFromUrl();
    if (route.view !== "home") applySiteRoute(route);
  }, 400);
}

export {};
