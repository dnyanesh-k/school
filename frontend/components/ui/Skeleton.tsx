import type { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div className={`vt-skeleton ${className}`.trim()} style={style} aria-hidden="true" />;
}

export function DashboardSkeleton() {
  return (
    <div className="animate-fadeUp">
      <div style={{ marginBottom: 20 }}>
        <Skeleton className="vt-skeleton-line" style={{ width: "55%", height: 28, marginBottom: 10 }} />
        <Skeleton className="vt-skeleton-line vt-skeleton-line-short" />
      </div>

      <div className="vt-stat-grid">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="vt-skeleton-stat" />
        ))}
      </div>

      <Skeleton className="vt-skeleton-line" style={{ width: "40%", marginBottom: 16 }} />

      <div className="vt-stack">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="vt-skeleton-card" />
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="vt-stack animate-fadeUp">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="vt-skeleton-card" />
      ))}
    </div>
  );
}
