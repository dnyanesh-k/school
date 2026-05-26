interface AlertCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

export function AlertCard({ title, description, onClick }: AlertCardProps) {
  return (
    <button type="button" className="vt-alert vt-alert--warning" onClick={onClick}>
      <div className="vt-alert-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="vt-alert-body">
        <p className="vt-alert-title">{title}</p>
        <p className="vt-alert-desc">{description}</p>
      </div>
      <svg
        className="vt-alert-chevron"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 18l6-6-6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
