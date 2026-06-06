import Link from "next/link";
import { MarketingPageLayout, MarketingProse, MarketingSectionTitle } from "@/components/layout/MarketingPageLayout";

const PHONE = "919096100340";
const PHONE_DISPLAY = "+91 90961 00340";
const WA_MESSAGE = encodeURIComponent("Hi, I'm interested in VidyaTrack for my institute. Can you give me a quick demo?");

export default function ContactPage() {
  return (
    <MarketingPageLayout
      title="Contact us"
      subtitle="Have questions about VidyaTrack? Call or WhatsApp us — we respond fast."
    >
      {/* Contact cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        margin: "32px 0",
      }}>
        {/* WhatsApp card */}
        <a
          href={`https://wa.me/${PHONE}?text=${WA_MESSAGE}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <div style={{
            background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
            borderRadius: 16,
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            boxShadow: "0 4px 24px rgba(37,211,102,0.25)",
            transition: "transform 0.15s",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.532 5.849L.057 23.571a.5.5 0 00.614.614l5.723-1.474A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.92 0-3.72-.504-5.28-1.384l-.378-.219-3.924 1.011 1.012-3.924-.22-.378A9.951 9.951 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 }}>WhatsApp us</p>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: "4px 0 0" }}>{PHONE_DISPLAY}</p>
            </div>
            <span style={{
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 20,
            }}>
              Tap to chat
            </span>
          </div>
        </a>

        {/* Call card */}
        <a href={`tel:+${PHONE}`} style={{ textDecoration: "none" }}>
          <div style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            borderRadius: 16,
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            boxShadow: "0 4px 24px rgba(79,70,229,0.25)",
            transition: "transform 0.15s",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.13 1.01.37 2 .72 2.96a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.12-1.12a2 2 0 012.11-.45c.96.35 1.95.59 2.96.72A2 2 0 0122 16.92z"/>
            </svg>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 }}>Call us</p>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: "4px 0 0" }}>{PHONE_DISPLAY}</p>
            </div>
            <span style={{
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 20,
            }}>
              Tap to call
            </span>
          </div>
        </a>
      </div>

      <MarketingSectionTitle>Email us</MarketingSectionTitle>
      <MarketingProse>
        Prefer email? Reach us at{" "}
        <a href="mailto:vidyatrackai@gmail.com" style={{ color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}>
          vidyatrackai@gmail.com
        </a>
        {" "}— we reply within one business day.
      </MarketingProse>

      <MarketingSectionTitle>Get started</MarketingSectionTitle>
      <MarketingProse style={{ marginBottom: 16 }}>
        Ready to try VidyaTrack? Setup takes about 5 minutes.
      </MarketingProse>
      <Link
        href="/register"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 20px",
          borderRadius: "var(--radius-md)",
          background: "var(--brand-primary)",
          color: "#fff",
          fontFamily: "var(--font-display)",
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Get started free
      </Link>
    </MarketingPageLayout>
  );
}
