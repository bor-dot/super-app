let logoMarkId = 0;

function normalizeLogoText(value = "") {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/\s+/g, "");
}

function modernMarkSvg(id: string, size: number) {
  return `
    <svg data-sonarat-modern-mark="true" width="${size}" height="${size}" viewBox="0 0 96 96" style="overflow: visible; flex: 0 0 auto;" aria-hidden="true">
      <defs>
        <linearGradient id="${id}-copper" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#9a300e" />
          <stop offset="50%" stop-color="#cd5521" />
          <stop offset="100%" stop-color="#e37b42" />
        </linearGradient>
        <linearGradient id="${id}-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fad0ae" />
          <stop offset="42%" stop-color="#ea5b11" />
          <stop offset="100%" stop-color="#7a1400" />
        </linearGradient>
        <filter id="${id}-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#000" flood-opacity="0.22" />
        </filter>
      </defs>
      <g transform="translate(6 8)">
        <circle cx="18" cy="58" r="6.5" fill="url(#${id}-copper)" />
        <path d="M 18 38 C 32 42 42 52 45 67" fill="none" stroke="url(#${id}-copper)" stroke-width="6.5" stroke-linecap="round" />
        <path d="M 15 18 C 45 22 66 42 73 72" fill="none" stroke="url(#${id}-copper)" stroke-width="6.5" stroke-linecap="round" />
        <polygon points="48,30 75,19 66,48" fill="url(#${id}-glass)" filter="url(#${id}-shadow)" stroke="rgba(255,255,255,0.45)" stroke-width="1.4" />
      </g>
    </svg>
  `;
}

function modernizeLogoContainer(container: HTMLElement, size: number) {
  const originalSvg = container.querySelector<SVGElement>("svg:not([data-sonarat-modern-mark])");
  if (!originalSvg) return;

  originalSvg.style.display = "none";

  if (!container.querySelector("[data-sonarat-modern-mark]")) {
    const wrapper = document.createElement("span");
    const id = `sonarat-modern-${logoMarkId++}`;
    wrapper.innerHTML = modernMarkSvg(id, size);
    originalSvg.insertAdjacentElement("beforebegin", wrapper.firstElementChild as Element);
  }

  const text = originalSvg.nextElementSibling as HTMLElement | null;
  if (text) {
    text.classList.remove("-ml-10", "-ml-9", "uppercase");
    text.style.marginLeft = "-0.25rem";
    text.style.textTransform = "none";
  }
}

function polishModernLogoMarks() {
  document.querySelectorAll<SVGElement>("nav svg, footer svg").forEach((svg) => {
    if (svg.matches("[data-sonarat-modern-mark]")) return;

    const container = svg.parentElement;
    if (!container || normalizeLogoText(container.textContent || "") !== "sonarat") return;

    modernizeLogoContainer(container, container.closest("footer") ? 44 : 52);
  });
}

if (typeof window !== "undefined") {
  window.setTimeout(polishModernLogoMarks, 0);

  const observer = new MutationObserver(() => polishModernLogoMarks());
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

export {};
