import { useMemo, useState } from "react";
import Icon from "./Icon";

const initialPosts = [
  {
    id: "post-thyao",
    author: "Ece Varol",
    handle: "@ecevarol",
    role: "Havacilik analisti",
    symbol: "$THYAO",
    mood: "Pozitif",
    text: "KAP trafik verisi fiyatlanirken hacim 1.7x ortalamanin ustunde. Takip ettigim seviye 286 ustu kapanis.",
    likes: 128,
    dislikes: 9,
    comments: ["Doluluk orani guzel, marj tarafini da izlemek lazim.", "Alarm kurdum, 286 ustu bildirim gelsin."]
  },
  {
    id: "post-isctr",
    author: "Kerem Aksoy",
    handle: "@keremaksoy",
    role: "Banka masasi",
    symbol: "$ISCTR",
    mood: "Ucuz",
    text: "PD/DD ve hacim kombinasyonu bugun guclu. Bu tarz sinyallerde haber etkisi ile birlikte skor daha anlamli oluyor.",
    likes: 94,
    dislikes: 12,
    comments: ["Banka endeksiyle korelasyon kac?", "Temettu beklentisi tabloya eklenmeli."]
  },
  {
    id: "post-asels",
    author: "Derya K.",
    handle: "@deryak",
    role: "Akis editoru",
    symbol: "$ASELS",
    mood: "Hacim",
    text: "Savunma haberlerinde etki skoru yuksek ama carpan pahali. Sadece haberle degil, derinlik ve araci kurum dagilimi ile bakiyorum.",
    likes: 77,
    dislikes: 18,
    comments: ["Katiliyorum, tek basina haber yetmez."]
  }
];

