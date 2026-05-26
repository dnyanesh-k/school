"use client";

import { usePathname, useRouter } from "next/navigation";

const TABS = [
  {
    label: "Students",
    href: "/dashboard/students",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75" strokeLinecap="round"/>
        <circle cx="9" cy="7" r="4" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Attendance",
    href: "/dashboard/attendance",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75"/>
        <path d="M16 2v4M8 2v4M3 10h18" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75" strokeLinecap="round"/>
        <path d="M9 16l2 2 4-4" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Tests",
    href: "/dashboard/tests",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75" strokeLinejoin="round"/>
        <path d="M14 2v6h6M9 13h6M9 17h4" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75"/>
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={active ? "var(--brand-primary)" : "var(--ink-400)"} strokeWidth="1.75" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function BottomTab() {
  const pathname  = usePathname();
  const router    = useRouter();

  return (
    <nav style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      height: "64px",
      background: "var(--surface-0)",
      borderTop: "1px solid var(--ink-200)",
      display: "flex",
      alignItems: "center",
      zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {TABS.map(tab => {
        const active = pathname.startsWith(tab.href);
        return (
          <button
            key={tab.href}
            onClick={() => router.push(tab.href)}
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {tab.icon(active)}
            <span style={{
              fontSize: "10px",
              fontWeight: active ? 600 : 400,
              color: active ? "var(--brand-primary)" : "var(--ink-400)",
              fontFamily: "var(--font-body)",
              letterSpacing: "0.01em",
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}