"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PageContent } from "@/components/layout/PageContent";
import { TabAddButton } from "@/components/layout/TabAddButton";
import { ClassFilterTabs } from "@/components/common/ClassFilterTabs";
import { BottomSheet } from "@/components/common/BottomSheet";
import { Pagination } from "@/components/common/Pagination";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import { studentService, type Student, type ShareQrResult } from "@/services/studentService";
import { feeService } from "@/services/feeService";
import { authService } from "@/services/authService";
import { admissionService } from "@/services/admissionService";
import { StudentFormSheet } from "@/components/students/StudentFormSheet";
import { StudentListItem, formatStudentName } from "@/components/students/StudentListItem";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";

interface Class {
  id: number;
  name: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function EmptyState({ hasClasses }: { hasClasses: boolean }) {
  return (
    <div className="vt-empty animate-fadeUp">
      <p className="vt-empty-title">{hasClasses ? "No students yet" : "No classes set up"}</p>
      <p className="vt-empty-desc">
        {hasClasses
          ? "Use Add student above to enroll your first student."
          : "Go to Settings and add classes before adding students."}
      </p>
    </div>
  );
}

function FeeSheet({ student, onClose }: { student: Student | null; onClose: () => void }) {
  const [feePlan, setFeePlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!student) return;
    setLoading(true);
    feeService
      .getPlanByStudent(student.id)
      .then(setFeePlan)
      .catch(() => setFeePlan(null))
      .finally(() => setLoading(false));
  }, [student]);

  if (!student) return null;

  return (
    <BottomSheet open={Boolean(student)} onClose={onClose} title="Fee status">
      <p className="vt-section-subtitle" style={{ marginTop: -8, marginBottom: 20 }}>
        {formatStudentName(student.full_name)}
      </p>

      {loading && <p style={{ textAlign: "center", color: "var(--ink-400)", padding: "32px 0" }}>Loading…</p>}

      {!loading && !feePlan && (
        <p style={{ textAlign: "center", color: "var(--ink-500)", padding: "32px 0", fontSize: "14px" }}>
          No fee plan added yet.
        </p>
      )}

      {!loading && feePlan && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[
              {
                label: "Total fees",
                value: `₹${feePlan.total_amount.toLocaleString("en-IN")}`,
                color: "var(--ink-900)",
              },
              {
                label: "Paid",
                value: `₹${feePlan.paid_amount.toLocaleString("en-IN")}`,
                color: "var(--success)",
              },
              {
                label: "Pending",
                value: `₹${(feePlan.total_amount - feePlan.paid_amount).toLocaleString("en-IN")}`,
                color: "var(--error)",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: "14px",
                  background: "var(--ink-50)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <p style={{ fontSize: "11px", color: "var(--ink-500)", marginBottom: 4 }}>{stat.label}</p>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: stat.color,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink-700)", marginBottom: 10 }}>
            Installments
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {feePlan.installments.map((inst: any, i: number) => {
              const overdue = inst.status === "overdue";
              const paid = inst.status === "paid";
              return (
                <div
                  key={inst.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    background: overdue ? "var(--error-bg)" : "var(--surface-0)",
                    border: `1px solid ${overdue ? "var(--error-border)" : "var(--ink-200)"}`,
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--ink-900)" }}>
                      Installment {i + 1} · ₹{inst.amount.toLocaleString("en-IN")}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--ink-500)", marginTop: 2 }}>
                      Due: {formatDate(inst.due_date)}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: "var(--radius-full)",
                        background: paid ? "#dcfce7" : overdue ? "var(--error-bg)" : "var(--ink-100)",
                        color: paid ? "var(--success)" : overdue ? "var(--error)" : "var(--ink-500)",
                      }}
                    >
                      {paid ? "Paid" : overdue ? "Overdue" : "Pending"}
                    </span>
                    {overdue && (
                      <a
                        href={feeService.buildWhatsAppUrl(
                          student.parent_phone,
                          student.full_name,
                          inst.amount,
                          inst.due_date
                        )}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "5px 10px",
                          background: "#25D366",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "white",
                          textDecoration: "none",
                        }}
                      >
                        Remind
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </BottomSheet>
  );
}

function ParentQrSheet({
  student,
  onClose,
}: {
  student: Student | null;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ShareQrResult | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadQr = useCallback(
    async (regenerate = false) => {
      if (!student) return;
      setLoading(true);
      try {
        const result = await studentService.shareQr(student.id, regenerate);
        setData(result);
      } catch {
        showToast("Failed to generate QR", "error");
      } finally {
        setLoading(false);
      }
    },
    [student, showToast]
  );

  useEffect(() => {
    if (!student) { setData(null); setQrDataUrl(null); return; }
    loadQr(false);
  }, [student]);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!data) return;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(data.portal_url, {
        width: 240,
        margin: 2,
        color: { dark: "#312e81", light: "#ffffff" },
      }).then(setQrDataUrl);
    });
  }, [data]);

  const downloadQrImage = useCallback(() => {
    if (!qrDataUrl || !data) return;
    const canvas = document.createElement("canvas");
    const SIZE = 340;
    const PADDING = 20;
    canvas.width = SIZE;
    canvas.height = SIZE + 80;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#ffffff";
    ctx.roundRect(0, 0, canvas.width, canvas.height, 16);
    ctx.fill();

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, PADDING, PADDING, SIZE - PADDING * 2, SIZE - PADDING * 2);

      ctx.fillStyle = "#312e81";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(data.student_name, canvas.width / 2, SIZE + 16);

      ctx.fillStyle = "#6b6b80";
      ctx.font = "12px sans-serif";
      ctx.fillText("VidyaTrack · Parent View", canvas.width / 2, SIZE + 36);

      const link = document.createElement("a");
      link.download = `parent-qr-${data.student_name.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = qrDataUrl;
  }, [qrDataUrl, data]);

  const waUrl = data
    ? `https://wa.me/${data.parent_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi Dear Parent,\n\nYou can now view ${data.student_name.split(" ")[0]}'s attendance, test scores and fee details.\n\n${data.portal_url}\n\nPIN: ${data.pin === "••••••" ? "(previously shared)" : data.pin}\n\nEnter the PIN when prompted.`
      )}`
    : "#";

  if (!student) return null;

  return (
    <BottomSheet open={Boolean(student)} onClose={onClose} title="Parent QR">
      <p className="vt-section-subtitle" style={{ marginTop: -8, marginBottom: 20 }}>
        {formatStudentName(student.full_name)}
      </p>

      {loading && (
        <p style={{ textAlign: "center", color: "var(--ink-400)", padding: "40px 0" }}>Generating…</p>
      )}

      {!loading && data && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          {qrDataUrl ? (
            <div
              style={{
                padding: 12,
                background: "#fff",
                border: "2px solid var(--brand-200)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="Parent QR code" width={200} height={200} />
            </div>
          ) : (
            <div
              style={{
                width: 224,
                height: 224,
                background: "var(--ink-100)",
                borderRadius: "var(--radius-md)",
              }}
            />
          )}

          {/* PIN */}
          <div
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "var(--brand-50)",
              border: "1.5px solid var(--brand-200)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <p style={{ fontSize: 11, color: "var(--ink-500)", marginBottom: 4 }}>6-digit PIN</p>
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "0.25em",
                color: data.pin === "••••••" ? "var(--ink-400)" : "var(--brand-700)",
                fontFamily: "var(--font-display)",
              }}
            >
              {data.pin}
            </p>
            {data.pin === "••••••" && (
              <p style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 4 }}>
                PIN was set earlier. Regenerate to get a new one.
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                height: 44,
                borderRadius: "var(--radius-md)",
                background: "#25D366",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Send via WhatsApp
            </a>

            <button
              type="button"
              onClick={downloadQrImage}
              disabled={!qrDataUrl}
              style={{
                height: 44,
                borderRadius: "var(--radius-md)",
                background: "var(--ink-100)",
                border: "1.5px solid var(--ink-200)",
                color: "var(--ink-700)",
                fontWeight: 600,
                fontSize: 14,
                cursor: qrDataUrl ? "pointer" : "not-allowed",
              }}
            >
              Save QR as Image
            </button>

            <button
              type="button"
              onClick={() => loadQr(true)}
              style={{
                height: 36,
                borderRadius: "var(--radius-md)",
                background: "transparent",
                border: "1px solid var(--ink-200)",
                color: "var(--ink-500)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Regenerate (invalidates old PIN)
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </BottomSheet>
  );
}

export default function StudentsPage() {
  const { showToast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [feeStudent, setFeeStudent] = useState<Student | null>(null);
  const [qrStudent, setQrStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState("");
  const [pendingAdmissions, setPendingAdmissions] = useState(0);

  const canViewFees = authService.canViewFees();

  useEffect(() => {
    api.get(API_URLS.CLASSES.LIST).then((r) => setClasses(r.data)).catch(() => {});
    admissionService.pendingCount().then(setPendingAdmissions).catch(() => {});
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await studentService.list({
        classId: selectedClass ?? undefined,
        page,
        page_size: DEFAULT_PAGE_SIZE,
      });
      setStudents(data.items);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch {
      setStudents([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setSearch("");
  }, [selectedClass]);

  useEffect(() => {
    fetchStudents();
  }, [selectedClass, page]);

  const openAdd = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  return (
    <>
      <TopBar title="Students" />

      <ClassFilterTabs
        classes={classes}
        selectedClass={selectedClass}
        onSelect={setSelectedClass}
        showAll
      />

      <PageContent>
        {!loading && classes.length > 0 && (
          <div className="vt-tab-toolbar">
            <p className="vt-tab-count">
              {students.length > 0 ? `${total} student${total !== 1 ? "s" : ""}` : "No students yet"}
            </p>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <Link
                href="/dashboard/admissions"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  height: 36,
                  padding: "0 12px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  // Amber — signals "pending attention" without competing with the primary Add button
                  background: "#fff7ed",
                  border: "1.5px solid #fb923c",
                  color: "#c2410c",
                }}
              >
                Admissions
                {pendingAdmissions > 0 && (
                  <span
                    style={{
                      background: "#fb923c",
                      color: "#fff",
                      borderRadius: "var(--radius-full)",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "0 5px",
                      lineHeight: "17px",
                    }}
                  >
                    {pendingAdmissions}
                  </span>
                )}
              </Link>
              <TabAddButton label="Add student" onClick={openAdd} />
            </div>
          </div>
        )}

        {!loading && students.length > 0 && (
          <input
            type="search"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="vt-search-input"
          />
        )}

        {loading && <ListSkeleton count={4} />}

        {!loading && students.length === 0 && <EmptyState hasClasses={classes.length > 0} />}

        {!loading && students.length > 0 && (() => {
          const q = search.trim().toLowerCase();
          const filtered = q ? students.filter((s) => s.full_name.toLowerCase().includes(q)) : students;
          return (
          <>
            {filtered.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--ink-500)", fontSize: 14, padding: "32px 0" }}>
                No students match &ldquo;{search}&rdquo;
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((student) => (
                <StudentListItem
                  key={student.id}
                  student={student}
                  onEdit={() => openEdit(student)}
                  onDelete={async (onSuccess) => {
                    await studentService.deactivate(student.id);
                    showToast("Student removed", "success");
                    onSuccess();
                    fetchStudents();
                  }}
                  onViewFees={canViewFees ? () => setFeeStudent(student) : undefined}
                  onShareQr={() => setQrStudent(student)}
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
      </PageContent>

      <StudentFormSheet
        open={showForm}
        onClose={closeForm}
        classes={classes}
        student={editingStudent}
        onSuccess={fetchStudents}
        onShowToast={(message) => showToast(message, "success")}
      />

      {canViewFees && <FeeSheet student={feeStudent} onClose={() => setFeeStudent(null)} />}
      <ParentQrSheet student={qrStudent} onClose={() => setQrStudent(null)} />
    </>
  );
}
