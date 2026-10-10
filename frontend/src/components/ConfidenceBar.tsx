export function ConfidenceBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value * 100));
  return (
    <div className="h-2 overflow-hidden rounded-control bg-rose-100">
      <div className="h-full bg-manipulated" style={{ width: `${width}%` }} />
    </div>
  );
}
