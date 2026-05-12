import { Building2, Clock3, RadioTower } from "lucide-react";
import StatusPill from "./StatusPill";

export default function NewsCard({ item }) {
  return (
    <article className="rounded-lg border border-white/10 bg-[#151c19] p-4 shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted">
          <Building2 className="h-4 w-4 shrink-0 text-emeraldSignal" />
          <span className="truncate">{item.source}</span>
        </div>
        <StatusPill tone={item.tone}>{item.impact}</StatusPill>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug text-mist">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{item.summary}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {item.tags.map((tag) => (
          <span key={tag} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-mist/85">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" />
          {item.time}
        </span>
        <span className="inline-flex items-center gap-1.5 text-emeraldSignal">
          <RadioTower className="h-3.5 w-3.5" />
          Alarm aktif
        </span>
      </div>
    </article>
  );
}
