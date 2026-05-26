"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function Pagination({ page, totalPages, total, onPageChange, loading = false }: PaginationProps) {
  if (totalPages <= 1 && total <= 0) return null;

  const canPrev = page > 1 && !loading;
  const canNext = page < totalPages && !loading;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "16px 0 8px",
      }}
    >
      <p style={{ fontSize: "12px", color: "var(--ink-500)", textAlign: "center" }}>
        Page {page} of {totalPages} · {total} total
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          style={navButtonStyle(!canPrev)}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          style={navButtonStyle(!canNext)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function navButtonStyle(disabled: boolean) {
  return {
    minHeight: 44,
    borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--ink-200)",
    background: disabled ? "var(--ink-100)" : "var(--surface-0)",
    color: disabled ? "var(--ink-400)" : "var(--ink-800)",
    fontSize: "14px",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-body)",
  } as const;
}
