import { useEffect, useState } from "react";
import { marketTicks } from "../data/screens";

export default function TickerBar() {
  const [ticks, setTicks] = useState(marketTicks);

  useEffect(() => {
    let cancelled = false;
    async function loadMarket() {
      try {
        const response = await fetch("/api/market");
        const data = await response.json();
        if (cancelled || !Array.isArray(data.quotes) || !data.quotes.length) return;
        setTicks(data.quotes.map((quote) => ({
          symbol: quote.symbol,
          value: formatValue(quote.value),
          change: Number.isFinite(quote.changePercent) ? `${quote.changePercent > 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%` : "0.00%",
          up: Number(quote.changePercent) > 0,
          neutral: !quote.changePercent
        })));
      } catch {}
    }
    loadMarket();
    const timer = window.setInterval(loadMarket, 45000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  return (
    <div className="flex h-10 items-center gap-6 overflow-x-auto whitespace-nowrap border-b border-outline-variant/20 bg-surface-container-low px-4 font-ticker text-sm">
      {ticks.map((tick) => (
        <div key={tick.symbol} className="flex items-center gap-1.5">
          <span className="text-on-surface">{tick.symbol}</span>
          <span className="font-bold text-on-surface">{tick.value}</span>
          <span className={tick.neutral ? "text-on-primary-container" : tick.up ? "text-teal" : "text-red-soft"}>{tick.change}</span>
        </div>
      ))}
    </div>
  );
}

function formatValue(value) {
  if (!Number.isFinite(Number(value))) return "-";
  return Number(value).toLocaleString("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}
