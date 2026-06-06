"use client";

import { useEffect, useState } from "react";

interface InstallAppButtonProps {
  compact?: boolean;
}

type Platform = "ios" | "android_or_desktop" | "installed" | "unknown";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true;
  if (isStandalone) return "installed";
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
  if (isIOS) return "ios";
  return "android_or_desktop";
}

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15V3M8 11l4 4 4-4" />
    <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" />
  </svg>
);

export function InstallAppButton({ compact = false }: InstallAppButtonProps) {
  const [promptReady, setPromptReady] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);

    // Check if prompt was already captured before we mounted
    if ((window as any).__installPrompt) {
      setPromptReady(true);
    }

    const handler = () => setPromptReady(true);
    window.addEventListener("installpromptready", handler);
    return () => window.removeEventListener("installpromptready", handler);
  }, []);

  // Hide if already installed as PWA
  if (platform === "installed") return null;

  const handleClick = async () => {
    if (platform === "ios") {
      setShowIOSGuide((v) => !v);
      return;
    }

    // Android or Desktop — trigger native install prompt
    const prompt = (window as any).__installPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        (window as any).__installPrompt = null;
        setPromptReady(false);
      }
    }
    // If no prompt yet — button still shows; user may need to wait or use browser menu
  };

  const buttonStyle: React.CSSProperties = compact
    ? {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        fontWeight: 600,
        color: "var(--ink-600)",
        background: "transparent",
        border: "1px solid var(--ink-200)",
        borderRadius: "var(--radius-md)",
        padding: "6px 12px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        lineHeight: 1,
      }
    : {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        fontWeight: 600,
        color: "var(--ink-700)",
        background: "var(--surface-0)",
        border: "1px solid var(--ink-200)",
        borderRadius: "var(--radius-md)",
        padding: "12px 20px",
        cursor: "pointer",
        width: "100%",
        maxWidth: 280,
        justifyContent: "center",
      };

  return (
    <div style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <button onClick={handleClick} title="Install app" style={buttonStyle}>
        <DownloadIcon />
        {compact ? "Install" : "Install app"}
      </button>

      {/* iOS-only popup */}
      {showIOSGuide && platform === "ios" && (
        <div
          style={{
            position: "absolute",
            top: compact ? "calc(100% + 8px)" : undefined,
            bottom: compact ? undefined : "calc(100% + 8px)",
            right: compact ? 0 : undefined,
            left: compact ? undefined : "50%",
            transform: compact ? undefined : "translateX(-50%)",
            background: "var(--ink-900)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 1.7,
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            whiteSpace: "nowrap",
            zIndex: 200,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div>1. Tap the <strong>Share</strong> button (□↑) in Safari</div>
          <div>2. Tap <strong>Add to Home Screen</strong></div>
        </div>
      )}
    </div>
  );
}
