if (typeof window !== "undefined") {
  localStorage.setItem("lang", "TR");
}

function upperTR(value = "") {
  return value.toLocaleUpperCase("tr-TR");
}

function normalizeTR(value = "") {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/\s+/g, " ")
    .trim();
}

function setText(element: HTMLElement, value: string) {
  if (element.textContent !== value) element.textContent = value;
}

function installMobileLayoutStyles() {
  if (document.getElementById("sonarat-mobile-layout-fix")) return;

  const style = document.createElement("style");
  style.id = "sonarat-mobile-layout-fix";
  style.textContent = `
    html, body, #root {
      max-width: 100%;
      overflow-x: hidden;
    }

    @media (max-width: 760px) {
      nav .sonarat-language-wrap,
      nav button.sonarat-language-toggle {
        display: none !important;
      }

      nav > div {
        padding-left: 14px !important;
        padding-right: 14px !important;
      }

      nav div[class*="absolute"][class*="top-"] {
        left: 12px !important;
        right: 12px !important;
        border-radius: 16px !important;
      }

      main {
        width: 100%;
        max-width: 100vw;
        overflow-x: hidden;
      }

      main section,
      footer {
        padding-left: 18px !important;
        padding-right: 18px !important;
      }

      [id^="scroll-"] {
        margin-left: 0 !important;
        margin-right: 0 !important;
        padding-left: 0 !important;
        padding-right: 8px !important;
        scroll-padding-left: 0 !important;
        max-width: calc(100vw - 36px) !important;
      }

      [id^="scroll-"] > * {
        min-width: min(82vw, 320px) !important;
      }

      button[class*="-ml-5"],
      button[class*="-mr-5"] {
        display: none !important;
      }

      .sonarat-category-view {
        padding-left: 20px !important;
        padding-right: 20px !important;
        overflow-x: hidden !important;
      }

      .sonarat-category-inner {
        width: 100% !important;
        max-width: calc(100vw - 40px) !important;
      }

      .sonarat-category-header,
      .sonarat-category-hero,
      .sonarat-news-grid,
      .sonarat-side-list {
        width: 100% !important;
        max-width: 100% !important;
      }

      .sonarat-hero-card,
      .sonarat-news-card,
      .sonarat-side-card {
        max-width: 100% !important;
      }

      .sonarat-hero-overlay {
        padding: 20px !important;
      }

      .sonarat-category-title {
        font-size: clamp(24px, 12vw, 38px) !important;
        line-height: 1 !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function removeEnglishControls() {
  localStorage.setItem("lang", "TR");
  document.documentElement.lang = "tr";

  document.querySelectorAll<HTMLElement>("button").forEach((button) => {
    const label = normalizeTR(button.textContent || "");
    if (label !== "english" && label !== "turkce") return;

    button.classList.add("sonarat-language-toggle");
    button.style.display = "none";

    const wrapper = button.closest<HTMLElement>("div");
    if (wrapper) {
      wrapper.classList.add("sonarat-language-wrap");
      wrapper.style.display = "none";
    }
  });
}

function polishCategoryText() {
  document.documentElement.lang = "tr";
  installMobileLayoutStyles();
  removeEnglishControls();

  document
    .querySelectorAll<HTMLElement>(".sonarat-source-row")
    .forEach((row) => {
      if (row.style.textTransform !== "none") row.style.textTransform = "none";
    });

  document
    .querySelectorAll<HTMLElement>(".sonarat-source-row span:first-child")
    .forEach((source) => {
      const text = source.textContent?.trim();
      if (text) setText(source, upperTR(text));
    });

  document
    .querySelectorAll<HTMLElement>(".sonarat-card-link, .sonarat-hero-link")
    .forEach((link) => {
      if (link.style.textTransform !== "none") link.style.textTransform = "none";
      setText(link, "HABERİ OKU →");
    });

  document.querySelectorAll<HTMLElement>(".sonarat-category-count").forEach((count) => {
    if (count.style.textTransform !== "none") count.style.textTransform = "none";
    setText(count, upperTR(count.textContent || ""));
  });
}

if (typeof window !== "undefined") {
  polishCategoryText();

  const observer = new MutationObserver(() => polishCategoryText());
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
