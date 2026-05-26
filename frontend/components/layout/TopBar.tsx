"use client";

import { authService } from "@/services/authService";

export function TopBar({ title }: { title: string }) {
  return (
    <>
      <header className="vt-topbar">

        {/* Left — logo mark + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: "var(--radius-sm)",
            background: "var(--brand-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L3 6v6l6 4 6-4V6L9 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(255,255,255,0.15)"/>
              <path d="M9 10V7M7.5 8.5h3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "15px",
            color: "var(--ink-900)",
            letterSpacing: "-0.02em",
          }}>
            {title}
          </span>
        </div>

        {/* Right — logout on mobile only */}
        <button
          className="vt-topbar-logout"
          onClick={() => authService.logout()}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none",
            cursor: "pointer", padding: "6px 10px",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
              stroke="var(--ink-500)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: "13px", color: "var(--ink-500)", fontFamily: "var(--font-body)" }}>
            Logout
          </span>
        </button>

      </header>

      {/* Spacer so content doesn't hide under fixed topbar */}
      <div style={{ height: "57px" }} />
    </>
  );
}