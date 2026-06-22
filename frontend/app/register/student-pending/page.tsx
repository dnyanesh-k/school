"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";

export default function StudentPendingPage() {
  return (
    <AuthLayout topRightLabel="" topRightHref="">
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "22px", color: "var(--ink-900)", marginBottom: 10 }}>
          Registration received!
        </h1>
        <p style={{ fontSize: "14px", color: "var(--ink-600)", lineHeight: 1.6, maxWidth: 320, margin: "0 auto 24px" }}>
          Your account is under review. You'll be able to log in once our team approves it — usually within 24 hours.
        </p>
        <a
          href="/login"
          style={{ display: "inline-block", padding: "12px 28px", background: "var(--brand-primary)", color: "#fff", borderRadius: "var(--radius-full)", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}
        >
          Back to Login
        </a>
      </div>
    </AuthLayout>
  );
}
