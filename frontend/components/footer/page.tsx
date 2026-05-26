/* ─── Footer ────────────────────────────────────────────────────────── */

import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ background: "var(--ink-900)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "48px 24px 32px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>VidyaTrack</span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Security", "Contact"].map((l) => (
            <Link key={l} href="#" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: 12 }}>{l}</Link>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2025 VidyaTrack. All rights reserved.</span>
      </div>
    </footer>
  );
}