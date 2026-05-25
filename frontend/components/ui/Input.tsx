"use client";

// Extracted from RegisterPage.tsx — zero logic changes

import { useState } from "react";

export function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  prefix,
  autoComplete,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  prefix?: string;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      {prefix && (
        <span style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--ink-500)",
          fontSize: "14px",
          fontWeight: 500,
          pointerEvents: "none",
          zIndex: 1,
        }}>
          {prefix}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          height: "52px",
          padding: prefix ? "0 16px 0 36px" : "0 16px",
          border: `1.5px solid ${error ? "var(--error)" : focused ? "var(--brand-primary)" : "var(--ink-300)"}`,
          borderRadius: "var(--radius-md)",
          fontSize: "15px",
          fontFamily: "var(--font-body)",
          color: "var(--ink-900)",
          background: focused ? "#fff" : error ? "var(--error-bg)" : "var(--surface-0)",
          outline: "none",
          transition: "all 0.18s ease",
          boxShadow: focused ? "var(--shadow-focus)" : "none",
          WebkitAppearance: "none",
        }}
      />
    </div>
  );
}