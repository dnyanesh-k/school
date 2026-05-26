"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    if (!authService.isPlatformAdmin()) {
      router.replace(authService.getHomeRoute());
    }
  }, [router]);

  return (
    <div style={{ minHeight: "100dvh", background: "var(--surface-1)", fontFamily: "var(--font-body)" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--surface-0)",
          borderBottom: "1px solid var(--ink-200)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-sm)",
              background: "var(--brand-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2l7 4v6c0 5-3 9-7 10C8 21 5 17 5 12V6l7-4z" />
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px", color: "var(--ink-900)" }}>
              VidyaTrack Admin
            </p>
            <p style={{ fontSize: "11px", color: "var(--ink-500)" }}>Platform control panel</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => authService.logout()}
          style={{
            border: "1px solid var(--ink-200)",
            background: "var(--surface-0)",
            borderRadius: "var(--radius-md)",
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--ink-700)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          Logout
        </button>
      </header>

      <main style={{ padding: "16px", maxWidth: 720, margin: "0 auto" }}>{children}</main>
    </div>
  );
}
