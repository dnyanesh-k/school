import { MarketingPageLayout, MarketingProse, MarketingSectionTitle } from "@/components/layout/MarketingPageLayout";

export default function TermsPage() {
  return (
    <MarketingPageLayout
      title="Terms of service"
      subtitle="Terms governing your use of VidyaTrack."
    >
      <MarketingProse>
        By using VidyaTrack, you agree to these terms. If you do not agree, please do not use the service. Last updated: May 2025.
      </MarketingProse>
      <MarketingSectionTitle>Service</MarketingSectionTitle>
      <MarketingProse>
        VidyaTrack provides cloud-based tools for school administration including attendance, fees, results, and parent communication. Features may vary by subscription plan.
      </MarketingProse>
      <MarketingSectionTitle>Free trial & billing</MarketingSectionTitle>
      <MarketingProse>
        New institutes receive a 14-day free trial. After the trial, you must select a paid plan based on your student count. Failure to subscribe may result in limited or suspended access.
      </MarketingProse>
      <MarketingSectionTitle>Your responsibilities</MarketingSectionTitle>
      <MarketingProse>
        You are responsible for the accuracy of data entered, obtaining consent from parents for communications, and keeping login credentials secure. You must comply with applicable laws including data protection regulations.
      </MarketingProse>
      <MarketingSectionTitle>Acceptable use</MarketingSectionTitle>
      <MarketingProse>
        You may not misuse the platform, attempt unauthorized access, or use automated messaging in violation of WhatsApp or telecom provider policies.
      </MarketingProse>
      <MarketingSectionTitle>Limitation of liability</MarketingSectionTitle>
      <MarketingProse>
        VidyaTrack is provided &ldquo;as is&rdquo;. We are not liable for indirect damages. Our total liability is limited to fees paid in the twelve months preceding a claim.
      </MarketingProse>
      <MarketingSectionTitle>Contact</MarketingSectionTitle>
      <MarketingProse style={{ marginBottom: 0 }}>
        Questions about these terms? Email{" "}
        <a href="mailto:vidyatrackai@gmail.com" style={{ color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}>
          legal
        </a>
        .
      </MarketingProse>
    </MarketingPageLayout>
  );
}
