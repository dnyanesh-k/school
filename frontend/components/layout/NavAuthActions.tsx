"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";

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
        style={{ width: variant === "marketing" ? 148 : 72, height: 36 }}
        aria-hidden="true"
      />
    );
  }

  if (loggedIn) {
    return (
      <Link href={homeHref} style={primaryButtonStyle}>
        {homeLabel}
      </Link>
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

  return (
    <>
      <Link
        href="/login"
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--ink-500)",
          textDecoration: "none",
          padding: "6px 12px",
        }}
      >
        Sign in
      </Link>
      <Link href="/register" style={primaryButtonStyle}>
        Start trial
      </Link>
    </>
  );
}
