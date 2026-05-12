import Icon from "./Icon";
import { moduleGroups, modules } from "../data/screens";

export default function Sidebar({ selectedId, onSelect }) {
  return (
    <aside className="hidden h-screen w-80 shrink-0 border-r border-outline-variant/20 bg-background/95 p-6 lg:flex lg:flex-col">
      <div className="mb-10">
        <div className="font-display text-3xl font-bold text-on-surface">Sonarat Akışı</div>
        <div className="mt-1 font-ticker text-xs uppercase text-on-primary-container">Terminal Access</div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-2">
        {moduleGroups.map((group) => {
          const items = modules.filter((item) => item.group === group);
          if (!items.length) return null;

          return (
            <div key={group} className="mb-6">
              <p className="mb-2 px-2 font-ticker text-[10px] uppercase text-on-primary-container">{group}</p>
              <div className="space-y-1">
                {items.map((item) => {
                  const active = item.id === selectedId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                        active
                          ? "border-r-2 border-primary bg-surface-container-high text-on-surface"
                          : "text-on-primary-container hover:bg-surface-container hover:text-on-surface"
                      }`}
                    >
                      <Icon name={item.icon} className="text-[20px]" />
                      <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
