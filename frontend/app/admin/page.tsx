"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { Pagination } from "@/components/common/Pagination";
import { adminService, getErrorMessage, type AdminStats, type IndependentStudent, type InstituteRecord } from "@/services/adminService";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

type FilterStatus = "all" | "pending" | "active" | "suspended";
type AdminTab = "institutes" | "students";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
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
        </p>
        <p style={{ fontSize: "12px", marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={{ color: institute.last_attendance_date ? "var(--success)" : "var(--ink-400)", fontWeight: 600 }}>
            {institute.last_attendance_date
              ? `Attendance: ${formatDate(institute.last_attendance_date)}`
              : "No attendance yet"}
          </span>
          <span style={{ color: institute.last_dashboard_access ? "var(--brand-primary)" : "var(--ink-400)", fontWeight: 600 }}>
            {institute.last_dashboard_access
              ? `Dashboard: ${formatDateTime(institute.last_dashboard_access)}`
              : "Never opened"}
          </span>
        </p>
        {/* Parent QR engagement row */}
        <p style={{ fontSize: "12px", marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ color: institute.qr_generated > 0 ? "var(--ink-700)" : "var(--ink-400)", fontWeight: 600 }}>
            🔗 QR shared: <strong>{institute.qr_generated}</strong>/{institute.student_count}
          </span>
          <span style={{
            color: institute.parents_scanned > 0 ? "#7c3aed" : "var(--ink-400)",
            fontWeight: 600,
          }}>
            👨‍👩‍👧 Parents active: <strong>{institute.parents_scanned}</strong>
            {institute.qr_generated > 0 && (
              <span style={{ fontWeight: 400, color: "var(--ink-400)" }}>
                {" "}({Math.round((institute.parents_scanned / institute.qr_generated) * 100)}%)
              </span>
            )}
          </span>
          {institute.parent_last_scan_at && (
            <span style={{ color: "var(--ink-400)", fontWeight: 400 }}>
              Last scan: {formatDateTime(institute.parent_last_scan_at)}
            </span>
          )}
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

function StudentCard({ student, onToggle, loadingId }: { student: IndependentStudent; onToggle: (id: number, active: boolean) => void; loadingId: number | null }) {
  const busy = loadingId === student.id;
  const waMsg = encodeURIComponent(
    `Hi ${student.full_name}, your VidyaTrack Student Corner account has been approved! 🎉\n\nYou can now log in and start tracking your study at:\nhttps://vidyatrackai.com/login\n\nHappy studying! 📖`
  );
  const waHref = student.phone
    ? `https://wa.me/91${student.phone.replace(/\D/g, "")}?text=${waMsg}`
    : null;

  return (
    <div style={{ background: "var(--surface-0)", borderRadius: "var(--radius-lg)", padding: "14px 16px", boxShadow: "var(--shadow-sm)", border: !student.is_active ? "1px solid #fed7aa" : "1px solid transparent" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink-900)", marginBottom: 2 }}>{student.full_name}</p>
          <p style={{ fontSize: 12, color: "var(--ink-500)" }}>{student.email}{student.phone ? ` · ${student.phone}` : ""}</p>
        </div>
        <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "var(--radius-full)", background: student.is_active ? "#ecfdf5" : "#fff7ed", color: student.is_active ? "var(--success)" : "#c2410c" }}>
          {student.is_active ? "Active" : "Pending"}
        </span>
      </div>

      {/* Usage stats */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "var(--ink-500)", marginBottom: 10 }}>
        <span>📚 {student.total_sessions} sessions</span>
        <span>⏱ {student.total_hours}h total</span>
        {student.last_session_at && (
          <span style={{ color: "var(--brand-primary)", fontWeight: 600 }}>
            Last: {new Date(student.last_session_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
          </span>
        )}
        {!student.last_session_at && student.is_active && (
          <span style={{ color: "var(--ink-400)" }}>No sessions yet</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {!student.is_active && (
          <button type="button" disabled={busy} onClick={() => onToggle(student.id, true)} style={actionStyle("success", busy)}>Approve</button>
        )}
        {student.is_active && (
          <button type="button" disabled={busy} onClick={() => onToggle(student.id, false)} style={actionStyle("neutral", busy)}>Disable</button>
        )}
        {waHref && (
          <a
            href={waHref}
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

export default function AdminPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("institutes");

  // Institutes state
  const [institutes, setInstitutes] = useState<InstituteRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Students state
  const [students, setStudents] = useState<IndependentStudent[]>([]);
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsTotalPages, setStudentsTotalPages] = useState(1);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentActionId, setStudentActionId] = useState<number | null>(null);

  useEffect(() => {
    adminService.getStats().then(setStats).catch(() => null);
  }, []);

  const loadStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const result = await adminService.listStudents(studentsPage, DEFAULT_PAGE_SIZE);
      setStudents(result.items);
      setStudentsTotalPages(result.total_pages);
      setStudentsTotal(result.total);
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to load students"), "error");
    } finally {
      setStudentsLoading(false);
    }
  }, [studentsPage, showToast]);

  useEffect(() => {
    if (activeTab === "students") loadStudents();
  }, [activeTab, loadStudents]);

  const handleStudentToggle = async (userId: number, isActive: boolean) => {
    setStudentActionId(userId);
    try {
      const updated = await adminService.toggleStudentAccess(userId, isActive);
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast(isActive ? "Student approved" : "Student disabled", "success");
    } catch (err) {
      showToast(getErrorMessage(err, "Action failed"), "error");
    } finally {
      setStudentActionId(null);
    }
  };

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
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "24px", color: "var(--ink-900)", marginBottom: 12 }}>
          Platform Admin
        </h1>
        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          {(["institutes", "students"] as AdminTab[]).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{ padding: "7px 18px", borderRadius: "var(--radius-full)", border: "1.5px solid", borderColor: activeTab === tab ? "var(--brand-primary)" : "var(--ink-200)", background: activeTab === tab ? "var(--brand-accent)" : "var(--surface-0)", fontSize: 13, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? "var(--brand-primary)" : "var(--ink-500)", cursor: "pointer", fontFamily: "var(--font-body)", textTransform: "capitalize" }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Students tab ─────────────────────────────────────────────────────── */}
      {activeTab === "students" && (
        <>
          {/* Student aggregate stats */}
          {stats && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {[
                { label: "Total", value: stats.independent_students_total, color: "var(--ink-700)" },
                { label: "Active", value: stats.independent_students_active, color: "var(--success)" },
                { label: "Pending", value: stats.independent_students_pending, color: "#c2410c" },
                { label: "Active this week", value: stats.independent_students_active_this_week, color: "#7c3aed" },
                { label: "Total hours", value: `${stats.independent_students_total_hours}h`, color: "var(--brand-primary)" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--surface-0)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "10px 16px", minWidth: 80, textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 4, fontWeight: 500 }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
          <p style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 16 }}>
            {studentsTotal} student{studentsTotal !== 1 ? "s" : ""} on this page · Approve to allow login
          </p>
          {studentsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map(i => <div key={i} style={{ height: 100, borderRadius: "var(--radius-lg)", background: "var(--ink-100)" }} />)}
            </div>
          ) : students.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", background: "var(--surface-0)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--ink-900)" }}>No students yet</p>
              <p style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 4 }}>Students will appear here after registering at /register</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
                {students.map(s => (
                  <StudentCard key={s.id} student={s} onToggle={handleStudentToggle} loadingId={studentActionId} />
                ))}
              </div>
              <Pagination page={studentsPage} totalPages={studentsTotalPages} total={studentsTotal} onPageChange={setStudentsPage} loading={studentsLoading} />
            </>
          )}
        </>
      )}

      {/* ── Institutes tab ───────────────────────────────────────────────────── */}
      {activeTab === "institutes" && (<>

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
      </>)}
    </>
  );
}
