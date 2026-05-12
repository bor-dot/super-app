import Icon from "./Icon";

export default function MobilePreview() {
  return (
    <div className="mx-auto w-full max-w-[390px] rounded-[2rem] border border-white/10 bg-surface-container-lowest p-3 shadow-2xl lg:hidden">
      <div className="overflow-hidden rounded-[1.5rem] border border-outline-variant/30 bg-background">
        <header className="border-b border-outline-variant/20 bg-background/90">
          <div className="flex h-16 items-center justify-between px-4">
            <h2 className="font-display text-xl font-bold text-on-surface">Sonarat Akışı</h2>
            <div className="flex gap-3 text-primary">
              <Icon name="account_circle" />
              <Icon name="notifications" />
            </div>
          </div>
          <nav className="flex overflow-x-auto border-t border-outline-variant/20 px-4 pt-2 font-ticker text-sm">
            <button className="border-b-2 border-primary px-4 pb-2 font-bold text-primary">Anlık</button>
            <button className="px-4 pb-2 text-on-primary-container">Sana Özel</button>
            <button className="px-4 pb-2 text-on-primary-container">Ucuz Hisseler</button>
          </nav>
        </header>
        <div className="space-y-4 p-4">
          <div className="flex gap-2 overflow-x-auto border-b border-outline-variant/20 pb-3 font-ticker text-sm">
            {["$THYAO ▲ 2.4%", "$ASELS ▼ 1.2%", "$GARAN ▲ 0.8%"].map((item) => (
              <span key={item} className="shrink-0 rounded bg-surface-container-high px-3 py-1 text-primary">
                {item}
              </span>
            ))}
          </div>
          <article className="rounded-lg border border-white/10 bg-[#1e1e1e] p-5">
            <div className="mb-3 flex justify-between">
              <span className="rounded bg-primary/10 px-2 py-1 font-ticker text-sm text-primary">#MACRO</span>
              <span className="text-xs text-on-primary-container">10 dk önce</span>
            </div>
            <h3 className="font-display text-xl font-semibold text-on-surface">
              Merkez Bankası Faiz Kararını Açıkladı
            </h3>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              TCMB karar metninde enflasyon görünümündeki bozulmaya ve sıkı likidite duruşuna dikkat çekildi.
            </p>
            <div className="mt-4 flex gap-2">
              <button className="rounded border border-outline-variant/40 px-3 py-1.5 text-xs text-on-primary-container">
                Yorum Yap
              </button>
              <button className="rounded border border-gold/50 px-3 py-1.5 text-xs text-gold">Analiz</button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
