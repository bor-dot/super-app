import { Bell, Menu, Search, SlidersHorizontal } from "lucide-react";
import NewsCard from "./NewsCard";
import ToggleRow from "./ToggleRow";
import { alerts } from "../data/news";

export default function PhoneShell({ fastMode, setFastMode, sourceMode, setSourceMode }) {
  return (
    <div className="mx-auto w-full max-w-[390px] rounded-[2rem] border border-white/10 bg-[#0f1513] p-3 shadow-glow">
      <div className="rounded-[1.55rem] border border-white/10 bg-ink">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04]" aria-label="Menü">
            <Menu className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-mist">Sonarat</p>
            <p className="text-xs text-muted">News Stream</p>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-emeraldSignal text-ink" aria-label="Bildirimler">
            <Bell className="h-4 w-4" />
          </button>
        </header>

        <main className="max-h-[690px] overflow-y-auto px-4 py-4 scrollbar-soft">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2.5">
            <Search className="h-4 w-4 text-muted" />
            <input
              aria-label="Haber ve alarm ara"
              className="w-full bg-transparent text-sm text-mist outline-none placeholder:text-muted"
              placeholder="Alarm, şirket veya başlık ara"
            />
            <SlidersHorizontal className="h-4 w-4 text-muted" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <ToggleRow
              label="Hızlı aktivasyon"
              detail={fastMode ? "Alarm koşulları açık" : "Sessiz izleme"}
              checked={fastMode}
              onChange={() => setFastMode(!fastMode)}
            />
            <ToggleRow
              label="Hiyerarşi filtresi"
              detail={sourceMode ? "İştirak ağı dahil" : "Ana kaynaklar"}
              checked={sourceMode}
              onChange={() => setSourceMode(!sourceMode)}
            />
          </div>

          <section className="mt-5 rounded-lg border border-emeraldSignal/20 bg-emeraldSignal/[0.07] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emeraldSignal">Canlı özet</p>
            <h1 className="mt-2 text-xl font-semibold leading-tight text-mist">
              Kurumsal sinyaller tek mobil akışta birleşiyor.
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Haber yoğunluğu, iştirak ilişkileri ve alarm eşikleri hızlı taranabilir kartlara ayrıldı.
            </p>
          </section>

          <section className="mt-5 space-y-3">
            {alerts.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
