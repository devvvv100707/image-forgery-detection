import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "destructive" | "mono";

const styles: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover active:bg-brand-active",
  secondary: "bg-white text-slate-900 border border-line hover:border-slate-300",
  destructive: "bg-manipulated-bg text-manipulated-text border border-manipulated-border",
  mono: "bg-slate-900 text-white font-mono text-[12px]",
};

export function Button({
  variant = "primary",
  children,
  shortcut,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; shortcut?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-body-md font-semibold disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
      {shortcut && <span className="font-mono text-[11px] opacity-80">{shortcut}</span>}
    </button>
  );
}
