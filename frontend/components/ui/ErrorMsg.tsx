// Extracted from RegisterPage.tsx — zero logic changes

export function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p style={{
      fontSize: "12px",
      color: "var(--error)",
      marginTop: "5px",
      display: "flex",
      alignItems: "center",
      gap: 4,
    }}>
      <span>⚠</span> {msg}
    </p>
  );
}