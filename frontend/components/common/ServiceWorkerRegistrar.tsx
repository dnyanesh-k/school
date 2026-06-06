"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Capture beforeinstallprompt globally as early as possible.
    // InstallAppButton reads from window.__installPrompt.
    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).__installPrompt = e;
      window.dispatchEvent(new Event("installpromptready"));
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return null;
}
