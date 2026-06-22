"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { getNavItems } from "./navItems";

function isActive(href, pathname) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  if (href === "/student") {
    return pathname === "/student" || pathname === "/student/";
  }
  return pathname.startsWith(href);
}

export function BottomTab() {
  const pathname = usePathname();
  const router = useRouter();

  // Read role only on client to avoid SSR/hydration mismatch (localStorage unavailable on server)
  const [role, setRole] = useState(null);
  useEffect(() => { setRole(authService.getRole()); }, []);

  const navItems = getNavItems(role);

  // Don't render any tabs until we know the role — prevents flashing institute nav for students
  if (role === null) return <nav className="vt-bottomtab-bar" />;

  return (
    <nav className="vt-bottomtab-bar">
      {navItems.map((tab) => {
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
