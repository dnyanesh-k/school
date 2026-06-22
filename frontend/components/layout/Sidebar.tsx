"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useInstitute } from "@/contexts/InstituteContext";
import { authService } from "@/services/authService";
import { LogoutButton } from "./LogoutButton";
import { getNavItems } from "./navItems";
import type { UserRole } from "@/services/authService";

function isActive(href: string, pathname: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  if (href === "/student") {
    return pathname === "/student" || pathname === "/student/";
  }
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { instituteName, loading, user } = useInstitute();

  // Read role only on client to avoid SSR/hydration mismatch (localStorage unavailable on server)
  const [role, setRole] = useState<UserRole | null>(null);
  useEffect(() => { setRole(authService.getRole()); }, []);

  const navItems = getNavItems(role);
  const isStudent = role === "independent_student";

  // Don't render any content until we know the role — prevents flashing institute nav for students
  if (role === null) {
    return (
      <aside className="vt-sidebar-shell">
        <div className="vt-sidebar-brand" />
        <nav className="vt-sidebar-nav" />
        <div className="vt-sidebar-footer">
          <LogoutButton variant="sidebar" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="vt-sidebar-shell">
      <div className="vt-sidebar-brand">
        {isStudent ? (
          <>
            <p className="vt-sidebar-brand-label">Study Tracker</p>
            <p className="vt-sidebar-brand-name">
              {loading ? "Loading…" : user?.full_name || "My Account"}
            </p>
          </>
        ) : (
          <>
            <p className="vt-sidebar-brand-label">Institute</p>
            <p className="vt-sidebar-brand-name">
              {loading ? "Loading…" : instituteName || "My institute"}
            </p>
          </>
        )}
      </div>

      <nav className="vt-sidebar-nav">
        {navItems.map((item) => {
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
