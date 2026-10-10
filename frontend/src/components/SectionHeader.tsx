import type { ReactNode } from "react";

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-caption uppercase text-brand">{eyebrow}</p>}
        <h2 className="text-headline-md text-slate-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}
