import type { ReactNode } from "react";

interface PillTagProps {
  children: ReactNode;
  tone?: "primary" | "neutral";
}

export function PillTag({ children, tone = "primary" }: PillTagProps) {
  const toneClass =
    tone === "primary"
      ? "bg-primary/10 text-primary border-primary/40"
      : "bg-background-card text-text-secondary border-border-medium";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase ${toneClass}`}>
      {children}
    </span>
  );
}
