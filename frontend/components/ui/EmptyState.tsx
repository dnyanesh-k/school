"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="vt-empty animate-fadeUp">
      {icon ? <div className="vt-empty-icon">{icon}</div> : null}
      <p className="vt-empty-title">{title}</p>
      <p className="vt-empty-desc">{description}</p>
    </div>
  );
}
