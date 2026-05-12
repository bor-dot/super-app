import { useEffect, useState } from "react";
import Icon from "./Icon";
import { newsFeed } from "../data/screens";

const toneClass = { teal: "bg-teal/10 text-teal", gold: "bg-gold/10 text-gold", red: "bg-red-soft/10 text-red-soft" };

export default function NewsFeed() {
  const [items, setItems] = useState(newsFeed);

  useEffect(() => {
    let cancelled = false;
    async function loadNews() {
      try {
        const response = await fetch("/api/news?limit=24");
        const data = await response.json();
        if (cancelled || !Array.isArray(data.news) || !data.news.length) return;
        setItems(data.news.map((item) => ({
          source: item.source,
          time: relativeTime(item.publishedAt),
          tag: item.symbol ? `$${item.symbol}` : item.category || "#NEWS",
          tagTone: item.score >= 70 ? "red" : item.symbol ? "teal" : "gold",
          title: item.title,
          summary: item.summary || "Özet bekleniyor.",
          meta: item.category,
          icon: item.symbol ? "business_center" : "newspaper",
          url: item.url
        })));
      } catch {}
    }
    loadNews();
    const timer = window.setInterval(loadNews, 60000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  return (
    <section className="flex max-w-[680px] flex-col gap-4">
      {items.map((item) => (
        <article key={item.title} className="glass-panel rounded-xl p-6 transition hover:border-outline-variant/50">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-surface-variant"><Icon name={item.icon} className="text-[19px] text-primary" /></div><div><p className="font-display text-base font-semibold text-on-surface">{item.source}</p><p className="text-xs text-on-primary-container">{item.time}</p></div></div>
            <button className="rounded-full p-1 text-on-primary-container hover:bg-white/5 hover:text-on-surface" aria-label="Daha fazla"><Icon name="more_horiz" /></button>
          </div>
          <p className="text-base leading-7 text-on-surface"><span className={`mr-2 inline-block rounded px-2 py-1 font-ticker text-sm ${toneClass[item.tagTone]}`}>{item.tag}</span>{item.title}</p>
          <p className="mt-3 leading-7 text-on-surface-variant">{item.summary}</p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 pt-4">
            <div className="flex items-center gap-2 text-sm text-primary"><Icon name="tag" className="text-[18px]" />{item.meta}</div>
            <div className="flex flex-wrap gap-2"><button className="flex items-center gap-1.5 rounded border border-outline-variant/40 px-3 py-1.5 text-sm text-on-primary-container hover:bg-white/5 hover:text-on-surface"><Icon name="comment" className="text-[18px]" />Yorum</button><button className="flex items-center gap-1.5 rounded border border-gold/50 px-3 py-1.5 text-sm text-gold hover:bg-gold/10"><Icon name="analytics" className="text-[18px]" />Analiz</button>{item.url && <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded border border-outline-variant/40 px-3 py-1.5 text-sm text-on-primary-container hover:bg-white/5 hover:text-on-surface"><Icon name="open_in_new" className="text-[18px]" />Kaynak</a>}</div>
          </div>
        </article>
      ))}
    </section>
  );
}

function relativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "az önce";
  const min = Math.floor(Math.max(0, Date.now() - date.getTime()) / 60000);
  if (min < 1) return "az önce";
  if (min < 60) return `${min} dk önce`;
  const hour = Math.floor(min / 60);
  return hour < 24 ? `${hour} sa önce` : date.toLocaleDateString("tr-TR");
}
