"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy route — tests live under Settings now */
export default function TestsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/settings?tab=tests");
  }, [router]);

  return null;
}
