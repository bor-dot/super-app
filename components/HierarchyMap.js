import { GitBranch, Network } from "lucide-react";
import { hierarchy } from "../data/news";

export default function HierarchyMap() {
  return (
    <section className="rounded-lg border border-white/10 bg-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emeraldSignal">Kurumsal harita</p>
          <h2 className="mt-1 text-lg font-semibold text-mist">Hiyerarşi ve iştirak radarları</h2>
        </div>
        <Network className="h-5 w-5 text-emeraldSignal" />
      </div>
      <div className="mt-5 space-y-3">
        {hierarchy.map((node, index) => (
          <div key={node.name} className="relative flex items-center gap-3">
            {index < hierarchy.length - 1 && (
              <span className="absolute left-4 top-8 h-7 w-px bg-white/10" aria-hidden="true" />
            )}
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-emeraldSignal/30 bg-emeraldSignal/10">
              <GitBranch className="h-4 w-4 text-emeraldSignal" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold text-mist">{node.name}</p>
                <p className="text-xs text-muted">{node.score}</p>
              </div>
              <p className="text-xs text-muted">{node.type}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-emeraldSignal" style={{ width: `${node.score}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
