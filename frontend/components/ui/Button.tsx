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
      className={`vt-btn ${isPrimary ? "vt-btn-primary" : "vt-btn-secondary"} ${fullWidth ? "vt-btn-full" : ""}`}
      style={{
        flex: fullWidth ? undefined : (flex ?? (isPrimary ? 2 : 1)),
      }}
    >
      {loading ? (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: "spin 0.8s linear infinite" }}>
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="28" strokeDashoffset="10" />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
