import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import NewsFeed from "./NewsFeed";
import SocialMarketFeed from "./SocialMarketFeed";

const portfolioIds = new Set(["portfolio", "stock-compare", "holding-discount", "locked-holding", "historical-discount"]);
const marketIds = new Set(["market-scan", "advanced-scan", "indicator-scan", "advanced-filters", "depth", "liquidity"]);

const groupCopy = {
  Core: "Ana akista KAP, piyasa, sosyal yorum ve alarm ozeti tek ekranda okunur.",
  Mobile: "Mobil deneyimde bildirim, filtre, bulten ve portfoy ozeti telefon akisi gibi calisir.",
  Alarm: "Alarm motoru kosul, esik, haber etkisi ve risk seviyesi ile tetik uretir.",
  Analysis: "Analiz sayfalari grafik, korelasyon, haber detayi ve editor alanlariyla ayrisir.",
  Market: "Piyasa tarama sayfalari olcut bazli filtre, derinlik ve likidite gorunumu verir.",
  Portfolio: "Portfoy sayfalari iskonto, kiyaslama ve degerleme sinyallerini ayirir.",
  Institutional: "Kurumsal akista araci kurum, blok islem ve balina hareketi takip edilir.",
  Desktop: "Masaustu terminalde izleme listesi, grafik secimi ve emir oncesi sinyal paneli bulunur.",
  Share: "Sosyal paylasim alaninda yorum, begeni, begenmeme ve yeniden paylasim akisi vardir.",
  Subscription: "Uye girisi, paket, rapor ve odeme adimlari tek abonelik panelinde toplanir."
};

export default function ModuleWorkspace({ selected }) {
  const mode = selected.id === "holding-discount" || selected.id === "historical-discount" ? "discount" : "market";
  const shouldShowScreener = portfolioIds.has(selected.id) || marketIds.has(selected.id);
  const shouldFetchScreener = shouldShowScreener || selected.group === "Core";
  const [screener, setScreener] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shouldFetchScreener) return undefined;
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
  }, [mode, shouldFetchScreener]);

  if (selected.group === "Share") return <SocialMarketFeed selected={selected} />;
  if (selected.group === "Subscription") return <SubscriptionWorkspace selected={selected} />;
  if (selected.group === "Alarm") return <AlarmWorkspace selected={selected} />;
  if (selected.group === "Analysis") return <AnalysisWorkspace selected={selected} />;
  if (selected.group === "Mobile") return <MobileWorkspace selected={selected} />;
  if (selected.group === "Institutional") return <FlowWorkspace selected={selected} />;
  if (selected.group === "Desktop") return <DesktopWorkspace selected={selected} />;
  if (shouldShowScreener) return <ScreenerWorkspace selected={selected} screener={screener} loading={loading} />;

  return <DashboardWorkspace selected={selected} screener={screener} loading={loading} />;
}

function DashboardWorkspace({ selected, screener, loading }) {
  return (
    <div className="space-y-6">
      <ModuleHeader selected={selected} eyebrow="Canli merkez" />
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon="article" label="KAP/Haber" value="24" detail="Canli kaynak" />
        <MetricCard icon="notifications_active" label="Alarm" value="7" detail="3 kritik" />
        <MetricCard icon="query_stats" label="Tarama" value={loading ? "..." : screener?.rows?.length || 10} detail="Olcut bazli" />
        <MetricCard icon="forum" label="Sosyal" value="319" detail="Yorum/Paylasim" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ScreenerWorkspace selected={{ ...selected, group: "Market", id: "market-scan", title: "Ana Piyasa Taramasi" }} screener={screener} loading={loading} compact />
        <SocialMarketFeed selected={selected} compact />
      </div>
      <NewsFeed />
    </div>
  );
}

