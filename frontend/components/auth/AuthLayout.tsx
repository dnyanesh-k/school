"use client";

import { BrandLink } from "@/components/layout/BrandLink";
import { NavAuthActions } from "@/components/layout/NavAuthActions";

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
        <BrandLink icon="school" size="md" />

        <NavAuthActions
          variant="auth"
          guestLinkLabel={topRightLabel}
          guestLinkHref={topRightHref}
        />
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
