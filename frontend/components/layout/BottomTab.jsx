"use client";

import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS } from "./navItems";

function isActive(href, pathname) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  return pathname.startsWith(href);
}

export function BottomTab() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="vt-bottomtab-bar">
      {NAV_ITEMS.map((tab) => {
        const active = isActive(tab.href, pathname);
        return (
          <button
            key={tab.href}
            type="button"
            className={`vt-bottomtab-item${active ? " is-active" : ""}`}
            onClick={() => router.push(tab.href)}
          >
            {tab.icon(active)}
            <span className="vt-bottomtab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
