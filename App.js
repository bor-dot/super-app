import { useEffect, useMemo, useState } from "react";
import CustomChart from "./components/CustomChart";
import Icon from "./components/Icon";
import { BIST_SYMBOLS } from "./data/bistSymbols";

const fallbackEconomyNews = [
  {
    id: "fallback-1",
    source: "Sonarat Ekonomi",
    category: "Ekonomi",
    title: "Piyasada günün ana başlığı faiz, banka hacmi ve kur dengesi oldu.",
    summary: "BIST tarafında banka ve havacılık hisselerinde haber etkisi yüksek kalırken kur cephesinde sakin seyir izleniyor.",
    publishedAt: new Date().toISOString(),
    score: 72
  },
  {
    id: "fallback-2",
    source: "Sonarat Piyasa",
    category: "Piyasa",
    title: "BIST100 için kritik seviyeler ve hacimli hisseler takip ediliyor.",
    summary: "Seçili hisse grafiği canlı veriyle yenilenirken ATR ve RSI katmanları aynı motor üzerinde izleniyor.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    score: 64
  },
  {
    id: "fallback-3",
    source: "Sonarat Makro",
    category: "Ekonomi",
    title: "Enflasyon beklentileri, kur ve banka çarpanları piyasanın odağında.",
    summary: "Tahvil faizi, banka çarpanları ve döviz sepetindeki hareketler aynı panelde izleniyor.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    score: 58
  }
];

const fallbackMarketTicks = [
  { symbol: "BIST100", value: "14.598,47", change: "-1,23%", up: false },
  { symbol: "USD/TRY", value: "32,45", change: "-0,12%", up: false },
  { symbol: "EUR/TRY", value: "34,82", change: "+0,05%", up: true },
  { symbol: "BTC/TRY", value: "2.082.420", change: "+2,10%", up: true },
  { symbol: "XAU/TRY", value: "2.341,50", change: "0,00%", neutral: true }
];

const communityPosts = [
  ["#THYAO Analiz", "Hacim artışı ile RSI bölgesi birlikte izleniyor.", "3 saat önce"],
  ["#BankaEndeksi", "Ucuz çarpanlı banka hisselerinde haber etkisi öne çıktı.", "1 saat önce"],
  ["#BorsaSohbet", "ATR yükselen hisselerde stop mesafesi yeniden hesaplanmalı.", "20 dk önce"]
];

export default function App() {
  const [economyNews, setEconomyNews] = useState(fallbackEconomyNews);
  const [selectedSymbol, setSelectedSymbol] = useState("BIST100");
  const [symbols, setSymbols] = useState(BIST_SYMBOLS);
  const [symbolsLive, setSymbolsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEconomyNews() {
      try {
        const response = await fetch("/api/news?category=economy&limit=8");
        const data = await response.json();
        if (!cancelled && Array.isArray(data.news) && data.news.length) {
          setEconomyNews(data.news);
        }
      } catch {
        if (!cancelled) setEconomyNews(fallbackEconomyNews);
      }
    }

    loadEconomyNews();
    const timer = window.setInterval(loadEconomyNews, 45000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSymbols() {
      try {
        const response = await fetch("/api/symbols");
        const data = await response.json();
        if (!cancelled && Array.isArray(data.symbols) && data.symbols.length) {
          setSymbols(data.symbols);
          setSymbolsLive(Boolean(data.isLive));
        }
      } catch {
        if (!cancelled) {
          setSymbols(BIST_SYMBOLS);
          setSymbolsLive(false);
        }
      }
    }

    loadSymbols();
  }, []);

  const selectedMeta = useMemo(
    () => symbols.find((item) => item.symbol === selectedSymbol) || BIST_SYMBOLS[0],
    [selectedSymbol, symbols]
  );
  const aiSummary = useMemo(() => economyNews.slice(0, 3), [economyNews]);

  return (
    <main className="min-h-screen w-full bg-[#060b0c] text-[#f2f2f0]">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[300px_92px_minmax(0,1fr)_320px]">
        <BrandEconomyRail news={economyNews} />
        <TerminalNav />

        <section className="min-w-0 border-r border-white/10 bg-[#071011]">
          <MarketStrip />
          <div className="space-y-4 p-4">
            <TerminalHeader selectedMeta={selectedMeta} />
            <ChartPanel
              selectedSymbol={selectedSymbol}
              setSelectedSymbol={setSelectedSymbol}
              symbols={symbols}
              symbolsLive={symbolsLive}
            />
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
              <IndicatorStack selectedSymbol={selectedSymbol} />
              <AnalysisTable selectedSymbol={selectedSymbol} />
            </div>
          </div>
        </section>

        <SmartFeed news={aiSummary} />
      </div>
    </main>
  );
}

