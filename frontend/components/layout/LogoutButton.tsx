"use client";

import { authService } from "@/services/authService";

interface LogoutButtonProps {
  /** Sidebar uses a slightly wider layout; default is compact text button */
  variant?: "compact" | "sidebar";
}

export function LogoutButton({ variant = "compact" }: LogoutButtonProps) {
  return (
    <button
      type="button"
      className={`vt-logout-btn${variant === "sidebar" ? " vt-logout-btn--sidebar" : ""}`}
      onClick={() => authService.logout()}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Log out
    </button>
  );
}
