import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import NewsFeed from "./NewsFeed";

const portfolioIds = new Set(["portfolio", "stock-compare", "holding-discount", "locked-holding", "historical-discount"]);
const marketIds = new Set(["market-scan", "advanced-scan", "indicator-scan", "advanced-filters", "depth", "liquidity"]);

export default function ModuleWorkspace({ selected }) {
  const mode = selected.id === "holding-discount" || selected.id === "historical-discount" ? "discount" : "market";
  const shouldShowScreener = portfolioIds.has(selected.id) || marketIds.has(selected.id);
  const [screener, setScreener] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shouldShowScreener) return undefined;
    let cancelled = false;

    async function loadScreener() {
      setLoading(true);
      try {
        const response = await fetch(`/api/screener?mode=${mode}&limit=10`);
        const data = await response.json();
        if (!cancelled) setScreener(data);
      } catch {
        if (!cancelled) setScreener(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadScreener();
    const timer = window.setInterval(loadScreener, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [mode, shouldShowScreener]);

  const heading = useMemo(() => {
    if (selected.id === "holding-discount") return "İskontolu ucuz hisse taraması";
    if (selected.group === "Market") return "Piyasa tarama ölçütleri";
    if (selected.group === "Portfolio") return "Portföy ve değerleme motoru";
    return "KAP ve şirket haber akışı";
  }, [selected.group, selected.id]);

  if (!shouldShowScreener) {
    return <NewsFeed />;
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-xl p-5">
        <div className="flex flex-col gap-4 border-b border-outline-variant/20 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-ticker text-xs uppercase text-on-primary-container">Tarama motoru</p>
            <h3 className="mt-1 font-display text-2xl font-bold text-on-surface">{heading}</h3>
          </div>
          <div className="flex flex-wrap gap-2 font-ticker text-[11px] uppercase">
            <Badge icon="schedule" text={loading ? "Yenileniyor" : "60 sn canlı"} />
            <Badge icon="rule" text={`${screener?.criteria?.length || 5} ölçüt`} />
            <Badge icon="query_stats" text={`${screener?.rows?.length || 0} hisse`} />
          </div>
        </div>

        <div className="grid gap-3 py-5 md:grid-cols-5">
          {(screener?.criteria || []).map((item) => (
            <div key={item.label} className="rounded-lg border border-outline-variant/20 bg-white/[0.02] p-3">
              <p className="font-ticker text-[10px] uppercase text-on-primary-container">{item.label}</p>
              <p className="mt-2 text-sm font-semibold leading-snug text-on-surface">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left">
            <thead className="font-ticker text-[11px] uppercase text-on-primary-container">
              <tr>
                <th className="px-3 py-2">Hisse</th>
                <th className="px-3 py-2">Fiyat</th>
                <th className="px-3 py-2">Değişim</th>
                <th className="px-3 py-2">F/K</th>
                <th className="px-3 py-2">PD/DD</th>
                <th className="px-3 py-2">Hacim</th>
                <th className="px-3 py-2">İskonto</th>
                <th className="px-3 py-2">Skor</th>
                <th className="px-3 py-2">Sinyal</th>
              </tr>
            </thead>
            <tbody>
              {(screener?.rows || []).map((row) => (
                <tr key={row.symbol} className="rounded-lg bg-surface-container-lowest text-sm">
                  <td className="rounded-l-lg px-3 py-3">
                    <div className="font-ticker text-primary">${row.symbol}</div>
                    <div className="text-xs text-on-primary-container">{row.name}</div>
                  </td>
                  <td className="px-3 py-3 font-semibold">{row.last.toLocaleString("tr-TR")}</td>
                  <td className={`px-3 py-3 font-semibold ${row.change >= 0 ? "text-primary" : "text-red-soft"}`}>
                    {row.change >= 0 ? "+" : ""}
                    {row.change.toFixed(2)}%
                  </td>
                  <td className="px-3 py-3">{row.fk.toFixed(1)}</td>
                  <td className="px-3 py-3">{row.pdDd.toFixed(2)}</td>
                  <td className="px-3 py-3">{row.volumeRatio.toFixed(2)}x</td>
                  <td className="px-3 py-3">%{row.discount}</td>
                  <td className="px-3 py-3 font-ticker text-gold">{row.score}</td>
                  <td className="rounded-r-lg px-3 py-3">
                    <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 font-ticker text-[11px] text-primary">
                      {row.signal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <NewsFeed />
    </div>
  );
}

function Badge({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-2 py-1 text-on-surface-variant">
      <Icon name={icon} className="text-[15px] text-primary" />
      {text}
    </span>
  );
}
