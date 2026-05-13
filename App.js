import { useEffect, useMemo, useState } from "react";
import Icon from "./components/Icon";

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
    title: "BIST100 için 9.850 seviyesi üstünde kapanış takip ediliyor.",
    summary: "Hacim artışı endeksin teknik görünümünü desteklerken seçici hisse hareketleri öne çıkıyor.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    score: 64
  },
  {
    id: "fallback-3",
    source: "Sonarat Makro",
    category: "Ekonomi",
    title: "Enflasyon beklentileri ve merkez bankası mesajları piyasanın odağında.",
    summary: "Tahvil faizi, banka çarpanları ve döviz sepetindeki hareketler aynı panelde izleniyor.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    score: 58
  }
];

const holdingRows = [
  ["BIST100", "1.359.00", "52.50", "14.00", "43"],
  ["THYAO", "350.00", "50.30", "33.00", "49"],
  ["MIYA", "117.30", "57.30", "7.50", "35"],
  ["FROTO", "128.60", "59.50", "29.00", "43"],
  ["TUPRS", "98.50", "36.50", "29.00", "42"]
];

const communityPosts = [
  ["#THYAO Analiz", "Yarın BIST bankacılıkta hacim artışı bekleniyor.", "3 hours ago"],
  ["#TeknolojiGeleceği", "Apple haberi teknoloji hisselerini etkiledi.", "3 years ago"],
  ["#BorsaSohbet", "Brent tarafında oynaklık enerji sepetine yansıdı.", "7 years ago"]
];

export default function App() {
  const [economyNews, setEconomyNews] = useState(fallbackEconomyNews);

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

  const aiSummary = useMemo(() => economyNews.slice(0, 3), [economyNews]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06090a] text-[#f2f2f0]">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "linear-gradient(120deg, rgba(146,164,166,0.28), transparent 28%), radial-gradient(circle at 12% 70%, rgba(147,165,168,0.28), transparent 28%), linear-gradient(180deg, #1f2b2f 0%, #06090a 62%)"
        }}
      />
      <div
        className="absolute bottom-0 left-0 h-[42%] w-[46%] blur-2xl"
        style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.16), transparent 58%)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(103,126,132,0.30), transparent 34%), linear-gradient(90deg, rgba(2,4,5,0.95), rgba(5,8,10,0.72) 44%, rgba(2,4,5,0.95))"
        }}
      />

      <section className="relative flex min-h-screen items-center justify-center px-4 py-8 md:px-8">
        <div className="w-full max-w-[1240px] overflow-hidden rounded-[20px] border border-white/10 bg-[#080d0f]/95 shadow-[0_40px_140px_rgba(0,0,0,0.85)] ring-1 ring-white/5">
          <div className="grid min-h-[700px] grid-cols-1 lg:grid-cols-[250px_116px_minmax(0,1fr)_268px]">
            <BrandEconomyRail news={economyNews} />
            <TerminalNav />

            <section className="min-w-0 border-r border-white/10 bg-[#0a0f11]/90 p-4 md:p-5">
              <TerminalHeader />
              <ChartPanel />
              <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_306px]">
                <div className="grid gap-3">
                  <IndicatorCard title="RSI" value="↘ %59" heights={[42, 46, 44, 51, 49, 58, 62, 45, 39, 54]} />
                  <IndicatorCard title="ATR" value="•••" heights={[34, 33, 35, 68, 88, 52, 48, 42, 36, 38]} />
                </div>
                <AnalysisTable />
              </div>
            </section>

            <SmartFeed news={aiSummary} />
          </div>
        </div>
      </section>
    </main>
  );
}

