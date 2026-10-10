export function Toast({ message, onClose }: { message: string | null; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-card border border-slate-400 bg-slate-900 px-4 py-3 text-white shadow-l3">
      <div>
        <p className="text-body-sm font-semibold">Action Processed</p>
        <p className="text-body-sm text-slate-300">{message}</p>
      </div>
      <button type="button" className="text-body-sm" onClick={onClose} aria-label="Dismiss notification">
        Close
      </button>
    </div>
  );
}
