"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PageContent } from "@/components/layout/PageContent";
import { TabAddButton } from "@/components/layout/TabAddButton";
import { ClassFilterTabs } from "@/components/common/ClassFilterTabs";
import { BottomSheet } from "@/components/common/BottomSheet";
import { Pagination } from "@/components/common/Pagination";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/hooks/useToast";
import { studentService, type Student } from "@/services/studentService";
import { feeService } from "@/services/feeService";
import { authService } from "@/services/authService";
import { StudentFormSheet } from "@/components/students/StudentFormSheet";
import { StudentListItem } from "@/components/students/StudentListItem";
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
        {student.full_name}
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
                          formatDate(inst.due_date)
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
  const [search, setSearch] = useState("");

  const canViewFees = authService.canViewFees();

  useEffect(() => {
    api
      .get(API_URLS.CLASSES.LIST)
      .then((r) => setClasses(r.data))
      .catch(() => {});
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
            <TabAddButton label="Add student" onClick={openAdd} />
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
    </>
  );
}
