"use client";

interface TabAddButtonProps {
  label: string;
  onClick: () => void;
}

/** Inline add action inside a tab/list section — not in the top bar */
export function TabAddButton({ label, onClick }: TabAddButtonProps) {
  return (
    <button type="button" className="vt-tab-add" onClick={onClick}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {label}
    </button>
  );
}
