import type { ReactNode } from "react";

export function ComparatorSlider({
  left,
  right,
  value,
  onChange,
}: {
  left: ReactNode;
  right: ReactNode;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="relative h-72 overflow-hidden rounded-card border border-line bg-slate-900">
      <div className="absolute inset-0">{right}</div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
        {left}
      </div>
      <div className="absolute bottom-0 top-0 w-px bg-white" style={{ left: `${value}%` }} />
      <input
        aria-label="Split position"
        className="absolute inset-0 cursor-ew-resize opacity-0"
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div
        className="pointer-events-none absolute top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white bg-white text-slate-900"
        style={{ left: `${value}%` }}
      >
        <span className="material-symbols-outlined text-[16px]">unfold_more</span>
      </div>
    </div>
  );
}
