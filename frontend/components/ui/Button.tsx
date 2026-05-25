"use client";

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
  flex,
  fullWidth,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  flex?: number;
  fullWidth?: boolean;
}) {
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: fullWidth ? "100%" : undefined,
        flex: fullWidth ? undefined : (flex ?? (isPrimary ? 2 : 1)),
        height: "52px",
        border: isPrimary ? "none" : "1.5px solid var(--ink-300)",
        borderRadius: "var(--radius-md)",
        background: isPrimary
          ? disabled || loading ? "var(--ink-300)" : "var(--brand-primary)"
          : "transparent",
        fontSize: "15px",
        fontWeight: isPrimary ? 600 : 500,
        color: isPrimary ? "white" : "var(--ink-700)",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        fontFamily: isPrimary ? "var(--font-display)" : "var(--font-body)",
        letterSpacing: isPrimary ? "-0.01em" : "normal",
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {loading ? (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: "spin 0.8s linear infinite" }}>
            <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" fill="none" strokeDasharray="28" strokeDashoffset="10"/>
          </svg>
          {children}
        </>
      ) : children}
    </button>
  );
}