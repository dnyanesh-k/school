"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, type AuthUser } from "@/services/authService";

interface UseRequireAuthResult {
  user: AuthUser | null;
  loading: boolean;
}

/**
 * Guards any page that needs a valid JWT.
 *
 * - If no valid token → immediately redirects to /login (no API call wasted).
 * - If token is valid → calls /auth/me once to get fresh user data.
 * - 401 from /auth/me → axios interceptor clears token + redirects to /login.
 */
export function useRequireAuth(): UseRequireAuthResult {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      router.replace("/login");
      return;
    }

    let active = true;
    authService
      .me()
      .then((u) => { if (active) setUser(u); })
      .catch(() => { /* axios interceptor handles 401 redirect */ })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [router]);

  return { user, loading };
}