export default function SocialMarketFeed({ selected, compact = false }) {
  const [session, setSession] = useState(null);
  const [login, setLogin] = useState({ email: "", nickname: "" });
  const [draft, setDraft] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [posts, setPosts] = useState(initialPosts);

  const trends = useMemo(
    () => [
      { tag: "$THYAO", label: "KAP trafik verisi", heat: 92 },
      { tag: "$ISCTR", label: "Ucuz banka carpanlari", heat: 84 },
      { tag: "$TUPRS", label: "Marj beklentisi", heat: 71 },
      { tag: "#BIST100", label: "Endeks direnci", heat: 66 }
    ],
    []
  );

  function signIn(event) {
    event.preventDefault();
    const name = login.nickname.trim() || login.email.split("@")[0] || "Sonarat Uyesi";
    setSession({ name, handle: `@${name.toLowerCase().replace(/[^a-z0-9]+/g, "") || "sonarat"}` });
  }

  function publishPost() {
    if (!draft.trim()) return;
    const author = session?.name || "Misafir Analist";
    const handle = session?.handle || "@misafir";
    setPosts((current) => [
      {
        id: `post-${Date.now()}`,
        author,
        handle,
        role: selected?.title || "Piyasa yorumu",
        symbol: inferSymbol(draft),
        mood: "Yeni",
        text: draft.trim(),
        likes: 0,
        dislikes: 0,
        comments: []
      },
      ...current
    ]);
    setDraft("");
  }

  function react(postId, key) {
    setPosts((current) => current.map((post) => (post.id === postId ? { ...post, [key]: post[key] + 1 } : post)));
  }

  function addComment(postId) {
    const text = (commentDrafts[postId] || "").trim();
    if (!text) return;
    setPosts((current) =>
      current.map((post) => (post.id === postId ? { ...post, comments: [...post.comments, text] } : post))
    );
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
  }

  return (
    <div className={`grid gap-5 ${compact ? "" : "xl:grid-cols-[minmax(0,1fr)_300px]"}`}>
      <section className="glass-panel rounded-xl p-5">
        <div className="flex flex-col gap-4 border-b border-outline-variant/20 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-ticker text-xs uppercase text-on-primary-container">Piyasa X</p>
            <h3 className="mt-1 font-display text-2xl font-bold text-on-surface">Sosyal piyasa akisi</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface-variant">
            <Icon name={session ? "verified_user" : "person"} className="text-[18px] text-primary" />
            {session ? `${session.name} olarak giris yapildi` : "Uye girisi bekleniyor"}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <LoginCard login={login} setLogin={setLogin} session={session} signIn={signIn} />
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-ticker text-primary">
                {(session?.name || "S").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={compact ? 2 : 3}
                  className="w-full resize-none rounded-lg border border-outline-variant/20 bg-background/80 p-3 text-sm text-on-surface outline-none placeholder:text-on-primary-container focus:border-primary/50"
                  placeholder="Piyasa yorumu yaz, hisse etiketi ekle: $THYAO, $ISCTR..."
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2 text-primary">
                    <Icon name="tag" className="text-[20px]" />
                    <Icon name="bar_chart" className="text-[20px]" />
                    <Icon name="insert_comment" className="text-[20px]" />
                  </div>
                  <button
                    type="button"
                    onClick={publishPost}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background disabled:opacity-40"
                    disabled={!draft.trim()}
                  >
                    Paylas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {posts.map((post) => (
            <article key={post.id} className="rounded-xl border border-outline-variant/20 bg-white/[0.02] p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-container-high font-display font-bold text-on-surface">
                  {post.author.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-on-surface">{post.author}</span>
                    <span className="font-ticker text-xs text-on-primary-container">{post.handle}</span>
                    <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 font-ticker text-[10px] text-primary">
                      {post.symbol}
                    </span>
                    <span className="rounded-md border border-gold/30 bg-gold/10 px-2 py-1 font-ticker text-[10px] text-gold">
                      {post.mood}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-on-primary-container">{post.role}</p>
                  <p className="mt-3 leading-6 text-on-surface-variant">{post.text}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionButton icon="thumb_up" label={post.likes} onClick={() => react(post.id, "likes")} />
                    <ActionButton icon="thumb_down" label={post.dislikes} onClick={() => react(post.id, "dislikes")} />
                    <ActionButton icon="mode_comment" label={post.comments.length} />
                    <ActionButton icon="ios_share" label="Paylas" />
                  </div>

                  <div className="mt-4 space-y-2">
                    {post.comments.map((comment, index) => (
                      <div key={`${post.id}-${index}`} className="rounded-lg bg-surface-container-lowest px-3 py-2 text-sm text-on-surface-variant">
                        {comment}
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        value={commentDrafts[post.id] || ""}
                        onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                        className="min-w-0 flex-1 rounded-lg border border-outline-variant/20 bg-background/80 px-3 py-2 text-sm text-on-surface outline-none placeholder:text-on-primary-container focus:border-primary/50"
                        placeholder="Yorum yaz"
                      />
                      <button
                        type="button"
                        onClick={() => addComment(post.id)}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/30 text-primary"
                        aria-label="Yorum gonder"
                      >
                        <Icon name="send" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {!compact && (
        <aside className="space-y-4">
          <div className="glass-panel rounded-xl p-4">
            <p className="font-ticker text-xs uppercase text-on-primary-container">Trend basliklar</p>
            <div className="mt-3 space-y-3">
              {trends.map((trend) => (
                <div key={trend.tag} className="rounded-lg border border-outline-variant/20 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-ticker text-primary">{trend.tag}</span>
                    <span className="font-ticker text-xs text-gold">{trend.heat}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-on-surface">{trend.label}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-surface-container-high">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${trend.heat}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="font-ticker text-xs uppercase text-on-primary-container">Topluluk kurallari</p>
            <div className="mt-3 space-y-2 text-sm text-on-surface-variant">
              <p>Yorumlar hisse etiketi, kaynak ve risk notu ile okunur.</p>
              <p>Like/dislike akisi kullanici guven skoru icin saklanir.</p>
              <p>Paylasimlar alarm ve haber motoruna baglanacak sekilde hazirlandi.</p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

function LoginCard({ login, setLogin, session, signIn }) {
  if (session) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
        <p className="font-ticker text-xs uppercase text-primary">Uye profili</p>
        <p className="mt-3 font-display text-xl font-bold text-on-surface">{session.name}</p>
        <p className="font-ticker text-xs text-on-primary-container">{session.handle}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <Metric value="12" label="Yorum" />
          <Metric value="84" label="Guven" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={signIn} className="rounded-xl border border-outline-variant/20 bg-white/[0.02] p-4">
      <p className="font-ticker text-xs uppercase text-on-primary-container">Uye girisi</p>
      <input
        value={login.email}
        onChange={(event) => setLogin((current) => ({ ...current, email: event.target.value }))}
        className="mt-3 w-full rounded-lg border border-outline-variant/20 bg-background/80 px-3 py-2 text-sm text-on-surface outline-none placeholder:text-on-primary-container"
        placeholder="mail@ornek.com"
      />
      <input
        value={login.nickname}
        onChange={(event) => setLogin((current) => ({ ...current, nickname: event.target.value }))}
        className="mt-2 w-full rounded-lg border border-outline-variant/20 bg-background/80 px-3 py-2 text-sm text-on-surface outline-none placeholder:text-on-primary-container"
        placeholder="Kullanici adi"
      />
      <button type="submit" className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background">
        Giris yap
      </button>
    </form>
  );
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/20 px-3 py-2 text-sm text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
    >
      <Icon name={icon} className="text-[18px]" />
      {label}
    </button>
  );
}

function Metric({ value, label }) {
  return (
    <div className="rounded-lg bg-surface-container-lowest p-2">
      <p className="font-ticker text-sm text-primary">{value}</p>
      <p className="font-ticker text-[10px] uppercase text-on-primary-container">{label}</p>
    </div>
  );
}

function inferSymbol(text) {
  const match = text.toUpperCase().match(/\$[A-Z]{3,5}/);
  return match?.[0] || "$BIST";
}
