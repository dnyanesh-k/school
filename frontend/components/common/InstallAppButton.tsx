"use client";

import { useEffect, useState } from "react";

interface InstallAppButtonProps {
  /** compact=true → icon-only pill for the navbar; default → full-width hero button */
  compact?: boolean;
}

const DownloadIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 15V3M8 11l4 4 4-4" />
    <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" />
  </svg>
);

export function InstallAppButton({ compact = false }: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [tooltip, setTooltip] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleClick = () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      setDeferredPrompt(null);
    } else {
      setTooltip(true);
      setTimeout(() => setTooltip(false), 4000);
    }
  };

  /* ── Navbar compact variant ──────────────────────────────────────────── */
  if (compact) {
    return (
      <div style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
        <button
          onClick={handleClick}
          title="Install app"
          style={{
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
          }}
        >
          <DownloadIcon />
          Install
        </button>

        {tooltip && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: "var(--ink-900)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 500,
              lineHeight: 1.6,
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              whiteSpace: "nowrap",
              zIndex: 100,
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div>📱 iOS: tap Share → <strong>Add to Home Screen</strong></div>
            <div>💻 Desktop: click ⊕ in the browser address bar</div>
          </div>
        )}
      </div>
    );
  }

  /* ── Full-width hero variant ─────────────────────────────────────────── */
  return (
    <div style={{ position: "relative", display: "inline-flex", width: "100%" }}>
      <button
        onClick={handleClick}
        style={{
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
        }}
      >
        <DownloadIcon />
        Install app
      </button>

      {tooltip && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--ink-900)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 500,
            lineHeight: 1.5,
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            whiteSpace: "nowrap",
            zIndex: 10,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div>📱 iOS: tap Share → <strong>Add to Home Screen</strong></div>
          <div>💻 Desktop: click ⊕ icon in browser address bar</div>
        </div>
      )}
    </div>
  );
}
