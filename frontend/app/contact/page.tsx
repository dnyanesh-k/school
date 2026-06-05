import Link from "next/link";
import { MarketingPageLayout, MarketingProse, MarketingSectionTitle } from "@/components/layout/MarketingPageLayout";

export default function ContactPage() {
  return (
    <MarketingPageLayout
      title="Contact us"
      subtitle="Questions about VidyaTrack, pricing, or a demo? We're here to help."
    >
      <MarketingSectionTitle>Sales & demos</MarketingSectionTitle>
      <MarketingProse>
        Interested in VidyaTrack for your school? Email us at{" "}
        <a href="mailto:vidyatrackai@gmail.com" style={{ color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}>
          sales
        </a>
        {" "}for a walkthrough or enterprise pricing (2,000+ students).
      </MarketingProse>
      <MarketingSectionTitle>Support</MarketingSectionTitle>
      <MarketingProse>
        Existing customers: reach support at{" "}
        <a href="mailto:vidyatrackai@gmail.com" style={{ color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}>
          support
        </a>
        . We typically respond within one business day.
      </MarketingProse>
      <MarketingSectionTitle>Start a trial</MarketingSectionTitle>
      <MarketingProse style={{ marginBottom: 16 }}>
        Ready to try VidyaTrack? Start your 14-day free trial — setup takes about 5 minutes.
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
        Start 14-day trial
      </Link>
    </MarketingPageLayout>
  );
}
