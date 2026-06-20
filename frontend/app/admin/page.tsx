"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { Pagination } from "@/components/common/Pagination";
import { adminService, getErrorMessage, type AdminStats, type InstituteRecord } from "@/services/adminService";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

type FilterStatus = "all" | "pending" | "active" | "suspended";

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
        <p style={{ fontSize: "12px", color: "var(--ink-400)", marginTop: 4 }}>
          Registered {formatDate(institute.created_at)}
          {" · "}
          <strong style={{ color: "var(--ink-600)" }}>{institute.student_count}</strong> student{institute.student_count !== 1 ? "s" : ""}
          {" · "}
          <span style={{ color: institute.last_attendance_date ? "var(--success)" : "var(--ink-400)", fontWeight: 600 }}>
            {institute.last_attendance_date
              ? `Last attendance: ${formatDate(institute.last_attendance_date)}`
              : "No attendance yet"}
          </span>
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {institute.status === "pending" && (
          <>
            <button type="button" disabled={busy} onClick={() => onAction(institute.id, "active")} style={actionStyle("success", busy)}>Approve</button>
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
        {institute.phone && (
          <a
            href={`https://wa.me/91${institute.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${institute.admin?.full_name ?? "there"}, your institute *${institute.name}* has been approved on VidyaTrack! You can now log in and get started at https://vidyatrackai.com. Welcome aboard 🎉`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...actionStyle("neutral", false), display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none" }}
          >
            <span style={{ fontSize: 14 }}>💬</span> WhatsApp
          </a>
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
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    adminService.getStats().then(setStats).catch(() => null);
  }, []);

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
    setSearch("");
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
    { id: "all", label: "All" },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "24px", color: "var(--ink-900)", marginBottom: 6 }}>
          Institutes
        </h1>
        <p style={{ fontSize: "14px", color: "var(--ink-500)", lineHeight: 1.5 }}>
          Enable or disable institute access after self-registration.
        </p>
      </div>

      {stats && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "Total", value: stats.total, color: "var(--ink-700)" },
            { label: "Active", value: stats.active, color: "var(--success)" },
            { label: "Pending", value: stats.pending, color: "#c2410c" },
            { label: "Students", value: stats.total_students, color: "var(--brand-primary)" },
            { label: "Used this week", value: stats.institutes_used_this_week, color: "#7c3aed" },
          ].map((s) => (
            <div key={s.label} style={{ background: "var(--surface-0)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "10px 16px", minWidth: 80, textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 4, fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

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

      {!loading && institutes.length > 0 && (
        <input
          type="search"
          placeholder="Search by name or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="vt-search-input"
        />
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 140, borderRadius: "var(--radius-lg)", background: "var(--ink-100)" }} />
          ))}
        </div>
      ) : (() => {
        const q = search.trim().toLowerCase();
        const filtered = q
          ? institutes.filter((inst) =>
              inst.name.toLowerCase().includes(q) || inst.city.toLowerCase().includes(q)
            )
          : institutes;
        return filtered.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", background: "var(--surface-0)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "15px", color: "var(--ink-900)", marginBottom: 6 }}>Nothing here</p>
            <p style={{ fontSize: "13px", color: "var(--ink-500)" }}>{q ? `No institutes match "${search}"` : "No institutes in this filter."}</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
              {filtered.map((institute) => (
                <InstituteCard key={institute.id} institute={institute} onAction={handleAction} loadingId={actionLoadingId} />
              ))}
            </div>
            {!q && (
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                onPageChange={setPage}
                loading={loading}
              />
            )}
          </>
        );
      })()}
    </>
  );
}
