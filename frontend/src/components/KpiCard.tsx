import { Tooltip } from "./Tooltip";

export function KpiCard({
  label,
  value,
  delta,
  note,
  formula,
}: {
  label: string;
  value: string;
  delta?: string;
  note?: string;
  formula: string;
}) {
  return (
    <article className="rounded-card border border-line bg-white p-4 shadow-l1">
      <div className="flex items-center gap-1 text-caption uppercase text-slate-500">
        {label}
        <Tooltip text={formula}>i</Tooltip>
      </div>
      <p className="mt-2 font-mono text-[28px] font-medium leading-none tabular text-slate-900">{value}</p>
      {delta && <p className="mt-2 font-mono text-[11px] text-authentic-text">{delta}</p>}
      {note && <p className="mt-2 rounded-control bg-module px-2 py-1 text-[11px] text-slate-500">{note}</p>}
    </article>
  );
}
