export function SegmentedToggle({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex rounded-control border border-line bg-module p-0.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`rounded-control px-2.5 py-1 text-[12px] font-semibold ${value === option ? "bg-white text-brand shadow-l1" : "text-slate-500"}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