function ScreenerWorkspace({ selected, screener, loading, compact = false }) {
  const heading = useMemo(() => {
    if (selected.id === "holding-discount") return "İskontolu ucuz hisse taramasi";
    if (selected.id === "stock-compare") return "Hisse kiyaslama tablosu";
    if (selected.id === "depth") return "Derinlik ve kademe okuma";
    if (selected.id === "liquidity") return "Likidite isi haritasi";
    if (selected.group === "Market") return "Piyasa tarama olcutleri";
    return "Portfoy ve degerleme motoru";
  }, [selected.group, selected.id]);

  return (
    <div className="space-y-6">
      {!compact && <ModuleHeader selected={selected} eyebrow="Tarama motoru" />}
      <section className="glass-panel rounded-xl p-5">
        <div className="flex flex-col gap-4 border-b border-outline-variant/20 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-ticker text-xs uppercase text-on-primary-container">{selected.title}</p>
            <h3 className="mt-1 font-display text-2xl font-bold text-on-surface">{heading}</h3>
          </div>
          <div className="flex flex-wrap gap-2 font-ticker text-[11px] uppercase">
            <Badge icon="schedule" text={loading ? "Yenileniyor" : "60 sn canli"} />
            <Badge icon="rule" text={`${screener?.criteria?.length || 5} olcut`} />
            <Badge icon="query_stats" text={`${screener?.rows?.length || 0} hisse`} />
          </div>
        </div>

        <div className="grid gap-3 py-5 md:grid-cols-5">
          {(screener?.criteria || fallbackCriteria()).map((item) => (
            <div key={item.label} className="rounded-lg border border-outline-variant/20 bg-white/[0.02] p-3">
              <p className="font-ticker text-[10px] uppercase text-on-primary-container">{item.label}</p>
              <p className="mt-2 text-sm font-semibold leading-snug text-on-surface">{item.value}</p>
            </div>
          ))}
        </div>

        <ScreenerTable rows={screener?.rows || []} />
      </section>

      {!compact && <ModuleDetail selected={selected} />}
    </div>
  );
}

function ModuleDetail({ selected }) {
  const items = detailItems(selected);
  return (
    <section className="glass-panel rounded-xl p-5">
      <SectionTitle icon={selected.icon} title={`${selected.title} ozeti`} subtitle={groupCopy[selected.group]} />
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <InfoTile key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </section>
  );
}

function AlarmWorkspace({ selected }) {
  const rules = [
    { name: "Fiyat esigi", status: "Aktif", detail: "Hisse fiyati belirlenen seviyeyi gecince bildirim" },
    { name: "Haber etkisi", status: "Aktif", detail: "KAP/haber skoru 70 ustune cikarsa alarm" },
    { name: "Hacim patlamasi", status: "Izlemede", detail: "Son hacim 1.5x ortalamayi asarsa sinyal" },
    { name: "Sosyal yogunluk", status: "Yeni", detail: "Piyasa X yorum sayisi ani artarsa takip" }
  ];

  return (
    <div className="space-y-6">
      <ModuleHeader selected={selected} eyebrow="Alarm motoru" />
      <section className="grid gap-4 md:grid-cols-2">
        {rules.map((rule) => (
          <div key={rule.name} className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between gap-3">
              <Icon name="notifications_active" className="text-primary" />
              <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 font-ticker text-xs text-primary">{rule.status}</span>
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-on-surface">{rule.name}</h3>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{rule.detail}</p>
            <button type="button" className="mt-4 rounded-lg border border-outline-variant/20 px-3 py-2 text-sm font-semibold text-on-surface">
              Kurali duzenle
            </button>
          </div>
        ))}
      </section>
      <SocialMarketFeed selected={selected} compact />
    </div>
  );
}

