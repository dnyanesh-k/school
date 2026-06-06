import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/contact", label: "Contact us" },
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/terms-of-service", label: "Terms of service" },
] as const;

export function MarketingFooter() {
  return (
    <footer style={{ background: "var(--ink-900)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 20px 24px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 14 }}>
          VidyaTrack
        </div>

        <nav style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 16px", marginBottom: 16 }}>
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "rgba(255,255,255,0.55)",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
          Manage with AI · Attendance, fees, WhatsApp & voice follow-ups
        </p>

        <span style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>
          © {new Date().getFullYear()} VidyaTrack
        </span>
      </div>
    </footer>
  );
}
