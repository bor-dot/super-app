const MOBILE_CATEGORIES = ["Gündem", "Ekonomi", "Teknoloji", "Spor", "Yaşam", "Bilim", "Dünya"];

let mobileCategoryFrame = 0;
let lastActiveMobileCategory = "";

function normalizeMobileCategory(value = "") {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/\s+/g, " ")
    .trim();
}

function installMobileCategoryStyles() {
  if (document.getElementById("sonarat-mobile-category-style")) return;

  const style = document.createElement("style");
  style.id = "sonarat-mobile-category-style";
  style.textContent = `
    .sonarat-mobile-category-strip {
      display: none;
    }

    @media (max-width: 1023px) {
      .sonarat-mobile-category-strip {
        display: block;
        position: sticky;
        top: 65px;
        z-index: 45;
        width: 100%;
        background: rgba(244, 241, 235, 0.96);
        border-bottom: 1px solid rgba(226, 232, 240, 0.9);
        backdrop-filter: blur(14px);
      }

      html.dark .sonarat-mobile-category-strip {
        background: rgba(2, 6, 23, 0.96);
        border-bottom-color: rgba(30, 41, 59, 0.95);
      }

      .sonarat-mobile-category-scroll {
        display: flex;
        align-items: center;
        gap: 18px;
        min-height: 48px;
        max-width: 100vw;
        overflow-x: auto;
        overflow-y: hidden;
        padding: 0 18px;
        scroll-padding-left: 18px;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }

      .sonarat-mobile-category-scroll::-webkit-scrollbar {
        display: none;
      }

      .sonarat-mobile-category-button {
        position: relative;
        flex: 0 0 auto;
        height: 48px;
        color: #64748b;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        white-space: nowrap;
      }

      html.dark .sonarat-mobile-category-button {
        color: #94a3b8;
      }

      .sonarat-mobile-category-button.is-active {
        color: #dc2626;
      }

      .sonarat-mobile-category-button.is-active::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 3px;
        border-radius: 999px 999px 0 0;
        background: #dc2626;
      }
    }
  `;
  document.head.appendChild(style);
}

function currentMobileCategory() {
  const params = new URLSearchParams(window.location.search);
  const rawCategory = params.get("kategori");
  if (!rawCategory) return "gundem";

  const normalized = normalizeMobileCategory(rawCategory);
  const match = MOBILE_CATEGORIES.find((category) => normalizeMobileCategory(category) === normalized);
  return normalizeMobileCategory(match || "Gündem");
}

function syncMobileCategoryActive() {
  const active = currentMobileCategory();
  document.querySelectorAll<HTMLButtonElement>(".sonarat-mobile-category-button").forEach((button) => {
    const isActive = normalizeMobileCategory(button.textContent || "") === active;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
    if (isActive && active !== lastActiveMobileCategory) {
      button.scrollIntoView({ block: "nearest", inline: "center" });
    }
  });
  lastActiveMobileCategory = active;
}

function ensureMobileCategoryStrip() {
  installMobileCategoryStyles();

  const nav = document.querySelector("nav");
  if (!nav) return;

  let strip = document.getElementById("sonarat-mobile-category-strip");
  if (!strip) {
    strip = document.createElement("div");
    strip.id = "sonarat-mobile-category-strip";
    strip.className = "sonarat-mobile-category-strip";
    strip.innerHTML = `
      <div class="sonarat-mobile-category-scroll" aria-label="Kategoriler">
        ${MOBILE_CATEGORIES.map(
          (category) => `<button type="button" class="sonarat-mobile-category-button">${category}</button>`,
        ).join("")}
      </div>
    `;
    nav.insertAdjacentElement("afterend", strip);
    strip.addEventListener("click", () => {
      window.setTimeout(syncMobileCategoryActive, 60);
    });
  }

  if (strip.previousElementSibling !== nav) {
    nav.insertAdjacentElement("afterend", strip);
  }

  syncMobileCategoryActive();
}

function scheduleMobileCategoryStrip() {
  if (mobileCategoryFrame) return;
  mobileCategoryFrame = window.requestAnimationFrame(() => {
    mobileCategoryFrame = 0;
    ensureMobileCategoryStrip();
  });
}

if (typeof window !== "undefined") {
  ensureMobileCategoryStrip();

  window.addEventListener("popstate", () => window.setTimeout(syncMobileCategoryActive, 60));
  window.addEventListener("pushstate", () => window.setTimeout(syncMobileCategoryActive, 60));
  window.addEventListener("replacestate", () => window.setTimeout(syncMobileCategoryActive, 60));

  const observer = new MutationObserver(scheduleMobileCategoryStrip);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

export {};
