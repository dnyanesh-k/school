"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { PageContent } from "@/components/layout/PageContent";
import { TabAddButton } from "@/components/layout/TabAddButton";
import { Pagination } from "@/components/common/Pagination";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/hooks/useToast";
import { AdmissionFormSheet } from "@/components/admissions/AdmissionFormSheet";
import {
  admissionService,
  type Admission,
  type AdmissionStatus,
  STATUS_LABELS,
} from "@/services/admissionService";
import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

interface ClassOption {
  id: number;
  name: string;
}

const STATUS_FILTERS: { value: AdmissionStatus | null; label: string }[] = [
  { value: null,       label: "All" },
  { value: "inquiry",  label: "Inquiry" },
  { value: "admitted", label: "Admitted" },
  { value: "rejected", label: "Rejected" },
];

// Active color per filter — matches STATUS_COLOR so pill + tab feel consistent
const FILTER_ACTIVE: Record<string, { bg: string; text: string; border: string }> = {
  all:      { bg: "var(--brand-primary)", text: "#fff",     border: "var(--brand-primary)" },
  inquiry:  { bg: "var(--ink-200)",       text: "var(--ink-800)", border: "var(--ink-400)" },
  admitted: { bg: "#dcfce7",              text: "#15803d",  border: "#86efac" },
  rejected: { bg: "#fee2e2",              text: "#dc2626",  border: "#fca5a5" },
};

const STATUS_COLOR: Record<AdmissionStatus, { bg: string; text: string }> = {
  inquiry:   { bg: "var(--ink-100)", text: "var(--ink-600)" },
  admitted:  { bg: "#dcfce7",        text: "var(--success)" },
  rejected:  { bg: "#fee2e2",        text: "var(--error)" },
  follow_up: { bg: "#fef3c7",        text: "#92400e" },
};

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

function formatName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return parts.join(" ");
  const middle = parts.slice(1, -1).map((p) => `${p[0].toUpperCase()}.`).join(" ");
  return `${parts[0]} ${middle} ${parts[parts.length - 1]}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusPill({ status }: { status: AdmissionStatus }) {
  const { bg, text } = STATUS_COLOR[status];
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: "var(--radius-full)",
        background: bg,
        color: text,
        whiteSpace: "nowrap",
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function AdmissionCard({
  admission,
  onEdit,
  onDelete,
  onConvert,
}: {
  admission: Admission;
  onEdit: () => void;
  onDelete: () => void;
  onConvert: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [converting, setConverting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isConverted = admission.converted_student_id !== null;
  const canConvert = admission.status === "admitted" && !isConverted;
  const canEdit = admission.status === "inquiry" || admission.status === "follow_up";

  const handleConvert = async () => {
    setConverting(true);
    try {
      await onConvert();
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="vt-card vt-item-card">
      <button
        type="button"
        className="vt-student-card-main"
        onClick={canEdit ? onEdit : undefined}
        style={{ cursor: canEdit ? "pointer" : "default" }}
        aria-label={admission.candidate_name}
      >
        <div className="vt-student-avatar">{getInitials(admission.candidate_name)}</div>
        <div className="vt-student-info">
          <p className="vt-student-name">{formatName(admission.candidate_name)}</p>
          <p className="vt-student-meta">
            {admission.class_name ?? "—"} · {formatDate(admission.visit_date)}
          </p>
          <StatusPill status={admission.status} />
        </div>
      </button>

      <div className="vt-student-card-actions">
        {(admission.status === "inquiry" || admission.status === "follow_up") && admission.phone && (
          <a
            href={`tel:${admission.phone.replace(/\D/g, "")}`}
            aria-label={`Call ${admission.parent_name}`}
            title={`Call ${admission.phone}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "var(--radius-sm)",
              background: "var(--success-bg)",
              border: "1.5px solid var(--success-border)",
              color: "var(--success)",
              flexShrink: 0,
              textDecoration: "none",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z"
                fill="currentColor"
              />
            </svg>
          </a>
        )}

        {canConvert && (
          <button
            type="button"
            onClick={handleConvert}
            disabled={converting}
            className="vt-student-fees-btn"
            style={{
              opacity: converting ? 0.7 : 1,
              background: "var(--brand-primary)",
              borderColor: "var(--brand-primary)",
              color: "#fff",
            }}
          >
            {converting ? "…" : "Enroll"}
          </button>
        )}

        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="More actions"
            className="vt-student-menu-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="5" r="2" fill="currentColor" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <circle cx="12" cy="19" r="2" fill="currentColor" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div
                onClick={() => setShowMenu(false)}
                style={{ position: "fixed", inset: 0, zIndex: 100 }}
                aria-hidden="true"
              />
              <div className="vt-card vt-student-menu">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => { onEdit(); setShowMenu(false); }}
                    className="vt-student-menu-item"
                  >
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { handleDelete(); setShowMenu(false); }}
                  disabled={deleting}
                  className="vt-student-menu-item is-danger"
                >
                  {deleting ? "Removing…" : "Remove"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="vt-empty animate-fadeUp">
      <p className="vt-empty-title">No admissions yet</p>
      <p className="vt-empty-desc">Add a new admission above to start tracking enquiries.</p>
    </div>
  );
}

