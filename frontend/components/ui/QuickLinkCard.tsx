interface QuickLinkCardProps {
  label: string;
  description: string;
  onClick: () => void;
}

export function QuickLinkCard({ label, description, onClick }: QuickLinkCardProps) {
  return (
    <button type="button" className="vt-card vt-card-interactive" onClick={onClick}>
      <div>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "14px",
            color: "var(--ink-900)",
            marginBottom: 2,
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: "12px", color: "var(--ink-500)" }}>{description}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 18l6-6-6-6"
          stroke="var(--ink-400)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
