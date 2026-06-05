"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { InstallAppButton } from "@/components/common/InstallAppButton";


interface NavAuthActionsProps {
  variant?: "marketing" | "auth";
  guestLinkLabel?: string;
  guestLinkHref?: string;
}

const primaryButtonStyle = {
  fontFamily: "var(--font-display)",
  fontSize: 12,
  fontWeight: 600,
  color: "white",
  background: "var(--brand-primary)",
  textDecoration: "none",
  padding: "8px 16px",
  borderRadius: "var(--radius-md)",
} as const;

export function NavAuthActions({
  variant = "marketing",
  guestLinkLabel = "Sign in",
  guestLinkHref = "/login",
}: NavAuthActionsProps) {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [homeHref, setHomeHref] = useState("/dashboard");
  const [homeLabel, setHomeLabel] = useState("Dashboard");

  useEffect(() => {
    const isLoggedIn = authService.isLoggedIn();
    setLoggedIn(isLoggedIn);
    if (isLoggedIn) {
      setHomeHref(authService.getHomeRoute());
      setHomeLabel(authService.isPlatformAdmin() ? "Admin" : "Dashboard");
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        style={{ width: variant === "marketing" ? 64 : 72, height: 36 }}
        aria-hidden="true"
      />
    );
  }

  if (loggedIn) {
    return (
      <>
        {/* Install button — desktop only to avoid navbar clutter on mobile */}
        <span className="nav-install-desktop">
          <InstallAppButton compact />
        </span>
        <Link href={homeHref} style={primaryButtonStyle}>
          {homeLabel}
        </Link>
      </>
    );
  }

  if (variant === "auth") {
    return (
      <Link
        href={guestLinkHref}
        style={{
          fontSize: "13px",
          color: "var(--brand-primary)",
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        {guestLinkLabel}
      </Link>
    );
  }

  // Guest + marketing: Sign in as a soft outlined pill
  return (
    <Link
      href="/login"
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "var(--ink-700)",
        textDecoration: "none",
        padding: "7px 14px",
        border: "1px solid var(--ink-300)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-0)",
      }}
    >
      Sign in
    </Link>
  );
}
