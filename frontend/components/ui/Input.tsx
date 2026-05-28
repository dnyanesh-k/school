"use client";

import { Eye, EyeOff } from "lucide-react";
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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";

  const className = [
    "vt-control",
    error ? "is-error" : "",
    focused ? "is-focused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const wrapClassName = [
    "vt-input-wrap",
    prefix ? "has-prefix" : "",
    isPassword ? "has-suffix" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapClassName}>
      {prefix ? <span className="vt-input-prefix">{prefix}</span> : null}
      <input
        type={isPassword ? (passwordVisible ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={className}
      />
      {isPassword ? (
        <button
          type="button"
          className="vt-password-toggle"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setPasswordVisible((visible) => !visible)}
          aria-label={passwordVisible ? "Hide password" : "Show password"}
        >
          {passwordVisible ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
        </button>
      ) : null}
    </div>
  );
}