function BrandEconomyRail({ news }) {
  return (
    <aside className="flex min-h-[520px] flex-col border-r border-white/10 bg-[#081011] p-6">
      <div className="flex flex-1 flex-col justify-center">
        <LogoMark size="large" />
        <div className="mt-8 border-t border-white/10 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-ticker text-[10px] uppercase tracking-wider text-[#ff8b4a]">Canlı ekonomi</span>
            <span className="flex items-center gap-1 font-ticker text-[10px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              live
            </span>
          </div>
          <div className="space-y-2">
            {news.slice(0, 5).map((item) => (
              <a
                key={item.id || item.title}
                href={item.url || "#"}
                target={item.url ? "_blank" : undefined}
                rel={item.url ? "noreferrer" : undefined}
                className="block rounded-lg border border-white/10 bg-white/[0.035] p-3 transition hover:border-emerald-300/40 hover:bg-emerald-300/[0.08]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-ticker text-[10px] uppercase text-white/50">{item.source}</span>
                  <span className="font-ticker text-[10px] text-white/40">{relativeTime(item.publishedAt)}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-white">{item.title}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function TerminalNav() {
  const items = [
    ["article", "Haberler"],
    ["terminal", "Terminal"],
    ["groups", "Topluluk"],
    ["work", "Portföy"]
  ];

  return (
    <nav className="hidden border-r border-white/10 bg-[#0c1416] p-3 lg:flex lg:flex-col">
      <LogoMark />
      <div className="mt-16 flex flex-1 flex-col items-center gap-4">
        {items.map(([icon, label], index) => (
          <button
            key={label}
            type="button"
            className={`group flex w-full flex-col items-center gap-2 rounded-lg px-2 py-3 text-[11px] uppercase tracking-wide transition ${
              index === 1
                ? "bg-emerald-400/[0.10] text-emerald-300 shadow-[0_0_28px_rgba(52,211,153,0.10)]"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon name={icon} className="text-[22px]" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function MarketStrip() {
  const [ticks, setTicks] = useState(fallbackMarketTicks);

  useEffect(() => {
    let cancelled = false;

    async function loadMarket() {
      try {
        const response = await fetch("/api/market");
        const data = await response.json();
        if (cancelled || !Array.isArray(data.quotes) || !data.quotes.length) return;
        setTicks(
          data.quotes.map((quote) => ({
            symbol: quote.symbol,
            value: formatMarketValue(quote.value, quote.currency),
            change: Number.isFinite(quote.changePercent) ? `${quote.changePercent > 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%` : "0.00%",
            up: Number(quote.changePercent) > 0,
            neutral: !quote.changePercent
          }))
        );
      } catch {
        // Fallback values keep the terminal readable until the next refresh.
      }
    }

    loadMarket();
    const timer = window.setInterval(loadMarket, 45000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex h-12 items-center gap-7 overflow-x-auto whitespace-nowrap border-b border-white/10 bg-[#081011] px-4 font-ticker text-sm">
      {ticks.map((tick) => (
        <div key={tick.symbol} className="flex items-center gap-2">
          <span className="text-white/75">{tick.symbol}</span>
          <span className="font-bold text-white">{tick.value}</span>
          <span className={tick.neutral ? "text-white/40" : tick.up ? "text-emerald-300" : "text-red-300"}>{tick.change}</span>
        </div>
      ))}
    </div>
  );
}

function TerminalHeader({ selectedMeta }) {
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-ticker text-xs uppercase tracking-wider text-emerald-300">Sonarat Terminal</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-white">{selectedMeta.name}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
        <span className="rounded-lg border border-emerald-400/30 bg-emerald-400/[0.10] px-3 py-2 font-ticker text-emerald-200">
          Candlestick engine
        </span>
        <span className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 font-ticker">ATR + RSI overlay</span>
      </div>
    </header>
  );
}

function ChartPanel({ selectedSymbol, setSelectedSymbol, symbols, symbolsLive }) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0a1315] p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SymbolSearch
            value={selectedSymbol}
            symbols={symbols}
            onChange={setSelectedSymbol}
          />
          <span className="hidden font-ticker text-xs text-white/40 md:inline">
            {symbolsLive ? "Canlı BIST evreni" : "Yedek BIST evreni"} / {symbols.length} sembol
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-emerald-400/30 bg-emerald-400/[0.12] px-3 py-1.5 font-ticker text-xs text-emerald-300">
            Canlı
          </span>
          <Icon name="candlestick_chart" className="text-[20px] text-white/50" />
        </div>
      </div>
      <CustomChart symbol={selectedSymbol} />
    </section>
  );
}

function SymbolSearch({ value, symbols, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = symbols.find((item) => item.symbol === value) || { symbol: value, name: value };
  const selectedLabel = `${selected.symbol} - ${selected.name}`;

  useEffect(() => {
    setQuery(selectedLabel);
  }, [selectedLabel]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.toLocaleLowerCase("tr-TR").trim();
    const normalizedSelected = selectedLabel.toLocaleLowerCase("tr-TR").trim();
    const needle = normalizedQuery === normalizedSelected ? "" : normalizedQuery;
    if (!needle) return symbols;
    return symbols
      .filter((item) => `${item.symbol} ${item.name}`.toLocaleLowerCase("tr-TR").includes(needle))
      .slice(0, 180);
  }, [query, selectedLabel, symbols]);

  return (
    <div className="relative w-[320px] max-w-full" onBlur={() => window.setTimeout(() => setOpen(false), 120)}>
      <div className="flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-[#071011] px-3 focus-within:border-emerald-300/50">
        <Icon name="search" className="text-[18px] text-emerald-300" />
        <input
          value={query}
          onFocus={(event) => {
            event.target.select();
            setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          className="min-w-0 flex-1 bg-transparent font-ticker text-sm text-white outline-none placeholder:text-white/40"
          placeholder="BIST sembol ara"
          aria-label="BIST sembol ara"
        />
      </div>
      {open && (
        <div className="absolute left-0 top-[48px] z-30 max-h-80 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#081011] p-1 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          {filtered.map((item) => (
            <button
              key={item.symbol}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                onChange(item.symbol);
                setQuery(`${item.symbol} - ${item.name}`);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition ${
                item.symbol === value ? "bg-emerald-400/[0.14] text-emerald-100" : "text-white/70 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <span className="font-ticker text-sm font-bold">{item.symbol}</span>
              <span className="min-w-0 flex-1 truncate text-xs text-white/50">{item.name}</span>
            </button>
          ))}
          {!filtered.length && <div className="px-3 py-4 text-sm text-white/50">Sembol bulunamadı</div>}
          <div className="border-t border-white/10 px-3 py-2 font-ticker text-[10px] uppercase tracking-wide text-white/40">
            {filtered.length} / {symbols.length} sembol
          </div>
        </div>
      )}
    </div>
  );
}

function IndicatorStack({ selectedSymbol }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <IndicatorCard
        title="RSI"
        value="14 periyot"
        text={`${selectedSymbol} grafiğinde momentum çizgisi alt bant overlay olarak çalışıyor.`}
        color="emerald"
      />
      <IndicatorCard
        title="ATR"
        value="14 periyot"
        text="Volatilite çizgisi aynı chart motorunda ayrı fiyat ölçeğiyle tutuluyor."
        color="amber"
      />
    </section>
  );
}

function IndicatorCard({ title, value, text, color }) {
  const active = color === "emerald";
  return (
    <section className="rounded-lg border border-white/10 bg-[#0a1315] p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
        <span className={`font-ticker text-xs ${active ? "text-emerald-300" : "text-amber-300"}`}>{value}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
    </section>
  );
}

function AnalysisTable({ selectedSymbol }) {
  const rows = useMemo(() => {
    const symbols = [selectedSymbol, "THYAO", "GARAN", "TUPRS", "ASELS", "EREGL"].filter(
      (item, index, list) => list.indexOf(item) === index
    );
    return symbols.slice(0, 5).map((symbol, index) => ({
      symbol,
      factor: index === 0 ? "Seçili grafik" : "Ucuz hisse taraması",
      score: 82 - index * 6,
      signal: index < 2 ? "Güçlü" : index < 4 ? "İzle" : "Nötr"
    }));
  }, [selectedSymbol]);

  return (
    <section className="rounded-lg border border-white/10 bg-[#0a1315] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-white">Ucuz Hisse Sinyalleri</h2>
        <span className="font-ticker text-xs text-emerald-300">canlı akış</span>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="font-ticker uppercase text-white/40">
          <tr>
            {["Sembol", "Ölçüt", "Skor", "Durum"].map((head) => (
              <th key={head} className="pb-2 font-medium">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.symbol} className="border-t border-white/10 text-white/80">
              <td className="py-2 font-ticker text-emerald-200">{row.symbol}</td>
              <td className="py-2">{row.factor}</td>
              <td className="py-2">{row.score}</td>
              <td className="py-2">
                <span className="rounded-md border border-white/10 bg-white/[0.035] px-2 py-1">{row.signal}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function SmartFeed({ news }) {
  return (
    <aside className="bg-[#081011] p-4">
      <div className="mb-4 flex items-center justify-end gap-7 border-b border-white/10 pb-3">
        <button className="border-b-2 border-emerald-300 pb-2 font-display text-lg text-white">Smart-Feed</button>
        <button className="pb-2 text-white/40">Piyasa X</button>
      </div>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase">Yapay Zeka Özeti</h2>
          <Icon name="more_horiz" className="text-[18px] text-white/40" />
        </div>
        <ul className="space-y-3 text-sm leading-5 text-white/80">
          {news.map((item) => (
            <li key={item.id || item.title} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
              <span className="line-clamp-3">{item.title}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase">Topluluk Akışı</h2>
          <Icon name="more_horiz" className="text-[18px] text-white/40" />
        </div>
        <div className="space-y-3">
          {communityPosts.map(([tag, text, time]) => (
            <article key={tag} className="rounded-lg bg-white/[0.06] p-3">
              <div className="flex gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-300/80 text-black">
                  <Icon name="person" className="text-[17px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white">{tag}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-white/70">{text}</p>
                  <p className="mt-1 font-ticker text-[10px] text-white/40">{time}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2">
          <input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40" placeholder="Mini-chat..." />
          <Icon name="send" className="text-emerald-300" />
        </div>
      </section>
    </aside>
  );
}

function LogoMark({ size = "small" }) {
  return (
    <div className={`${size === "large" ? "text-4xl" : "text-xl"} font-display font-black italic tracking-tight`}>
      <span className="text-white">sona</span>
      <span className="text-[#ff7f3f]">rat</span>
      <span className="text-[#ff7f3f]">.</span>
    </div>
  );
}

function formatMarketValue(value, currency) {
  if (!Number.isFinite(Number(value))) return "-";
  return Number(value).toLocaleString("tr-TR", {
    maximumFractionDigits: currency === "PTS" ? 2 : 2,
    minimumFractionDigits: currency === "PTS" ? 2 : 2
  });
}

function relativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "az önce";
  const diff = Math.max(0, Date.now() - date.getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "az önce";
  if (min < 60) return `${min} dk`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} sa`;
  return date.toLocaleDateString("tr-TR");
}
