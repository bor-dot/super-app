import { useState } from "react";
import { ArrowUpRight, DatabaseZap, Layers3, Radar } from "lucide-react";
import HierarchyMap from "./components/HierarchyMap";
import InsightPanel from "./components/InsightPanel";
import PhoneShell from "./components/PhoneShell";

export default function App() {
  const [fastMode, setFastMode] = useState(true);
  const [sourceMode, setSourceMode] = useState(true);

  return (
    <main className="mesh-bg min-h-screen overflow-hidden">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-emeraldSignal/30 bg-emeraldSignal/10">
            <Radar className="h-5 w-5 text-emeraldSignal" />
          </span>
          <div>
            <p className="text-sm font-semibold text-mist">Sonarat</p>
            <p className="text-xs text-muted">News Stream</p>
          </div>
        </div>
        <a
          href="#stream"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-mist transition hover:border-emeraldSignal/40"
        >
          Akışı incele
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </nav>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-14 pt-4 sm:px-8 lg:grid-cols-[1fr_430px] lg:pb-20 lg:pt-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emeraldSignal/25 bg-emeraldSignal/10 px-3 py-1.5 text-xs font-semibold text-emeraldSignal">
            <DatabaseZap className="h-3.5 w-3.5" />
            Kurumsal veri alarmları için mobil komuta ekranı
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-mist sm:text-6xl">
            Haber akışını alarm, iştirak ve risk bağlamıyla yakala.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            Stitch arayüzündeki koyu, kart odaklı mobil dili Next.js ve Tailwind ile yeniden kuruldu:
            zümrüt sinyal vurguları, hızlı aktivasyon kontrolleri ve kurumsal hiyerarşi görünümü tek sayfada.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Mobil kart yapısı", "On/Off alarm akışı", "İştirak haritası"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <Layers3 className="h-5 w-5 text-emeraldSignal" />
                <p className="mt-3 text-sm font-semibold text-mist">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="stream">
          <PhoneShell
            fastMode={fastMode}
            setFastMode={setFastMode}
            sourceMode={sourceMode}
            setSourceMode={setSourceMode}
          />
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0d1210]/88 px-5 py-10 sm:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[1fr_1.25fr]">
          <HierarchyMap />
          <InsightPanel />
        </div>
      </section>
    </main>
  );
}
