"use client";

import { useEffect, useState } from "react";
import { BrandLink } from "./BrandLink";
import { NavAuthActions } from "./NavAuthActions";

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        height: 56,
        background: scrolled ? "rgba(255,255,255,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--ink-200)" : "1px solid transparent",
        transition: "all 0.2s ease",
      }}
    >
      <BrandLink icon="chart" size="sm" />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <NavAuthActions variant="marketing" />
      </div>
    </nav>
  );
}
