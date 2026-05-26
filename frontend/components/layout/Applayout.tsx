"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { InstituteProvider } from "@/contexts/InstituteContext";
import { Sidebar } from "./Sidebar";
import { BottomTab } from "./BottomTab";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      router.replace("/login");
      return;
    }

    if (authService.isPlatformAdmin()) {
      router.replace("/admin");
    }
  }, [router]);

  return (
    <InstituteProvider>
      <div className="vt-sidebar">
        <Sidebar />
      </div>

      <main className="vt-main">{children}</main>

      <div className="vt-bottomtab">
        <BottomTab />
      </div>
    </InstituteProvider>
  );
}