function BrandEconomyRail({ news }) {
  return (
    <aside className="relative flex min-h-[620px] flex-col border-r border-white/10 bg-[#0d1316]/90 p-7">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,122,54,0.08), transparent 40%)" }}
      />
      <div className="relative flex flex-1 flex-col justify-center">
        <LogoMark size="large" />
        <div className="mt-8 rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-ticker text-[10px] uppercase tracking-wider text-[#ff8b4a]">Canlı ekonomi</span>
            <span className="flex items-center gap-1 font-ticker text-[10px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              live
            </span>
          </div>
          <div className="space-y-2">
            {news.slice(0, 4).map((item) => (
              <a
                key={item.id || item.title}
                href={item.url || "#"}
                target={item.url ? "_blank" : undefined}
                rel={item.url ? "noreferrer" : undefined}
                className="block rounded-lg border border-white/10 bg-white/[0.035] p-3 transition hover:border-[#ff8b4a]/40 hover:bg-[#ff8b4a]/10"
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
    <nav className="hidden border-r border-white/10 bg-[#101619]/90 p-4 lg:flex lg:flex-col">
      <LogoMark />
      <div className="mt-20 flex flex-1 flex-col items-center gap-7">
        {items.map(([icon, label], index) => (
          <button
            key={label}
            type="button"
            className={`group flex w-full flex-col items-center gap-2 rounded-lg px-2 py-3 text-xs uppercase tracking-wide transition ${
              index === 1 ? "bg-[#ff8b4a]/10 text-[#ff8b4a] shadow-[0_0_30px_rgba(255,139,74,0.18)]" : "text-white/50 hover:bg-white/5 hover:text-white"
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

function TerminalHeader() {
  return (
    <header className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-xl font-bold uppercase tracking-tight">Terminal</h1>
        <span className="h-5 w-px bg-white/20" />
        <span className="text-lg text-white/40">Analyze</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
          <Icon name="notifications" className="text-[16px] text-[#ff8b4a]" />
          Borarat
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white/100 text-[10px] text-black">●</span>
        </button>
      </div>
    </header>
  );
}

function ChartPanel() {
  return (
    <section className="rounded-xl border border-white/10 bg-[#111719]/90 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 font-ticker text-xs text-white/60">
          <span className="rounded-md bg-black/20 px-3 py-2 text-white">BIST100</span>
          <span>1h</span>
          <span>⌘</span>
          <span>↶</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-emerald-400/30 bg-emerald-400/12 px-3 py-1.5 font-ticker text-xs text-emerald-300">6 KURAL</span>
          <Icon name="settings" className="text-[18px] text-white/60" />
          <Icon name="photo_camera" className="text-[18px] text-white/60" />
        </div>
      </div>

      <div className="relative h-[300px] overflow-hidden rounded-lg border border-white/10 bg-[#0b1113]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "100% 32px, 64px 100%"
          }}
        />
        <svg viewBox="0 0 760 300" className="absolute inset-0 h-full w-full">
          <path d="M40 220 C110 205 140 230 198 188 C250 144 292 168 340 118 C408 52 452 88 492 82 C548 70 578 45 620 74 C660 102 690 132 720 98" fill="none" stroke="#f1f4f2" strokeWidth="2.4" />
          <path d="M40 236 C130 214 194 220 276 176 C360 136 452 126 542 104 C618 84 680 108 720 92" fill="none" stroke="#ed8b4a" strokeWidth="1.4" opacity="0.78" />
          <path d="M40 246 C130 232 205 230 286 208 C370 184 472 164 560 144 C636 128 690 132 720 125" fill="none" stroke="#cfd4d2" strokeWidth="1.2" opacity="0.58" />
          {Array.from({ length: 36 }).map((_, index) => {
            const x = 52 + index * 18;
            const seed = Math.sin(index * 1.7) * 48 + Math.cos(index * 0.8) * 22;
            const y = Math.max(50, 210 - index * 3.2 - seed);
            const up = index % 3 !== 0;
            const h = 14 + Math.abs(Math.sin(index)) * 24;
            return (
              <g key={index}>
                <line x1={x} x2={x} y1={y - 16} y2={y + h + 14} stroke={up ? "#f4f0ea" : "#ee7648"} strokeWidth="1" opacity="0.8" />
                <rect x={x - 4} y={up ? y : y - h} width="8" height={h} rx="1.5" fill={up ? "#f4f0ea" : "#ee7648"} />
              </g>
            );
          })}
          {Array.from({ length: 44 }).map((_, index) => (
            <rect key={`v-${index}`} x={34 + index * 16} y={250 - Math.abs(Math.sin(index * 1.2)) * 44} width="8" height={Math.abs(Math.sin(index * 1.2)) * 44 + 8} fill={index % 3 ? "#2c7b6f" : "#b85f4e"} opacity="0.65" />
          ))}
        </svg>
        <div className="absolute left-[48%] top-[31%] rounded-md bg-emerald-500 px-2 py-1 font-ticker text-xs font-bold text-white">8 KURAL</div>
        <div className="absolute right-5 top-[28%] rounded bg-[#f28c4f] px-2 py-1 font-ticker text-[10px] text-white">BOTAŞ</div>
      </div>
    </section>
  );
}

function IndicatorCard({ title, value, heights }) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#111719]/90 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        <span className="font-ticker text-xs text-[#ff8b4a]">{value}</span>
      </div>
      <div className="flex h-16 items-end gap-1 border-t border-white/10 pt-2">
        {heights.map((height, index) => (
          <span key={index} className="flex-1 rounded-t bg-[#ff8b4a]/75" style={{ height: `${height}%` }} />
        ))}
      </div>
    </section>
  );
}

function AnalysisTable() {
  return (
    <section className="rounded-xl border border-white/10 bg-[#111719]/90 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">Ekonomi Analiz</h2>
        <span className="rounded-md border border-emerald-400/30 bg-emerald-400/12 px-2 py-1 font-ticker text-xs text-emerald-300">6 KURAL</span>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="font-ticker uppercase text-white/50">
          <tr>
            {["Sembol", "Fiyat", "RSI", "ATR", "Skor", "Analiz"].map((head) => (
              <th key={head} className="pb-2 font-medium">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdingRows.map((row) => (
            <tr key={row[0]} className="border-t border-white/10 text-white/80">
              {row.map((cell) => (
                <td key={cell} className="py-2">{cell}</td>
              ))}
              <td className="py-2">
                <span className="block h-1.5 w-10 rounded-full bg-[#ff8b4a]" />
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
    <aside className="bg-[#0b1113]/95 p-4">
      <div className="mb-4 flex items-center justify-end gap-7 border-b border-white/10 pb-3">
        <button className="border-b-2 border-[#ff8b4a] pb-2 font-display text-lg text-white">Smart-Feed</button>
        <button className="pb-2 text-white/40">Topluluk</button>
      </div>

      <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase">Yapay Zeka Özeti</h2>
          <Icon name="more_horiz" className="text-[18px] text-white/40" />
        </div>
        <ul className="space-y-3 text-sm leading-5 text-white/80">
          {news.map((item) => (
            <li key={item.id || item.title} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
              <span className="line-clamp-3">{item.title}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase">Topluluk Akışı</h2>
          <Icon name="more_horiz" className="text-[18px] text-white/40" />
        </div>
        <div className="space-y-3">
          {communityPosts.map(([tag, text, time]) => (
            <article key={tag} className="rounded-lg bg-white/[0.08] p-3">
              <div className="flex gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/75 text-black">
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
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/[0.08] px-3 py-2">
          <input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40" placeholder="Mini-chat..." />
          <Icon name="send" className="text-[#ff8b4a]" />
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
