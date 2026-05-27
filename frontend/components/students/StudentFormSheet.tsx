"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DateInput } from "@/components/ui/DateInput";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import {
  studentService,
  getErrorMessage,
  type CreateStudentPayload,
  type Student,
} from "@/services/studentService";

interface ClassOption {
  id: number;
  name: string;
}

interface FieldError {
  [key: string]: string;
}

const EMPTY_FORM = {
  full_name: "",
  admission_date: "",
  class_id: "",
  parent_name: "",
  parent_phone: "",
  address: "",
};

function toFormDate(dateStr: string) {
  return dateStr.slice(0, 10);
}

function validateForm(form: typeof EMPTY_FORM) {
  const errors: FieldError = {};
  if (!form.full_name.trim()) errors.full_name = "Name is required";
  if (!form.class_id) errors.class_id = "Class is required";
  if (!form.admission_date) errors.admission_date = "Admission date is required";
  if (!form.parent_name.trim()) errors.parent_name = "Parent name is required";
  if (!form.parent_phone.trim()) errors.parent_phone = "Parent phone is required";
  else if (!/^[6-9]\d{9}$/.test(form.parent_phone)) errors.parent_phone = "Enter valid 10-digit number";
  return errors;
}

export function StudentFormSheet({
  open,
  onClose,
  classes,
  student,
  onSuccess,
  onShowToast,
}: {
  open: boolean;
  onClose: () => void;
  classes: ClassOption[];
  student?: Student | null;
  onSuccess: () => void;
  onShowToast?: (message: string) => void;
}) {
  const isEditing = Boolean(student);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (student) {
      setForm({
        full_name: student.full_name,
        admission_date: toFormDate(student.admission_date),
        class_id: String(student.class_id),
        parent_name: student.parent_name,
        parent_phone: student.parent_phone,
        address: student.address ?? "",
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        class_id: classes.length === 1 ? String(classes[0].id) : "",
      });
    }
    setErrors({});
    setApiError("");
  }, [open, student, classes]);

  const set = (field: keyof typeof EMPTY_FORM) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const submit = async () => {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setApiError("");

    const payload: CreateStudentPayload = {
      full_name: form.full_name.trim(),
      admission_date: form.admission_date,
      class_id: Number(form.class_id),
      parent_name: form.parent_name.trim(),
      parent_phone: form.parent_phone.trim(),
      address: form.address.trim(),
    };

    try {
      if (student) {
        await studentService.update(student.id, payload);
        onShowToast?.("Student updated successfully");
      } else {
        await studentService.create(payload);
        onShowToast?.("Student added successfully");
      }
      onSuccess();
      onClose();
    } catch (err) {
      setApiError(getErrorMessage(err, isEditing ? "Failed to update student" : "Failed to add student"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit student" : "Add student"}
      footer={
        <Button variant="primary" onClick={submit} loading={loading} disabled={loading} fullWidth>
          {loading ? (isEditing ? "Saving..." : "Adding...") : isEditing ? "Save changes" : "Add student"}
        </Button>
      }
    >
      {isEditing && student?.roll_number && (
        <FormField label="Roll number">
          <Input value={student.roll_number} onChange={() => {}} placeholder="Roll number" disabled />
        </FormField>
      )}

      <FormField label="Full name" required error={errors.full_name}>
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

      <FormField label="Admission date" required error={errors.admission_date}>
        <DateInput
          value={form.admission_date}
          onChange={set("admission_date")}
          error={errors.admission_date}
        />
      </FormField>

      <FormField label="Parent name" required error={errors.parent_name}>
        <Input
          placeholder="Parent's full name"
          value={form.parent_name}
          onChange={set("parent_name")}
          error={errors.parent_name}
        />
      </FormField>

      <FormField label="Parent phone" required error={errors.parent_phone}>
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
        <div className="vt-error-banner" style={{ marginBottom: 16 }}>
          {apiError}
        </div>
      )}
    </BottomSheet>
  );
}
