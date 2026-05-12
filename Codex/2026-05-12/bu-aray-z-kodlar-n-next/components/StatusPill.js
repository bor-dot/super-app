export default function StatusPill({ tone = "emerald", children }) {
  const tones = {
    emerald: "border-emeraldSignal/30 bg-emeraldSignal/10 text-emeraldSignal",
    amber: "border-amberSignal/30 bg-amberSignal/10 text-amberSignal",
    coral: "border-coralSignal/30 bg-coralSignal/10 text-coralSignal"
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
