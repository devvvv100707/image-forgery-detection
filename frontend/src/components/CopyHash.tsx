import { useState } from "react";

export function CopyHash({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="block max-w-full truncate text-left font-mono text-[11px] text-slate-500"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
    >
      SHA256: {value.slice(0, 28)}… {copied ? "Copied" : "Copy"}
    </button>
  );
}
