import { MarketingPageLayout, MarketingProse, MarketingSectionTitle } from "@/components/layout/MarketingPageLayout";

export default function PrivacyPage() {
  return (
    <MarketingPageLayout
      title="Privacy policy"
      subtitle="How VidyaTrack collects, uses, and protects your data."
    >
      <MarketingProse>
        This policy describes how VidyaTrack (&ldquo;we&rdquo;, &ldquo;us&rdquo;) handles information when you use our school management platform. Last updated: May 2025.
      </MarketingProse>
      <MarketingSectionTitle>Information we collect</MarketingSectionTitle>
      <MarketingProse>
        We collect information you provide when registering your institute — school name, admin email, student and parent contact details, attendance records, fee data, and exam results. We also collect usage data to improve the product.
      </MarketingProse>
      <MarketingSectionTitle>How we use it</MarketingSectionTitle>
      <MarketingProse>
        Data is used to operate the service: attendance tracking, fee collection, result publishing, and parent communications via WhatsApp or voice. We do not sell personal data to third parties.
      </MarketingProse>
      <MarketingSectionTitle>Data security</MarketingSectionTitle>
      <MarketingProse>
        We use industry-standard safeguards including encrypted connections and access controls. Only authorized institute staff can access your school&apos;s data.
      </MarketingProse>
      <MarketingSectionTitle>Your rights</MarketingSectionTitle>
      <MarketingProse>
        Institute admins may request access, correction, or deletion of data by contacting{" "}
        <a href="mailto:support@vidyatrack.com" style={{ color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}>
          support@vidyatrack.com
        </a>
        .
      </MarketingProse>
      <MarketingSectionTitle>Contact</MarketingSectionTitle>
      <MarketingProse style={{ marginBottom: 0 }}>
        Questions about this policy? Email{" "}
        <a href="mailto:privacy@vidyatrack.com" style={{ color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}>
          privacy@vidyatrack.com
        </a>
        .
      </MarketingProse>
    </MarketingPageLayout>
  );
}
