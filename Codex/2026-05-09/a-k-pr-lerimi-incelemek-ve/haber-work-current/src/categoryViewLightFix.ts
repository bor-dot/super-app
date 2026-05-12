function installCategoryViewThemeFix() {
  const existing = document.getElementById("sonarat-category-light-fix");
  if (existing) existing.remove();

  const style = document.createElement("style");
  style.id = "sonarat-category-light-fix";
  style.textContent = `
    .sonarat-category-view,
    .sonarat-latest-view {
      background: #f4f1eb !important;
      color: #0f172a !important;
    }

    html.dark .sonarat-category-view,
    html.dark .sonarat-latest-view {
      background: #020617 !important;
      color: #f8fafc !important;
    }

    .sonarat-hero-card,
    .sonarat-side-card,
    .sonarat-news-card,
    .sonarat-latest-hero-card,
    .sonarat-latest-side-card,
    .sonarat-latest-news-card {
      background: rgba(255, 255, 255, 0.94) !important;
      border-color: rgba(226, 232, 240, 0.95) !important;
      color: #0f172a !important;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08) !important;
    }

    html.dark .sonarat-hero-card,
    html.dark .sonarat-side-card,
    html.dark .sonarat-news-card,
    html.dark .sonarat-latest-hero-card,
    html.dark .sonarat-latest-side-card,
    html.dark .sonarat-latest-news-card {
      background: rgba(15, 23, 42, 0.95) !important;
      border-color: rgba(30, 41, 59, 0.95) !important;
      color: #f8fafc !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25) !important;
    }

    .sonarat-category-subtitle,
    .sonarat-category-empty,
    .sonarat-latest-title span,
    .sonarat-latest-empty {
      color: #64748b !important;
    }

    html.dark .sonarat-category-subtitle,
    html.dark .sonarat-category-empty,
    html.dark .sonarat-latest-title span,
    html.dark .sonarat-latest-empty {
      color: #94a3b8 !important;
    }

    .sonarat-hero-overlay,
    .sonarat-latest-overlay {
      color: #fff !important;
    }

    .sonarat-card-link,
    .sonarat-hero-link,
    .sonarat-latest-link {
      background: #fff !important;
      color: #0f172a !important;
    }

    html.dark .sonarat-card-link,
    html.dark .sonarat-hero-link,
    html.dark .sonarat-latest-link {
      background: #f8fafc !important;
      color: #0f172a !important;
    }

    .sonarat-side-title,
    .sonarat-news-title,
    .sonarat-latest-side-title,
    .sonarat-latest-news-title,
    .sonarat-latest-title {
      color: #0f172a !important;
    }

    html.dark .sonarat-side-title,
    html.dark .sonarat-news-title,
    html.dark .sonarat-latest-side-title,
    html.dark .sonarat-latest-news-title,
    html.dark .sonarat-latest-title {
      color: #f8fafc !important;
    }
  `;
  document.head.appendChild(style);
}

if (typeof window !== "undefined") {
  installCategoryViewThemeFix();

  const observer = new MutationObserver(() => {
    if (!document.getElementById("sonarat-category-light-fix")) installCategoryViewThemeFix();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
