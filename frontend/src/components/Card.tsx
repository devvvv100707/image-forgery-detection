import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <article className={`rounded-card border border-line bg-white p-4 shadow-l1 ${className}`}>{children}</article>;
}
