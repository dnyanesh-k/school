"use client";

// Extracted from RegisterPage.tsx — zero logic changes

import { useState } from "react";

export function Select({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          height: "52px",
          padding: "0 40px 0 16px",
          border: `1.5px solid ${error ? "var(--error)" : focused ? "var(--brand-primary)" : "var(--ink-300)"}`,
          borderRadius: "var(--radius-md)",
          fontSize: "15px",
          fontFamily: "var(--font-body)",
          color: value ? "var(--ink-900)" : "var(--ink-500)",
          background: "var(--surface-0)",
          outline: "none",
          transition: "all 0.18s ease",
          boxShadow: focused ? "var(--shadow-focus)" : "none",
          WebkitAppearance: "none",
          appearance: "none",
          cursor: "pointer",
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {/* Custom chevron — exactly as in RegisterPage */}
      <svg
        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        width="16" height="16" viewBox="0 0 16 16" fill="none"
      >
        <path d="M4 6l4 4 4-4" stroke="var(--ink-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}