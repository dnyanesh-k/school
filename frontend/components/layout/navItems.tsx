"use client";

function navStroke(active: boolean) {
  return active ? "var(--nav-icon-active)" : "var(--nav-icon)";
}

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/dashboard",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" stroke={navStroke(active)} strokeWidth="1.75" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Students",
    href: "/dashboard/students",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={navStroke(active)} strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke={navStroke(active)} strokeWidth="1.75" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={navStroke(active)} strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Attendance",
    href: "/dashboard/attendance",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke={navStroke(active)} strokeWidth="1.75" />
        <path d="M16 2v4M8 2v4M3 10h18" stroke={navStroke(active)} strokeWidth="1.75" strokeLinecap="round" />
        <path d="M9 16l2 2 4-4" stroke={navStroke(active)} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Fees",
    href: "/dashboard/fees",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke={navStroke(active)} strokeWidth="1.75" />
        <path d="M2 10h20" stroke={navStroke(active)} strokeWidth="1.75" />
        <path d="M6 15h2M10 15h4" stroke={navStroke(active)} strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3" stroke={navStroke(active)} strokeWidth="1.75" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={navStroke(active)} strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
];

export { NAV_ITEMS, navStroke };
