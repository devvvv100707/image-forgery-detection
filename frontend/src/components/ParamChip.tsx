export function ParamChip({ children }: { children: string }) {
  return (
    <span className="rounded-control border border-line bg-module px-2 py-1 font-mono text-[11px] font-medium text-slate-600">
      {children}
    </span>
  );
}