function AnalysisWorkspace({ selected }) {
  return (
    <div className="space-y-6">
      <ModuleHeader selected={selected} eyebrow="Analiz terminali" />
      <section className="glass-panel rounded-xl p-5">
        <SectionTitle icon={selected.icon} title={selected.title} subtitle="Grafik, korelasyon, haber detayi ve yorum editoru bu modüle gore ayrildi." />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4">
            <div className="flex h-52 items-end gap-2">
              {[44, 58, 51, 73, 69, 88, 76, 92, 84, 96, 90, 98].map((height, index) => (
                <div key={index} className="flex-1 rounded-t bg-primary/70" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              <InfoTile label="Haber etkisi" value="82/100" />
              <InfoTile label="Korelasyon" value="0.71" />
              <InfoTile label="Yorum tonu" value="Pozitif" />
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant/20 bg-white/[0.02] p-4">
            <p className="font-ticker text-xs uppercase text-on-primary-container">Analist notu</p>
            <textarea defaultValue={`${selected.title}: KAP etkisi, hacim ve fiyat davranisi birlikte izlenmeli.`} className="mt-3 h-40 w-full resize-none rounded-lg border border-outline-variant/20 bg-background/80 p-3 text-sm text-on-surface outline-none" />
            <button type="button" className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background">Yorumu kaydet</button>
          </div>
        </div>
      </section>
      <NewsFeed />
    </div>
  );
}

function MobileWorkspace({ selected }) {
  return (
    <div className="space-y-6">
      <ModuleHeader selected={selected} eyebrow="Mobil uygulama" />
      <section className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="glass-panel rounded-[28px] border border-outline-variant/30 p-4">
          <div className="rounded-[22px] bg-surface-container-lowest p-4">
            <div className="mb-4 flex items-center justify-between"><span className="font-ticker text-xs text-on-primary-container">09:42</span><Icon name="signal_cellular_alt" className="text-[18px]" /></div>
            <h3 className="font-display text-2xl font-bold text-on-surface">{selected.title}</h3>
            <div className="mt-5 space-y-3">
              <MobileRow icon="notifications" title="Anlik bildirim" value="$THYAO KAP" />
              <MobileRow icon="tune" title="Akilli filtre" value="Hacim > 1.5x" />
              <MobileRow icon="forum" title="Sosyal yorum" value="24 yeni yorum" />
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-5"><ModuleDetail selected={selected} /><SocialMarketFeed selected={selected} compact /></div>
      </section>
    </div>
  );
}

function FlowWorkspace({ selected }) {
  return (
    <div className="space-y-6">
      <ModuleHeader selected={selected} eyebrow="Kurumsal akis" />
      <section className="glass-panel rounded-xl p-5">
        <SectionTitle icon={selected.icon} title={selected.title} subtitle="Araci kurum dagilimi, blok islem ve yogunluk sinyalleri." />
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard icon="waves" label="Balina islem" value="5" detail="Son 30 dk" />
          <MetricCard icon="corporate_fare" label="Kurum net" value="+128M" detail="BIST ilk 10" />
          <MetricCard icon="radar" label="Sinyal" value="3" detail="Kritik hacim" />
        </div>
      </section>
    </div>
  );
}

function DesktopWorkspace({ selected }) {
  return (
    <div className="space-y-6">
      <ModuleHeader selected={selected} eyebrow="Masaustu terminal" />
      <section className="glass-panel rounded-xl p-5">
        <SectionTitle icon={selected.icon} title={selected.title} subtitle="Genis ekranda izleme listesi, grafik secimi ve sosyal akis yan yana." />
        <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_260px]">
          <div className="space-y-2">{["THYAO", "ISCTR", "TUPRS", "ASELS", "SISE"].map((symbol) => <InfoTile key={symbol} label={`$${symbol}`} value="Izleme listesi" />)}</div>
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4"><div className="flex h-64 items-end gap-2">{[35, 55, 44, 71, 63, 79, 69, 86, 76, 92].map((height, index) => <div key={index} className="flex-1 rounded-t bg-primary/60" style={{ height: `${height}%` }} />)}</div></div>
          <div className="space-y-3"><InfoTile label="Grafik modu" value={selected.title} /><InfoTile label="Alarm" value="2 kosul aktif" /><InfoTile label="Paylas" value="Sosyal karta hazir" /></div>
        </div>
      </section>
    </div>
  );
}

function SubscriptionWorkspace({ selected }) {
  const [loggedIn, setLoggedIn] = useState(false);
  return (
    <div className="space-y-6">
      <ModuleHeader selected={selected} eyebrow="Uyelik ve odeme" />
      <section className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="glass-panel rounded-xl p-5">
          <p className="font-ticker text-xs uppercase text-on-primary-container">Uye girisi</p>
          <input className="mt-4 w-full rounded-lg border border-outline-variant/20 bg-background/80 px-3 py-2 text-sm text-on-surface outline-none" placeholder="E-posta" />
          <input className="mt-2 w-full rounded-lg border border-outline-variant/20 bg-background/80 px-3 py-2 text-sm text-on-surface outline-none" placeholder="Sifre" type="password" />
          <button type="button" onClick={() => setLoggedIn(true)} className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background">{loggedIn ? "Giris yapildi" : "Giris yap"}</button>
          <p className="mt-3 text-sm text-on-primary-container">Uye girisi rapor, yorum ve paylasim yetkilerini acar.</p>
        </div>
        <div className="glass-panel rounded-xl p-5"><ModuleDetail selected={selected} /></div>
      </section>
    </div>
  );
}

function ModuleHeader({ selected, eyebrow }) {
  return <section className="glass-panel rounded-xl p-5"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="font-ticker text-xs uppercase text-on-primary-container">{eyebrow}</p><h3 className="mt-1 font-display text-2xl font-bold text-on-surface">{selected.title}</h3><p className="mt-2 max-w-2xl leading-6 text-on-surface-variant">{groupCopy[selected.group]}</p></div><div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><Icon name={selected.icon} /></div></div></section>;
}

function ScreenerTable({ rows }) {
  const tableRows = rows.length ? rows : fallbackRows();
  return <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left"><thead className="font-ticker text-[11px] uppercase text-on-primary-container"><tr>{["Hisse", "Fiyat", "Degisim", "F/K", "PD/DD", "Hacim", "Iskonto", "Skor", "Sinyal"].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr></thead><tbody>{tableRows.map((row) => <tr key={row.symbol} className="rounded-lg bg-surface-container-lowest text-sm"><td className="rounded-l-lg px-3 py-3"><div className="font-ticker text-primary">${row.symbol}</div><div className="text-xs text-on-primary-container">{row.name}</div></td><td className="px-3 py-3 font-semibold">{row.last.toLocaleString("tr-TR")}</td><td className={`px-3 py-3 font-semibold ${row.change >= 0 ? "text-primary" : "text-red-soft"}`}>{row.change >= 0 ? "+" : ""}{row.change.toFixed(2)}%</td><td className="px-3 py-3">{row.fk.toFixed(1)}</td><td className="px-3 py-3">{row.pdDd.toFixed(2)}</td><td className="px-3 py-3">{row.volumeRatio.toFixed(2)}x</td><td className="px-3 py-3">%{row.discount}</td><td className="px-3 py-3 font-ticker text-gold">{row.score}</td><td className="rounded-r-lg px-3 py-3"><span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 font-ticker text-[11px] text-primary">{row.signal}</span></td></tr>)}</tbody></table></div>;
}

