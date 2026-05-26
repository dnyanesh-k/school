"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { TabAddButton } from "@/components/layout/TabAddButton";
import { ClassFilterTabs } from "@/components/common/ClassFilterTabs";
import { BottomSheet } from "@/components/common/BottomSheet";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DateInput } from "@/components/ui/DateInput";
import { FormField } from "@/components/ui/FormField";
import { ErrorMsg } from "@/components/ui/ErrorMsg";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { studentService, type Student, type CreateStudentPayload } from "@/services/studentService";
import { Pagination } from "@/components/common/Pagination";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { feeService } from "@/services/feeService";
import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Class { id: number; name: string; }
interface FieldError { [key: string]: string; }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ hasClasses }: { hasClasses: boolean }) {
  return (
    <div className="vt-empty animate-fadeUp">
      <p className="vt-empty-title">
        {hasClasses ? "No students yet" : "No classes set up"}
      </p>
      <p className="vt-empty-desc">
        {hasClasses
          ? "Use Add student above to enroll your first student."
          : "Go to Settings and add classes before adding students."}
      </p>
    </div>
  );
}

// ─── Student Card ─────────────────────────────────────────────────────────────
function StudentCard({ student, onViewFees }: { student: Student; onViewFees: (s: Student) => void }) {
  return (
    <div style={{
      background: "var(--surface-0)",
      borderRadius: "var(--radius-lg)",
      padding: "16px",
      boxShadow: "var(--shadow-sm)",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        background: "var(--brand-accent)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "14px", color: "var(--brand-primary)",
        }}>
          {getInitials(student.full_name)}
        </span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 600,
          fontSize: "15px", color: "var(--ink-900)",
          marginBottom: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {student.full_name}
        </p>
        <p style={{ fontSize: "12px", color: "var(--ink-500)", marginBottom: 2 }}>
          {student.class_name} · Admitted {formatDate(student.admission_date)}
        </p>
        <p style={{ fontSize: "12px", color: "var(--ink-500)" }}>
          Parent: {student.parent_phone}
        </p>
      </div>

      {/* Fees button */}
      <button
        onClick={() => onViewFees(student)}
        style={{
          flexShrink: 0,
          padding: "6px 12px",
          borderRadius: "var(--radius-sm)",
          background: "var(--brand-accent)",
          border: "1px solid var(--brand-200)",
          fontSize: "12px", fontWeight: 600,
          color: "var(--brand-primary)",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          whiteSpace: "nowrap",
        }}
      >
        Fees
      </button>
    </div>
  );
}

