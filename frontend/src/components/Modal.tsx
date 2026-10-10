import type { ReactNode } from "react";

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/70 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-card border border-slate-400 bg-canvas p-4 shadow-l3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-headline-md">{title}</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
