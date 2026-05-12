const LOGO_ARCH_PATH = "M 8 65 Q 150 -50 420 50";

function normalizePath(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function hideLogoArch() {
  document.querySelectorAll<SVGPathElement>("svg path").forEach((path) => {
    if (normalizePath(path.getAttribute("d") || "") !== LOGO_ARCH_PATH) return;

    path.style.display = "none";
    path.setAttribute("aria-hidden", "true");
  });
}

if (typeof window !== "undefined") {
  hideLogoArch();

  const observer = new MutationObserver(() => hideLogoArch());
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
