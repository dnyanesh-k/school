import type { ReactNode } from "react";

type SettingsTabId = "classes" | "subjects" | "tests" | "team";

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function stroke(active: boolean) {
  return active ? "var(--brand-primary)" : "var(--ink-400)";
}

export function SettingsTabIcon({ tab, active }: { tab: SettingsTabId; active: boolean }) {
  const color = stroke(active);

  const icons: Record<SettingsTabId, ReactNode> = {
    classes: (
      <svg {...iconProps}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={color} />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={color} />
      </svg>
    ),
    subjects: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="7" height="7" rx="1" stroke={color} />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke={color} />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke={color} />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke={color} />
      </svg>
    ),
    tests: (
      <svg {...iconProps}>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke={color} />
        <rect x="9" y="3" width="6" height="4" rx="1" stroke={color} />
        <path d="M9 12h6M9 16h4" stroke={color} />
      </svg>
    ),
    team: (
      <svg {...iconProps}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} />
        <circle cx="9" cy="7" r="4" stroke={color} />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} />
      </svg>
    ),
  };

  return icons[tab];
}
