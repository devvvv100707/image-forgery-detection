import type { ReactNode } from "react";

export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      <button type="button" className="grid h-4 w-4 place-items-center rounded-full border border-line text-[10px] text-slate-500" aria-label={text}>
        {children}
      </button>
      <span className="pointer-events-none absolute left-1/2 top-6 z-20 hidden w-56 -translate-x-1/2 rounded-control border border-slate-400 bg-slate-900 p-2 font-mono text-[11px] text-white shadow-l3 group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  );
}
