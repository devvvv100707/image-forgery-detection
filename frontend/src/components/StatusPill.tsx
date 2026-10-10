type Kind = "authentic" | "manipulated" | "indeterminate" | "live" | "neutral";

const styles: Record<Kind, string> = {
  authentic: "bg-authentic-bg text-authentic-text border-authentic-border",
  manipulated: "bg-manipulated-bg text-manipulated-text border-manipulated-border",
  indeterminate: "bg-indeterminate-bg text-indeterminate-text border-indeterminate-border",
  live: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
  neutral: "bg-module text-slate-600 border-line",
};

export function StatusPill({ kind, children, pulse = false }: { kind: Kind; children: string; pulse?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-control border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles[kind]}`}>
      <span className={`h-1.5 w-1.5 rounded-full bg-current ${pulse ? "pulse-dot" : ""}`} />
      {children}
    </span>
  );
}
