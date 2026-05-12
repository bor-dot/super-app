export default function ToggleRow({ label, detail, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-emeraldSignal/40 hover:bg-emeraldSignal/[0.055]"
    >
      <span>
        <span className="block text-sm font-semibold text-mist">{label}</span>
        <span className="mt-0.5 block text-xs text-muted">{detail}</span>
      </span>
      <span
        className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
          checked ? "bg-emeraldSignal" : "bg-white/12"
        }`}
        aria-hidden="true"
      >
        <span
          className={`h-5 w-5 rounded-full bg-ink shadow transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
