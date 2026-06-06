"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authService, type AuthUser } from "@/services/authService";

interface InstituteContextValue {
  user: AuthUser | null;
  instituteName: string;
  loading: boolean;
}

const InstituteContext = createContext<InstituteContextValue>({
  user: null,
  instituteName: "",
  loading: true,
});

export function InstituteProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [instituteName, setInstituteName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fast local check — no network call if not logged in
    if (!authService.isLoggedIn()) {
      router.replace("/login");
      return;
    }

    let active = true;

    authService
      .me()
      .then((u) => {
        if (!active) return;
        setUser(u);
        setInstituteName(u.institute_name ?? "");
      })
      .catch(() => {
        // axios interceptor handles 401 redirect; silence other errors
        if (active) setInstituteName("");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <InstituteContext.Provider value={{ user, instituteName, loading }}>
      {children}
    </InstituteContext.Provider>
  );
}

export function useInstitute() {
  return useContext(InstituteContext);
}
