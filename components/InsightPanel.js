import { Activity, BellRing, ScanSearch, ShieldCheck } from "lucide-react";

const metrics = [
  { label: "Aktif alarm", value: "42", icon: BellRing },
  { label: "Taranan kaynak", value: "1.8K", icon: ScanSearch },
  { label: "Eşik üstü sinyal", value: "12", icon: Activity },
  { label: "Doğrulanan olay", value: "91%", icon: ShieldCheck }
];

export default function InsightPanel() {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {metrics.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-lg border border-white/10 bg-panel p-4">
          <Icon className="h-5 w-5 text-emeraldSignal" />
          <p className="mt-4 text-2xl font-semibold text-mist">{value}</p>
          <p className="mt-1 text-sm text-muted">{label}</p>
        </div>
      ))}
    </section>
  );
}
