"use client";

// Shared layout for all auth pages — register, login, forgot password
// Extracted from RegisterPage header — zero design changes

export function AuthLayout({
  children,
  topRightLabel,
  topRightHref,
}: {
  children: React.ReactNode;
  topRightLabel: string;
  topRightHref: string;
}) {
  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--surface-1)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-body)",
    }}>
      {/* ── Header strip ── */}
      <div style={{
        padding: "18px 20px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        background: "var(--surface-0)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: "var(--radius-sm)",
            background: "var(--brand-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2L3 6v6l6 4 6-4V6L9 2z"
                stroke="white" strokeWidth="1.5" strokeLinejoin="round"
                fill="rgba(255,255,255,0.15)"
              />
              <path d="M9 10V7M7.5 8.5h3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "17px",
            color: "var(--ink-900)",
            letterSpacing: "-0.02em",
          }}>
            VidyaTrack
          </span>
        </div>

        {/* Top right link */}
        <a href={topRightHref} style={{
          fontSize: "13px",
          color: "var(--brand-primary)",
          fontWeight: 500,
          textDecoration: "none",
        }}>
          {topRightLabel}
        </a>
      </div>

      {/* ── Page content ── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 20px 40px",
        maxWidth: "480px",
        width: "100%",
        margin: "0 auto",
      }}>
        {children}
      </div>
    </div>
  );
}