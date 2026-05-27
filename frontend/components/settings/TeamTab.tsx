"use client";

import { useCallback, useEffect, useState } from "react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { TabAddButton } from "@/components/layout/TabAddButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { ErrorMsg } from "@/components/ui/ErrorMsg";
import { userService, getErrorMessage } from "@/services/userService";
import type { AuthUser } from "@/services/authService";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function AddTeacherSheet({
  open,
  onClose,
  onSuccess,
  onShowToast,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onShowToast: (message: string, type?: "success" | "error") => void;
}) {
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ full_name: "", email: "", password: "" });
    setError("");
  }, [open]);

  const submit = async () => {
    if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("All fields are required");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await userService.createTeacher(form);
      onShowToast("Teacher account created", "success");
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create teacher"));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Add teacher"
      footer={
        <Button variant="primary" onClick={submit} loading={loading} disabled={loading} fullWidth>
          Create account
        </Button>
      }
    >
      <p style={{ fontSize: "14px", color: "var(--ink-500)", lineHeight: 1.5, marginBottom: 16 }}>
        Teachers can manage students, attendance, tests, and settings. Fee management stays with the institute admin.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <FormField label="Full name" required>
          <Input placeholder="Teacher name" value={form.full_name} onChange={(v) => setForm((f) => ({ ...f, full_name: v }))} />
        </FormField>
        <FormField label="Email" required>
          <Input type="email" placeholder="teacher@school.com" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
        </FormField>
        <FormField label="Temporary password" required>
          <Input type="password" placeholder="Min 8 characters" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} />
        </FormField>
        <ErrorMsg msg={error} />
      </div>
    </BottomSheet>
  );
}

export function TeamTab({ onShowToast }: { onShowToast: (message: string, type?: "success" | "error") => void }) {
  const [teachers, setTeachers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.listTeachers();
      setTeachers(data);
    } catch (err) {
      setTeachers([]);
      onShowToast(getErrorMessage(err, "Failed to load teachers"), "error");
    } finally {
      setLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  return (
    <>
      <div className="vt-tab-toolbar">
        <p className="vt-tab-count">
          {teachers.length} teacher{teachers.length !== 1 ? "s" : ""}
        </p>
        <TabAddButton label="Add teacher" onClick={() => setShowAdd(true)} />
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ height: 72, borderRadius: "var(--radius-lg)", background: "var(--ink-100)" }} />
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div className="vt-empty animate-fadeUp">
          <p className="vt-empty-title">No teachers yet</p>
          <p className="vt-empty-desc">Use Add teacher above to invite your first team member.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: "var(--surface-0)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "var(--brand-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "13px", color: "var(--brand-primary)" }}>
                  {getInitials(teacher.full_name)}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "15px", color: "var(--ink-900)", marginBottom: 2 }}>
                  {teacher.full_name}
                </p>
                <p style={{ fontSize: "12px", color: "var(--ink-500)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {teacher.email}
                </p>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--brand-accent)",
                  color: "var(--brand-primary)",
                }}
              >
                Teacher
              </span>
            </div>
          ))}
        </div>
      )}

      <AddTeacherSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={loadTeachers}
        onShowToast={onShowToast}
      />
    </>
  );
}
