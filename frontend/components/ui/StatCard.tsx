import type { ReactNode } from "react";

export type StatTone = "brand" | "success" | "warning" | "neutral";

interface StatCardProps {
  label: string;
  value: string;
  tone?: StatTone;
}

export function StatCard({ label, value, tone = "brand" }: StatCardProps) {
  return (
    <div className={`vt-stat vt-stat--${tone}`}>
      <p className="vt-stat-label">{label}</p>
      <p className="vt-stat-value">{value}</p>
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="vt-stat-grid">{children}</div>;
}