function SectionTitle({ icon, title, subtitle }) {
  return <div className="mb-5 flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon name={icon} className="text-[20px]" /></div><div><h3 className="font-display text-xl font-bold text-on-surface">{title}</h3><p className="mt-1 text-sm leading-6 text-on-surface-variant">{subtitle}</p></div></div>;
}

function MetricCard({ icon, label, value, detail }) {
  return <div className="glass-panel rounded-xl p-4"><div className="flex items-center justify-between gap-3"><Icon name={icon} className="text-primary" /><span className="font-ticker text-xs text-on-primary-container">{label}</span></div><p className="mt-4 font-display text-3xl font-bold text-on-surface">{value}</p><p className="mt-1 text-sm text-on-primary-container">{detail}</p></div>;
}

function InfoTile({ label, value }) {
  return <div className="rounded-lg border border-outline-variant/20 bg-white/[0.02] p-4"><p className="font-ticker text-[10px] uppercase text-on-primary-container">{label}</p><p className="mt-2 break-words text-sm font-semibold leading-snug text-on-surface">{value}</p></div>;
}

function Badge({ icon, text }) {
  return <span className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-2 py-1 text-on-surface-variant"><Icon name={icon} className="text-[15px] text-primary" />{text}</span>;
}

function MobileRow({ icon, title, value }) {
  return <div className="flex items-center gap-3 rounded-xl border border-outline-variant/20 bg-white/[0.03] p-3"><Icon name={icon} className="text-primary" /><div className="min-w-0"><p className="text-sm font-semibold text-on-surface">{title}</p><p className="truncate text-xs text-on-primary-container">{value}</p></div></div>;
}

function detailItems(selected) {
  if (selected.id === "depth") return [{ label: "Alis duvari", value: "42.8M" }, { label: "Satis duvari", value: "37.1M" }, { label: "Spread", value: "%0.18" }];
  if (selected.id === "liquidity") return [{ label: "Sektor", value: "Banka/Havacilik" }, { label: "Sicaklik", value: "88/100" }, { label: "Aksiyon", value: "Alarm kur" }];
  if (selected.id === "stock-compare") return [{ label: "$THYAO", value: "91 skor" }, { label: "$TUPRS", value: "82 skor" }, { label: "$ISCTR", value: "88 skor" }];
  return [{ label: "Veri katmani", value: "KAP + haber + tarama" }, { label: "Karar olcutu", value: "Skor, hacim, risk" }, { label: "Aksiyon", value: "Yorumla / Paylas / Alarm kur" }];
}

function fallbackCriteria() {
  return [
    { label: "Degerleme", value: "F/K < 12 ve PD/DD < 1.50" },
    { label: "Iskonto", value: "Model iskontosu %20 uzeri" },
    { label: "Akis", value: "KAP/haber etkisi pozitif veya notr" },
    { label: "Likidite", value: "Hacim ortalamanin 1.10x uzeri" },
    { label: "Risk", value: "Kritik alarm tek basina alim uretmez" }
  ];
}

function fallbackRows() {
  return [
    { symbol: "THYAO", name: "Türk Hava Yolları", last: 292.5, change: 1.84, fk: 4.8, pdDd: 0.92, volumeRatio: 1.7, discount: 38, score: 92, signal: "Ucuz" },
    { symbol: "ISCTR", name: "İş Bankası C", last: 12.84, change: 2.1, fk: 4.2, pdDd: 0.82, volumeRatio: 1.92, discount: 28, score: 88, signal: "Akış Güçlü" },
    { symbol: "TUPRS", name: "Tüpraş", last: 168.2, change: 0.96, fk: 6.1, pdDd: 1.08, volumeRatio: 1.42, discount: 31, score: 82, signal: "İzle" }
  ];
}
