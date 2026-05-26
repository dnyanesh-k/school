"use client";

import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/services/authService";

const NAV_ITEMS = [
  {
    label: "Students",
    href: "/dashboard/students",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75" strokeLinecap="round"/>
        <circle cx="9" cy="7" r="4" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Attendance",
    href: "/dashboard/attendance",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75"/>
        <path d="M16 2v4M8 2v4M3 10h18" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75" strokeLinecap="round"/>
        <path d="M9 16l2 2 4-4" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Tests",
    href: "/dashboard/tests",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75" strokeLinejoin="round"/>
        <path d="M14 2v6h6M9 13h6M9 17h4" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75"/>
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  return (
    <aside style={{
      width: "220px",
      height: "100vh",
      position: "fixed",
      top: 0, left: 0,
      background: "var(--surface-0)",
      borderRight: "1px solid var(--ink-200)",
      display: "flex",
      flexDirection: "column",
      zIndex: 100,
      padding: "20px 0",
    }}>

      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "0 20px 24px",
        borderBottom: "1px solid var(--ink-200)",
      }}>
        <div style={{
          width: 30, height: 30,
          borderRadius: "var(--radius-sm)",
          background: "var(--brand-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L3 6v6l6 4 6-4V6L9 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(255,255,255,0.15)"/>
            <path d="M9 10V7M7.5 8.5h3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "15px", color: "var(--ink-900)", letterSpacing: "-0.02em",
        }}>
          VidyaTrack
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                background: active ? "var(--brand-accent)" : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s ease",
                width: "100%",
              }}
            >
              {item.icon(active)}
              <span style={{
                fontSize: "14px",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--brand-primary)" : "var(--ink-700)",
                fontFamily: "var(--font-body)",
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}