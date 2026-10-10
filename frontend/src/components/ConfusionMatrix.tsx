export function ConfusionMatrix({ tn, fp, fn, tp }: { tn: number; fp: number; fn: number; tp: number }) {
  const cell = "rounded-card p-4 text-white";
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className={`${cell} bg-sky-600`}>
        <p className="text-[11px] uppercase">True Authentic (TN)</p>
        <p className="font-mono text-[28px] tabular">{tn.toLocaleString()}</p>
      </div>
      <div className={`${cell} bg-rose-500`}>
        <p className="text-[11px] uppercase">False Authentic (FP)</p>
        <p className="font-mono text-[28px] tabular">{fp.toLocaleString()}</p>
      </div>
      <div className={`${cell} bg-rose-600`}>
        <p className="text-[11px] uppercase">False Authentic (FN)</p>
        <p className="font-mono text-[28px] tabular">{fn.toLocaleString()}</p>
      </div>
      <div className={`${cell} bg-brand`}>
        <p className="text-[11px] uppercase">True Tampered (TP)</p>
        <p className="font-mono text-[28px] tabular">{tp.toLocaleString()}</p>
      </div>
    </div>
  );
}
