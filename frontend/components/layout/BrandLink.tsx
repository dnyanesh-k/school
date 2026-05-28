"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

type BrandIcon = "chart" | "school" | "shield";

function BrandIconMark({ icon }: { icon: BrandIcon }) {
  if (icon === "school") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 2L3 6v6l6 4 6-4V6L9 2z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="rgba(255,255,255,0.15)"
        />
        <path d="M9 10V7M7.5 8.5h3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "shield") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M12 2l7 4v6c0 5-3 9-7 10C8 21 5 17 5 12V6l7-4z" />
      </svg>
    );
  }

  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12l3-7 3.5 4 2.5-4 2.5 7" />
    </svg>
  );
}

interface BrandLinkProps {
  icon?: BrandIcon;
  size?: "sm" | "md";
  showName?: boolean;
  name?: ReactNode;
  className?: string;
}

export function BrandLink({
  icon = "chart",
  size = "sm",
  showName = true,
  name = "VidyaTrack",
  className,
}: BrandLinkProps) {
  const pathname = usePathname();
  const boxSize = size === "md" ? 32 : 28;
  const borderRadius = size === "md" ? "var(--radius-sm)" : 7;
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
      <div
        style={{
          width: boxSize,
          height: boxSize,
          borderRadius,
          background: "var(--brand-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BrandIconMark icon={icon} />
      </div>
      {showName ? <span style={nameStyle}>{name}</span> : null}
    </Link>
  );
}
