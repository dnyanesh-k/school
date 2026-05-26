"use client";

import { useState } from "react";

export function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  prefix,
  autoComplete,
  disabled,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  prefix?: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  const className = [
    "vt-control",
    error ? "is-error" : "",
    focused ? "is-focused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`vt-input-wrap${prefix ? " has-prefix" : ""}`}>
      {prefix ? <span className="vt-input-prefix">{prefix}</span> : null}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={className}
      />
    </div>
  );
}
