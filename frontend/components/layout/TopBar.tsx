"use client";

import type { ReactNode } from "react";
import { useInstitute } from "@/contexts/InstituteContext";
import { LogoutButton } from "./LogoutButton";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { instituteName, loading } = useInstitute();

  return (
    <header className="vt-topbar">
      <div className="vt-topbar-left">
        {title ? (
          <>
            <span className="vt-topbar-page">{title}</span>
            <span className="vt-topbar-institute">
              {loading ? "Loading…" : instituteName || "My institute"}
            </span>
          </>
        ) : (
          <span className="vt-topbar-page">
            {loading ? "Loading…" : instituteName || "My institute"}
          </span>
        )}
      </div>

      <div className="vt-topbar-actions">
        <div className="vt-topbar-logout-wrap">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
