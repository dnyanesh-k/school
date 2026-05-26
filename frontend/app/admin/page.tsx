"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { Pagination } from "@/components/common/Pagination";
import { adminService, getErrorMessage, type InstituteRecord } from "@/services/adminService";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

type FilterStatus = "all" | "pending" | "active" | "rejected" | "suspended";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending: { label: "Pending", bg: "#fff7ed", color: "#c2410c" },
    active: { label: "Active", bg: "#ecfdf5", color: "var(--success)" },
    rejected: { label: "Rejected", bg: "var(--error-bg)", color: "var(--error)" },
    suspended: { label: "Suspended", bg: "var(--ink-100)", color: "var(--ink-500)" },
  };
  const style = map[status] ?? map.pending;

  return (
    <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "var(--radius-full)", background: style.bg, color: style.color }}>
      {style.label}
    </span>
  );
}

function InstituteCard({
  institute,
  onAction,
  loadingId,
}: {
  institute: InstituteRecord;
  onAction: (id: number, status: "active" | "rejected" | "suspended") => void;
  loadingId: number | null;
}) {
  const busy = loadingId === institute.id;

  return (
    <div style={{ background: "var(--surface-0)", borderRadius: "var(--radius-lg)", padding: "16px", boxShadow: "var(--shadow-sm)", border: institute.status === "pending" ? "1px solid #fed7aa" : "1px solid transparent" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", color: "var(--ink-900)", marginBottom: 4 }}>{institute.name}</p>
          <p style={{ fontSize: "12px", color: "var(--ink-500)" }}>{institute.city} · {institute.institute_type}</p>
        </div>
        <StatusChip status={institute.status} />
      </div>

      <div style={{ fontSize: "13px", color: "var(--ink-700)", lineHeight: 1.6, marginBottom: 12 }}>
        <p>{institute.email}</p>
        <p>{institute.phone}</p>
        {institute.admin && <p>Admin: {institute.admin.full_name}</p>}
        <p style={{ fontSize: "12px", color: "var(--ink-400)", marginTop: 4 }}>Registered {formatDate(institute.created_at)}</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {institute.status === "pending" && (
          <>
            <button type="button" disabled={busy} onClick={() => onAction(institute.id, "active")} style={actionStyle("success", busy)}>Enable</button>
            <button type="button" disabled={busy} onClick={() => onAction(institute.id, "rejected")} style={actionStyle("danger", busy)}>Reject</button>
          </>
        )}
        {institute.status === "active" && (
          <button type="button" disabled={busy} onClick={() => onAction(institute.id, "suspended")} style={actionStyle("neutral", busy)}>Disable</button>
        )}
        {institute.status === "suspended" && (
          <button type="button" disabled={busy} onClick={() => onAction(institute.id, "active")} style={actionStyle("success", busy)}>Enable</button>
        )}
        {institute.status === "rejected" && (
          <button type="button" disabled={busy} onClick={() => onAction(institute.id, "active")} style={actionStyle("success", busy)}>Enable</button>
        )}
      </div>
    </div>
  );
}

function actionStyle(variant: "success" | "danger" | "neutral", disabled: boolean) {
  const variants = {
    success: { bg: "#ecfdf5", color: "var(--success)", border: "#bbf7d0" },
    danger: { bg: "var(--error-bg)", color: "var(--error)", border: "var(--error-border)" },
    neutral: { bg: "var(--ink-50)", color: "var(--ink-700)", border: "var(--ink-200)" },
  }[variant];

  return {
    minHeight: 40,
    padding: "0 14px",
    borderRadius: "var(--radius-full)",
    border: `1.5px solid ${variants.border}`,
    background: variants.bg,
    color: variants.color,
    fontSize: "12px",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    fontFamily: "var(--font-body)",
  } as const;
}

export default function AdminPage() {
  const { showToast } = useToast();
  const [institutes, setInstitutes] = useState<InstituteRecord[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.listInstitutes(
        filter === "all" ? undefined : filter,
        page,
        DEFAULT_PAGE_SIZE,
      );
      setInstitutes(result.items);
      setTotalPages(result.total_pages);
      setTotal(result.total);
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to load institutes"), "error");
    } finally {
      setLoading(false);
    }
  }, [filter, page, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const handleAction = async (instituteId: number, status: "active" | "rejected" | "suspended") => {
    setActionLoadingId(instituteId);
    try {
      const result = await adminService.updateStatus(instituteId, status);
      showToast(result.message, "success");
      await loadData();
    } catch (error) {
      showToast(getErrorMessage(error, "Action failed"), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filters: { id: FilterStatus; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "active", label: "Active" },
    { id: "suspended", label: "Disabled" },
    { id: "rejected", label: "Rejected" },
    { id: "all", label: "All" },
  ];

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "24px", color: "var(--ink-900)", marginBottom: 6 }}>
          Institutes
        </h1>
        <p style={{ fontSize: "14px", color: "var(--ink-500)", lineHeight: 1.5 }}>
          Enable or disable institute access after self-registration.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, scrollbarWidth: "none" }}>
        {filters.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              style={{
                flexShrink: 0,
                padding: "7px 16px",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid",
                borderColor: active ? "var(--brand-primary)" : "var(--ink-200)",
                background: active ? "var(--brand-accent)" : "var(--surface-0)",
                fontSize: "13px",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--brand-primary)" : "var(--ink-500)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 140, borderRadius: "var(--radius-lg)", background: "var(--ink-100)" }} />
          ))}
        </div>
      ) : institutes.length === 0 ? (
        <div style={{ padding: "48px 20px", textAlign: "center", background: "var(--surface-0)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "15px", color: "var(--ink-900)", marginBottom: 6 }}>Nothing here</p>
          <p style={{ fontSize: "13px", color: "var(--ink-500)" }}>No institutes in this filter.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
            {institutes.map((institute) => (
              <InstituteCard key={institute.id} institute={institute} onAction={handleAction} loadingId={actionLoadingId} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            loading={loading}
          />
        </>
      )}
    </>
  );
}
