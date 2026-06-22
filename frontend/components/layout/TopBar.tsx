"use client";

import { useInstitute } from "@/contexts/InstituteContext";
import { BrandLink } from "./BrandLink";
import { LogoutButton } from "./LogoutButton";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { instituteName, loading, user } = useInstitute();
  const subtitle = instituteName || user?.full_name || "VidyaTrack";

  return (
    <header className="vt-topbar">
      <BrandLink icon="chart" showName={false} className="vt-topbar-brand" />
      <div className="vt-topbar-left">
        {title ? (
          <>
            <span className="vt-topbar-page">{title}</span>
            <span className="vt-topbar-institute">
              {loading ? "Loading…" : subtitle}
            </span>
          </>
        ) : (
          <span className="vt-topbar-page">
            {loading ? "Loading…" : subtitle}
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
