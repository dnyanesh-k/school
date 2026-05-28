import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { MarketingNavbar } from "./MarketingNavbar";
import { MarketingFooter } from "./MarketingFooter";

const proseBlock = {
  fontSize: 14,
  color: "var(--ink-600)",
  lineHeight: 1.65,
  marginBottom: 14,
} as const;

const proseHeading = {
  fontFamily: "var(--font-display)",
  fontSize: 15,
  fontWeight: 700,
  color: "var(--ink-900)",
  marginTop: 22,
  marginBottom: 8,
} as const;

export function MarketingProse({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return <p style={{ ...proseBlock, ...style }}>{children}</p>;
}

export function MarketingSectionTitle({ children }: { children: ReactNode }) {
  return <h2 style={proseHeading}>{children}</h2>;
}

export function MarketingPageLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ overflowX: "hidden", minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--surface-0)" }}>
      <MarketingNavbar />
      <main style={{ flex: 1, padding: "80px 20px 48px", width: "100%" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", width: "100%" }}>
          <Link
            href="/"
            style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-primary)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}
          >
            ← Back to home
          </Link>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(26px, 6vw, 32px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--ink-900)",
            lineHeight: 1.15,
            marginBottom: subtitle ? 10 : 24,
          }}>
            {title}
          </h1>

          {subtitle && (
            <p style={{ fontSize: 15, color: "var(--ink-500)", lineHeight: 1.55, marginBottom: 28 }}>
              {subtitle}
            </p>
          )}

          <div style={{
            background: "var(--surface-0)",
            border: "1px solid var(--ink-200)",
            borderRadius: "var(--radius-lg)",
            padding: "22px 18px",
            boxShadow: "var(--shadow-sm)",
          }}>
            {children}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
