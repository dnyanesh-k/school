// Extracted from RegisterPage.tsx — zero logic changes

export function Label({ children, required }: { children: string; required?: boolean }) {
  return (
    <label style={{
      display: "block",
      fontFamily: "var(--font-body)",
      fontSize: "13px",
      fontWeight: 500,
      color: "var(--ink-700)",
      marginBottom: "6px",
      letterSpacing: "0.01em",
    }}>
      {children}
      {required && <span style={{ color: "var(--brand-primary)", marginLeft: 3 }}>*</span>}
    </label>
  );
}