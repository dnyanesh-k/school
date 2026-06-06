"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

interface BrandLinkProps {
  icon?: string;   // kept for backward compat — ignored, always uses PNG
  size?: "sm" | "md";
  showName?: boolean;
  name?: ReactNode;
  className?: string;
}

export function BrandLink({
  size = "sm",
  showName = true,
  name = "VidyaTrack",
  className,
}: BrandLinkProps) {
  const pathname = usePathname();
  const boxSize = size === "md" ? 32 : 28;
  const nameStyle =
    size === "md"
      ? {
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "17px",
          color: "var(--ink-900)",
          letterSpacing: "-0.02em",
        }
      : {
          fontFamily: "var(--font-display)",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--ink-900)",
          letterSpacing: "-0.03em",
        };

  return (
    <Link
      href="/"
      aria-label="VidyaTrack home"
      className={className}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        if (pathname === "/") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
      style={{
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-192.png"
        alt="VidyaTrack"
        width={boxSize}
        height={boxSize}
        style={{ borderRadius: size === "md" ? "var(--radius-sm)" : 7, display: "block" }}
      />
      {showName ? <span style={nameStyle}>{name}</span> : null}
    </Link>
  );
}
