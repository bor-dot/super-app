type WeatherPayload = {
  location?: string;
  temperature?: number;
  apparentTemperature?: number;
  condition?: string;
  updatedAt?: string;
};

type MarketQuote = {
  key: string;
  label: string;
  symbol: string;
  value: number | null;
  changePercent: number | null;
  currency: string;
  unavailable?: boolean;
};

type MarketsPayload = {
  quotes?: MarketQuote[];
  updatedAt?: string;
};

const WIDGET_REFRESH_MS = 60000;

let latestWeather: WeatherPayload | null = null;
let latestMarkets: MarketsPayload | null = null;
let widgetFrame = 0;

function normalizeWidgetText(value = "") {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/\s+/g, " ")
    .trim();
}

function installLiveWidgetStyles() {
  if (document.getElementById("sonarat-live-widgets-style")) return;

  const style = document.createElement("style");
  style.id = "sonarat-live-widgets-style";
  style.textContent = `
    .sonarat-weather-widget {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 28px;
      padding: 0 10px;
      border-radius: 999px;
      background: rgba(241, 245, 249, 0.9);
      border: 1px solid rgba(226, 232, 240, 0.95);
      color: #475569;
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    html.dark .sonarat-weather-widget {
      background: rgba(15, 23, 42, 0.85);
      border-color: rgba(30, 41, 59, 0.95);
      color: #cbd5e1;
    }
    .sonarat-weather-widget strong {
      color: #dc2626;
      font-size: 11px;
      letter-spacing: 0;
    }
    .sonarat-market-strip {
      display: grid;
      grid-template-columns: repeat(4, minmax(96px, 1fr));
      gap: 10px;
      flex: 1;
      max-width: 650px;
      margin-left: auto;
    }
    .sonarat-market-card {
      min-width: 0;
      border-radius: 14px;
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(226, 232, 240, 0.9);
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.07);
    }
    html.dark .sonarat-market-card {
      background: rgba(15, 23, 42, 0.86);
      border-color: rgba(30, 41, 59, 0.95);
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18);
    }
    .sonarat-market-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      color: #94a3b8;
      font-size: 8px;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .sonarat-market-value {
      display: block;
      margin-top: 4px;
      color: #0f172a;
      font-size: 15px;
      font-weight: 950;
      letter-spacing: 0;
      line-height: 1;
    }
    html.dark .sonarat-market-value {
      color: #f8fafc;
    }
    .sonarat-market-change {
      margin-top: 5px;
      color: #64748b;
      font-size: 8px;
      font-weight: 900;
      letter-spacing: 0.08em;
    }
    .sonarat-market-change.is-up { color: #16a34a; }
    .sonarat-market-change.is-down { color: #dc2626; }
    @media (max-width: 900px) {
      .sonarat-weather-widget span:last-child { display: none; }
      .sonarat-market-strip {
        width: 100%;
        max-width: none;
        margin-left: 0;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (max-width: 520px) {
      .sonarat-weather-widget { padding: 0 8px; }
      .sonarat-market-strip { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);
}

function findBellIcon() {
  const rightRail = [...document.querySelectorAll<HTMLElement>("nav [class*='border-r']")].find((element) =>
    element.querySelector("svg"),
  );
  if (!rightRail) return null;

  const icons = [...rightRail.querySelectorAll<SVGElement>("svg")].filter((svg) => !svg.closest("button"));
  return icons.at(-1) || null;
}

function ensureWeatherWidget() {
  installLiveWidgetStyles();

  let widget = document.getElementById("sonarat-weather-widget") as HTMLElement | null;
  if (!widget) {
    const bell = findBellIcon();
    if (!bell) return null;

    widget = document.createElement("span");
    widget.id = "sonarat-weather-widget";
    widget.className = "sonarat-weather-widget";
    widget.innerHTML = "<strong>--°</strong><span>İstanbul</span>";
    bell.insertAdjacentElement("afterend", widget);
  }

  return widget;
}

function renderWeatherWidget() {
  const widget = ensureWeatherWidget();
  if (!widget) return;

  if (!latestWeather || !Number.isFinite(latestWeather.temperature)) {
    widget.innerHTML = "<strong>--°</strong><span>İstanbul</span>";
    return;
  }

  widget.innerHTML = `
    <strong>${Math.round(latestWeather.temperature as number)}°C</strong>
    <span>${latestWeather.location || "İstanbul"}</span>
    <span>${latestWeather.condition || "Canlı"}</span>
  `;
}

function formatMarketValue(quote: MarketQuote) {
  if (!Number.isFinite(quote.value as number)) return "--";

  if (quote.currency === "TRY") {
    const maximumFractionDigits = (quote.value || 0) > 100000 ? 0 : 2;
    return (quote.value as number).toLocaleString("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits,
    });
  }

  return (quote.value as number).toLocaleString("tr-TR", {
    maximumFractionDigits: 2,
  });
}

function marketCard(quote: MarketQuote) {
  const change = Number.isFinite(quote.changePercent as number) ? (quote.changePercent as number) : null;
  const changeClass = change === null ? "" : change >= 0 ? "is-up" : "is-down";
  const changeText = change === null ? "Canlı" : `${change >= 0 ? "+" : ""}${change.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}%`;

  return `
    <article class="sonarat-market-card">
      <div class="sonarat-market-label">
        <span>${quote.label}</span>
        <span>${quote.symbol}</span>
      </div>
      <strong class="sonarat-market-value">${formatMarketValue(quote)}</strong>
      <div class="sonarat-market-change ${changeClass}">${changeText}</div>
    </article>
  `;
}

function renderMarketStrip(strip: HTMLElement) {
  const quotes = latestMarkets?.quotes || [];
  if (quotes.length === 0) {
    strip.innerHTML = ["Dolar", "Euro", "BIST100", "Bitcoin"]
      .map((label) => marketCard({ key: label, label, symbol: "Canlı", value: null, changePercent: null, currency: "TRY" }))
      .join("");
    return;
  }

  strip.innerHTML = quotes.map(marketCard).join("");
}

function ensureEconomyMarketStrip() {
  installLiveWidgetStyles();

  const shell = document.getElementById("sonarat-category-view") as HTMLElement | null;
  if (!shell || shell.style.display === "none") return;

  const title = shell.querySelector(".sonarat-category-title");
  const isEconomy = normalizeWidgetText(title?.textContent || "").startsWith("ekonomi");
  const existing = shell.querySelector("#sonarat-market-strip");
  if (!isEconomy) {
    existing?.remove();
    return;
  }

  const header = shell.querySelector(".sonarat-category-header") as HTMLElement | null;
  if (!header) return;

  let strip = existing as HTMLElement | null;
  if (!strip) {
    strip = document.createElement("div");
    strip.id = "sonarat-market-strip";
    strip.className = "sonarat-market-strip";
    const count = header.querySelector(".sonarat-category-count");
    header.insertBefore(strip, count || null);
  }

  renderMarketStrip(strip);
}

function scheduleWidgetRender() {
  if (widgetFrame) return;
  widgetFrame = window.requestAnimationFrame(() => {
    widgetFrame = 0;
    renderWeatherWidget();
    ensureEconomyMarketStrip();
  });
}

async function refreshWeather() {
  try {
    const response = await fetch(`/api/weather?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    latestWeather = (await response.json()) as WeatherPayload;
  } catch {
    latestWeather = null;
  } finally {
    scheduleWidgetRender();
  }
}

async function refreshMarkets() {
  try {
    const response = await fetch(`/api/markets?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    latestMarkets = (await response.json()) as MarketsPayload;
  } catch {
    latestMarkets = null;
  } finally {
    scheduleWidgetRender();
  }
}

if (typeof window !== "undefined") {
  installLiveWidgetStyles();
  scheduleWidgetRender();
  void refreshWeather();
  void refreshMarkets();

  window.setInterval(() => {
    void refreshWeather();
    void refreshMarkets();
  }, WIDGET_REFRESH_MS);

  window.addEventListener("focus", () => {
    void refreshWeather();
    void refreshMarkets();
  });

  const observer = new MutationObserver(scheduleWidgetRender);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

export {};
