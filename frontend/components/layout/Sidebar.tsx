"use client";

import { usePathname, useRouter } from "next/navigation";
import { useInstitute } from "@/contexts/InstituteContext";
import { LogoutButton } from "./LogoutButton";
import { NAV_ITEMS } from "./navItems";

function isActive(href: string, pathname: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { instituteName, loading } = useInstitute();

  return (
    <aside className="vt-sidebar-shell">
      <div className="vt-sidebar-brand">
        <p className="vt-sidebar-brand-label">Institute</p>
        <p className="vt-sidebar-brand-name">
          {loading ? "Loading…" : instituteName || "My institute"}
        </p>
      </div>

      <nav className="vt-sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <button
              key={item.href}
              type="button"
              className={`vt-nav-item${active ? " is-active" : ""}`}
              onClick={() => router.push(item.href)}
            >
              {item.icon(active)}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="vt-sidebar-footer">
        <LogoutButton variant="sidebar" />
      </div>
    </aside>
  );
}
