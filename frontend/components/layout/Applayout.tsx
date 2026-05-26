"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Sidebar }   from "./Sidebar";
import { BottomTab } from "./BottomTab";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    if (!authService.isLoggedIn()) router.replace("/login");
  }, [router]);

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile via CSS) ── */}
      <div className="vt-sidebar">
        <Sidebar />
      </div>

      {/* ── Main content ── */}
      <main className="vt-main">
        {children}
      </main>

      {/* ── Mobile bottom tab (hidden on desktop via CSS) ── */}
      <div className="vt-bottomtab">
        <BottomTab />
      </div>


    </>
  );
}