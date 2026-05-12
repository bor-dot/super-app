import { useMemo, useState } from "react";
import Icon from "./components/Icon";
import MobilePreview from "./components/MobilePreview";
import ModulePanel from "./components/ModulePanel";
import ModuleWorkspace from "./components/ModuleWorkspace";
import Sidebar from "./components/Sidebar";
import TickerBar from "./components/TickerBar";
import { moduleGroups, modules } from "./data/screens";

export default function App() {
  const [selectedId, setSelectedId] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const selected = modules.find((item) => item.id === selectedId) || modules[0];
  const topTabs = [
    { label: "Anlık", id: "dashboard" },
    { label: "Sana Özel", id: "mobile-summary" },
    { label: "Ucuz Hisseler", id: "holding-discount" },
    { label: "Alarm Merkezi", id: "alarm-center" },
    { label: "Piyasa Tarama", id: "market-scan" }
  ];

  const visibleGroups = useMemo(
    () =>
      moduleGroups
        .map((group) => ({ group, items: modules.filter((item) => item.group === group) }))
        .filter(({ items }) => items.length),
    []
  );

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar selectedId={selectedId} onSelect={setSelectedId} />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-outline-variant/20 bg-background/85 backdrop-blur-xl lg:hidden">
            <div className="flex h-16 items-center justify-between px-4">
              <div>
                <h1 className="font-display text-xl font-bold text-on-surface">Sonarat Akışı</h1>
                <p className="font-ticker text-[10px] uppercase text-on-primary-container">Terminal Access</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="grid h-10 w-10 place-items-center rounded-full border border-outline-variant/30 text-primary"
                aria-label="Modül menüsü"
              >
                <Icon name={mobileMenuOpen ? "close" : "menu"} />
              </button>
            </div>
            {mobileMenuOpen && (
              <div className="max-h-[60vh] overflow-y-auto border-t border-outline-variant/20 p-4">
                {visibleGroups.map(({ group, items }) => (
                  <div key={group} className="mb-5">
                    <p className="mb-2 font-ticker text-[10px] uppercase text-on-primary-container">{group}</p>
                    <div className="grid gap-2">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedId(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm ${
                            item.id === selectedId
                              ? "border-primary/40 bg-surface-container-high text-on-surface"
                              : "border-outline-variant/20 bg-white/[0.02] text-on-surface-variant"
                          }`}
                        >
                          <Icon name={item.icon} className="text-[19px] text-primary" />
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </header>

          <TickerBar />

          <div className="flex items-center gap-6 overflow-x-auto border-b border-outline-variant/20 bg-background/90 px-4 pt-4 font-ticker text-sm md:px-8">
            {topTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedId(tab.id)}
                className={`shrink-0 px-2 pb-3 ${
                  selectedId === tab.id
                    ? "border-b-2 border-primary font-bold text-primary"
                    : "text-on-primary-container hover:text-on-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[1180px] gap-8 px-4 py-6 md:px-8">
              <section className="min-w-0 flex-1">
                <div className="mb-6 glass-panel rounded-xl p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-ticker text-xs uppercase text-primary">
                        <Icon name={selected.icon} className="text-[16px]" />
                        {selected.group}
                      </div>
                      <h2 className="max-w-3xl font-display text-3xl font-bold leading-tight text-on-surface md:text-5xl">
                        {selected.title}
                      </h2>
                      <p className="mt-4 max-w-2xl leading-7 text-on-surface-variant">
                        KAP ve şirket haberleri, piyasa taraması, alarm motorları ve iskonto odaklı hisse
                        listeleri tek akışta çalışır. Veriler canlı kaynaklardan geldikçe güncellenir; kaynak
                        erişilemezse terminal boş kalmasın diye son güvenilir örnek set devreye girer.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 md:w-72">
                      <Stat label="Ekran" value={modules.length} />
                      <Stat label="Grup" value={moduleGroups.length} />
                      <Stat label="Durum" value={selected.status} />
                    </div>
                  </div>
                </div>

                <div className="mb-6 lg:hidden">
                  <MobilePreview />
                </div>

                <ModuleWorkspace selected={selected} />
              </section>

              <ModulePanel selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-3 text-center">
      <p className="font-ticker text-[10px] uppercase text-on-primary-container">{label}</p>
      <p className="mt-1 text-lg font-bold text-on-surface">{value}</p>
    </div>
  );
}