export default function AdmissionsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [statusFilter, setStatusFilter] = useState<AdmissionStatus | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState<Admission | null>(null);

  useEffect(() => {
    api.get(API_URLS.CLASSES.LIST).then((r) => setClasses(r.data)).catch(() => {});
  }, []);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const data = await admissionService.list({
        status: statusFilter ?? undefined,
        page,
        page_size: DEFAULT_PAGE_SIZE,
      });
      setAdmissions(data.items);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch {
      setAdmissions([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setSearch("");
  }, [statusFilter]);

  useEffect(() => {
    fetchAdmissions();
  }, [statusFilter, page]);

  const openAdd = () => {
    setEditingAdmission(null);
    setShowForm(true);
  };

  const openEdit = (admission: Admission) => {
    setEditingAdmission(admission);
    setShowForm(true);
  };

  const handleConvert = async (admission: Admission) => {
    try {
      const result = await admissionService.convert(admission.id);
      showToast(`${admission.candidate_name} enrolled as ${result.roll_number}`, "success");
      fetchAdmissions();
    } catch {
      showToast("Failed to enroll student", "error");
    }
  };

  const handleDelete = async (admission: Admission) => {
    try {
      await admissionService.remove(admission.id);
      showToast("Admission removed", "success");
      fetchAdmissions();
    } catch {
      showToast("Failed to remove admission", "error");
    }
  };

  return (
    <>
      <TopBar title="Admissions" />

      <PageContent style={{ paddingBottom: 0, paddingTop: 12 }}>
        <button
          type="button"
          onClick={() => router.push("/dashboard/students")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            background: "none",
            color: "var(--brand-primary)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
            marginBottom: 4,
          }}
        >
          ← Back to Students
        </button>
      </PageContent>

      <div className="vt-filter-row" style={{ padding: "10px 16px 10px", borderBottom: "1px solid var(--ink-200)" }}>
        {STATUS_FILTERS.map((f) => {
          const key = f.value ?? "all";
          const isActive = statusFilter === f.value;
          const color = FILTER_ACTIVE[key];
          return (
            <button
              key={key}
              type="button"
              className="vt-filter-pill"
              onClick={() => setStatusFilter(f.value)}
              style={isActive ? {
                background: color.bg,
                color: color.text,
                borderColor: color.border,
                fontWeight: 600,
              } : undefined}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <PageContent>
        {!loading && (
          <div className="vt-tab-toolbar">
            <p className="vt-tab-count">
              {total > 0 ? `${total} admission${total !== 1 ? "s" : ""}` : "No admissions"}
            </p>
            <TabAddButton label="New admission" onClick={openAdd} />
          </div>
        )}

        {loading && <ListSkeleton count={4} />}

        {!loading && admissions.length === 0 && <EmptyState />}

        {!loading && admissions.length > 0 && (
          <>
            <input
              type="search"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="vt-search-input"
            />
            {(() => {
              const q = search.trim().toLowerCase();
              const filtered = q
                ? admissions.filter((a) => a.candidate_name.toLowerCase().includes(q))
                : admissions;
              return (
                <>
                  {filtered.length === 0 && (
                    <p style={{ textAlign: "center", color: "var(--ink-500)", fontSize: 14, padding: "32px 0" }}>
                      No admissions match &ldquo;{search}&rdquo;
                    </p>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filtered.map((a) => (
                      <AdmissionCard
                        key={a.id}
                        admission={a}
                        onEdit={() => openEdit(a)}
                        onDelete={() => handleDelete(a)}
                        onConvert={() => handleConvert(a)}
                      />
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
        )}
      </PageContent>

      <AdmissionFormSheet
        open={showForm}
        onClose={() => { setShowForm(false); setEditingAdmission(null); }}
        classes={classes}
        admission={editingAdmission}
        onSuccess={fetchAdmissions}
        onShowToast={(msg) => showToast(msg, "success")}
      />
    </>
  );
}
