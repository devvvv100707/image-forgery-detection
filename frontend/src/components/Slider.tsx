export function Slider({
  label,
  hint,
  min,
  max,
  value,
  suffix,
  onChange,
}: {
  label: string;
  hint: string;
  min: number;
  max: number;
  value: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-body-sm">
        <span className="font-semibold text-slate-800">{label}</span>
        <span className="font-mono text-[12px] font-medium tabular text-brand">
          {value}
          {suffix}
        </span>
      </div>
      <input
        className="w-full accent-brand"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <p className="mt-1 text-body-sm text-slate-500">{hint}</p>
    </label>
  );
}