// ─── Add Student Sheet ────────────────────────────────────────────────────────
function AddStudentSheet({
  open, onClose, classes, onSuccess, onShowToast,
}: {
  open: boolean; onClose: () => void;
  classes: Class[]; onSuccess: () => void;
  onShowToast?: (message: string) => void;
}) {
  const empty = { full_name: "", admission_date: "", class_id: "", parent_name: "", parent_phone: "", address: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (field: string) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e: FieldError = {};
    if (!form.full_name.trim()) e.full_name = "Name is required";
    if (!form.class_id) e.class_id = "Class is required";
    if (!form.admission_date) e.admission_date = "Admission date is required";
    if (!form.parent_name.trim()) e.parent_name = "Parent name is required";
    if (!form.parent_phone.trim()) e.parent_phone = "Parent phone is required";
    else if (!/^[6-9]\d{9}$/.test(form.parent_phone)) e.parent_phone = "Enter valid 10-digit number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      await studentService.create({
        full_name: form.full_name,
        admission_date: form.admission_date,
        class_id: Number(form.class_id),
        parent_name: form.parent_name,
        parent_phone: form.parent_phone,
        address: form.address,
      } as CreateStudentPayload);
      setForm(empty);
      onShowToast?.("Student added successfully");
      onSuccess();
      onClose();
    } catch {
      setApiError("Failed to add student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Add Student"
      footer={
        <Button variant="primary" onClick={submit} loading={loading} disabled={loading} fullWidth>
          {loading ? "Adding..." : "Add Student"}
        </Button>
      }
    >
      <FormField label="Full Name" required error={errors.full_name}>
        <Input
          placeholder="Student's full name"
          value={form.full_name}
          onChange={set("full_name")}
          error={errors.full_name}
        />
      </FormField>

      <FormField label="Class" required error={errors.class_id}>
        <Select
          value={form.class_id}
          onChange={set("class_id")}
          placeholder="Select class"
          error={errors.class_id}
          options={classes.map((c) => ({ value: String(c.id), label: c.name }))}
        />
      </FormField>

      <FormField label="Admission Date" required error={errors.admission_date}>
        <DateInput
          value={form.admission_date}
          onChange={set("admission_date")}
          error={errors.admission_date}
        />
      </FormField>

      <FormField label="Parent Name" required error={errors.parent_name}>
        <Input
          placeholder="Parent's full name"
          value={form.parent_name}
          onChange={set("parent_name")}
          error={errors.parent_name}
        />
      </FormField>

      <FormField label="Parent Phone" required error={errors.parent_phone}>
        <Input
          type="tel"
          placeholder="9876543210"
          value={form.parent_phone}
          onChange={set("parent_phone")}
          error={errors.parent_phone}
          prefix="+91"
        />
      </FormField>

      <FormField label="Address">
        <Input placeholder="Address (optional)" value={form.address} onChange={set("address")} />
      </FormField>

      {apiError && (
        <div
          style={{
            padding: "12px 14px",
            background: "var(--error-bg)",
            border: "1px solid var(--error-border)",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            color: "var(--error)",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>⚠</span> {apiError}
        </div>
      )}
    </BottomSheet>
  );
}

// ─── Fee Status Sheet ─────────────────────────────────────────────────────────
function FeeSheet({ student, onClose }: { student: Student | null; onClose: () => void }) {
  const [feePlan, setFeePlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!student) return;
    setLoading(true);
    feeService.getPlanByStudent(student.id)
      .then(setFeePlan)
      .catch(() => setFeePlan(null))
      .finally(() => setLoading(false));
  }, [student]);

  if (!student) return null;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "var(--surface-0)",
        borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
        zIndex: 201, maxHeight: "80dvh", overflowY: "auto",
        padding: "0 20px 40px",
        maxWidth: "560px", margin: "0 auto",
      }}>
        <div style={{ width: 36, height: 4, background: "var(--ink-200)", borderRadius: 2, margin: "12px auto 20px" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px", color: "var(--ink-900)" }}>
              Fee Status
            </h2>
            <p style={{ fontSize: "13px", color: "var(--ink-500)", marginTop: 2 }}>{student.full_name}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--ink-400)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {loading && <p style={{ textAlign: "center", color: "var(--ink-400)", padding: "32px 0" }}>Loading...</p>}

        {!loading && !feePlan && (
          <p style={{ textAlign: "center", color: "var(--ink-500)", padding: "32px 0", fontSize: "14px" }}>
            No fee plan added yet.
          </p>
        )}

        {!loading && feePlan && (
          <>
            {/* Summary */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 12, marginBottom: 20,
            }}>
              {[
                { label: "Total Fees", value: `₹${feePlan.total_amount.toLocaleString("en-IN")}`, color: "var(--ink-900)" },
                { label: "Paid", value: `₹${feePlan.paid_amount.toLocaleString("en-IN")}`, color: "var(--success)" },
                { label: "Pending", value: `₹${(feePlan.total_amount - feePlan.paid_amount).toLocaleString("en-IN")}`, color: "var(--error)" },
              ].map(stat => (
                <div key={stat.label} style={{
                  padding: "14px", background: "var(--ink-50)",
                  borderRadius: "var(--radius-md)",
                }}>
                  <p style={{ fontSize: "11px", color: "var(--ink-500)", marginBottom: 4 }}>{stat.label}</p>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: stat.color, fontFamily: "var(--font-display)" }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Installments */}
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink-700)", marginBottom: 10 }}>Installments</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {feePlan.installments.map((inst: any, i: number) => {
                const overdue = inst.status === "overdue";
                const paid = inst.status === "paid";
                return (
                  <div key={inst.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px",
                    background: overdue ? "var(--error-bg)" : "var(--surface-0)",
                    border: `1px solid ${overdue ? "var(--error-border)" : "var(--ink-200)"}`,
                    borderRadius: "var(--radius-md)",
                  }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--ink-900)" }}>
                        Installment {i + 1} · ₹{inst.amount.toLocaleString("en-IN")}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--ink-500)", marginTop: 2 }}>
                        Due: {formatDate(inst.due_date)}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: "11px", fontWeight: 600, padding: "3px 8px",
                        borderRadius: "var(--radius-full)",
                        background: paid ? "#dcfce7" : overdue ? "var(--error-bg)" : "var(--ink-100)",
                        color: paid ? "var(--success)" : overdue ? "var(--error)" : "var(--ink-500)",
                      }}>
                        {paid ? "Paid" : overdue ? "Overdue" : "Pending"}
                      </span>
                      {/* WhatsApp button for overdue */}
                      {overdue && (
                        <a
                          href={feeService.buildWhatsAppUrl(
                            student.parent_phone, student.full_name,
                            inst.amount, formatDate(inst.due_date)
                          )}
                          target="_blank" rel="noreferrer"
                          style={{
                            display: "flex", alignItems: "center", gap: 4,
                            padding: "5px 10px",
                            background: "#25D366", borderRadius: "var(--radius-sm)",
                            fontSize: "12px", fontWeight: 600, color: "white",
                            textDecoration: "none",
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.126 1.526 5.855L.057 23.882l6.186-1.438A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.36-.214-3.722.865.93-3.617-.235-.372A9.818 9.818 0 0 1 2.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
                          </svg>
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
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentsPage() {
  const { showToast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [feeStudent, setFeeStudent] = useState<Student | null>(null);

  // Fetch classes
  useEffect(() => {
    api.get(API_URLS.CLASSES.LIST)
      .then(r => setClasses(r.data))
      .catch(() => { });
  }, []);

  // Fetch students when class filter changes
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
  }, [selectedClass]);

  useEffect(() => { fetchStudents(); }, [selectedClass, page]);

  return (
    <>
      <TopBar title="Students" />

      <ClassFilterTabs
        classes={classes}
        selectedClass={selectedClass}
        onSelect={setSelectedClass}
        showAll
      />

      {!loading && classes.length > 0 && (
        <div className="vt-tab-toolbar">
          <p className="vt-tab-count">
            {students.length > 0 ? `${total} student${total !== 1 ? "s" : ""}` : "No students yet"}
          </p>
          <TabAddButton label="Add student" onClick={() => setShowAdd(true)} />
        </div>
      )}

      {loading && <ListSkeleton count={4} />}

      {/* ── Empty state ── */}
      {!loading && students.length === 0 && (
        <EmptyState hasClasses={classes.length > 0} />
      )}

      {/* ── Student list ── */}
      {!loading && students.length > 0 && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {students.map(s => (
              <StudentCard key={s.id} student={s} onViewFees={setFeeStudent} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} loading={loading} />
        </>
      )}

      {/* ── Add student sheet ── */}
      <AddStudentSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        classes={classes}
        onSuccess={fetchStudents}
        onShowToast={(message) => showToast(message, "success")}
      />

      {/* ── Fee sheet ── */}
      <FeeSheet
        student={feeStudent}
        onClose={() => setFeeStudent(null)}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}