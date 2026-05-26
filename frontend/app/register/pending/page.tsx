"use client";

import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";

export default function RegisterPendingPage() {
  return (
    <AuthLayout topRightLabel="Sign in" topRightHref="/login">
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--brand-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v5l3 2" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" stroke="var(--brand-primary)" strokeWidth="2" />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--ink-900)",
            marginBottom: 10,
          }}
        >
          Registration submitted
        </h1>

        <p style={{ fontSize: "15px", color: "var(--ink-500)", lineHeight: 1.7, marginBottom: 28, maxWidth: 360, marginInline: "auto" }}>
          Your institute is pending approval from the VidyaTrack team. You&apos;ll be able to sign in once your account is activated.
        </p>

        <Link href="/login" style={{ textDecoration: "none" }}>
          <Button variant="primary" fullWidth>
            Back to sign in
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
