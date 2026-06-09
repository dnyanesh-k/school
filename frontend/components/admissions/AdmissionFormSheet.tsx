"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DateInput } from "@/components/ui/DateInput";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import {
  admissionService,
  type Admission,
  type AdmissionStatus,
  type CreateAdmissionPayload,
} from "@/services/admissionService";

interface ClassOption {
  id: number;
  name: string;
}

interface FieldError {
  [key: string]: string;
}

const EMPTY_FORM = {
  candidate_name: "",
  parent_name: "",
  phone: "",
  class_id: "",
  visit_date: new Date().toISOString().slice(0, 10),
  status: "inquiry" as AdmissionStatus,
};

function validateForm(form: typeof EMPTY_FORM) {
  const errors: FieldError = {};
  if (!form.candidate_name.trim()) errors.candidate_name = "Candidate name is required";
  if (!form.parent_name.trim()) errors.parent_name = "Parent name is required";
  if (!form.phone.trim()) errors.phone = "Phone is required";
  else if (!/^[6-9]\d{9}$/.test(form.phone)) errors.phone = "Enter valid 10-digit number";
  if (!form.class_id) errors.class_id = "Class is required";
  if (!form.visit_date) errors.visit_date = "Visit date is required";
  return errors;
}

export function AdmissionFormSheet({
  open,
  onClose,
  classes,
  admission,
  onSuccess,
  onShowToast,
}: {
  open: boolean;
  onClose: () => void;
  classes: ClassOption[];
  admission?: Admission | null;
  onSuccess: () => void;
  onShowToast?: (message: string) => void;
}) {
  const isEditing = Boolean(admission);
  const isConverted = Boolean(admission?.converted_student_id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (admission) {
      setForm({
        candidate_name: admission.candidate_name,
        parent_name: admission.parent_name,
        phone: admission.phone,
        class_id: String(admission.class_id),
        visit_date: admission.visit_date.slice(0, 10),
        status: admission.status,
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        class_id: classes.length === 1 ? String(classes[0].id) : "",
        visit_date: new Date().toISOString().slice(0, 10),
      });
    }
    setErrors({});
    setApiError("");
  }, [open, admission, classes]);

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

    const payload: CreateAdmissionPayload = {
      candidate_name: form.candidate_name.trim(),
      parent_name: form.parent_name.trim(),
      phone: form.phone.trim(),
      class_id: Number(form.class_id),
      visit_date: form.visit_date,
      status: form.status,
    };

    try {
      if (admission) {
        await admissionService.update(admission.id, payload);
        onShowToast?.("Admission updated");
      } else {
        await admissionService.create(payload);
        onShowToast?.("Admission added");
      }
      onSuccess();
      onClose();
    } catch {
      setApiError(isEditing ? "Failed to update admission" : "Failed to add admission");
    } finally {
      setLoading(false);
    }
  };

  const STATUS_OPTIONS: { value: AdmissionStatus; label: string }[] = [
    { value: "inquiry",  label: "Inquiry" },
    { value: "admitted", label: "Admitted" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit admission" : "New admission"}
      footer={
        <Button variant="primary" onClick={submit} loading={loading} disabled={loading} fullWidth>
          {loading
            ? isEditing ? "Saving..." : "Adding..."
            : isEditing ? "Save changes" : "Add admission"}
        </Button>
      }
    >
      <FormField label="Candidate name" required error={errors.candidate_name}>
        <Input
          placeholder="Student's full name"
          value={form.candidate_name}
          onChange={set("candidate_name")}
          error={errors.candidate_name}
        />
      </FormField>

      <FormField label="Class applying for" required error={errors.class_id}>
        <Select
          value={form.class_id}
          onChange={set("class_id")}
          placeholder="Select class"
          error={errors.class_id}
          options={classes.map((c) => ({ value: String(c.id), label: c.name }))}
        />
      </FormField>

      <FormField label="Visit date" required error={errors.visit_date}>
        <DateInput
          value={form.visit_date}
          onChange={set("visit_date")}
          error={errors.visit_date}
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

      <FormField label="Parent phone" required error={errors.phone}>
        <Input
          type="tel"
          placeholder="9876543210"
          value={form.phone}
          onChange={set("phone")}
          error={errors.phone}
          prefix="+91"
        />
      </FormField>

      {isConverted ? (
        <div
          style={{
            padding: "10px 14px",
            background: "#dcfce7",
            border: "1px solid #86efac",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            color: "#15803d",
            fontWeight: 500,
            marginBottom: 4,
          }}
        >
          ✓ Enrolled as student — status is locked
        </div>
      ) : (
        <FormField label="Status" error={errors.status}>
          <Select
            value={form.status}
            onChange={set("status")}
            placeholder="Select status"
            options={STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
          />
        </FormField>
      )}

      {apiError && (
        <div className="vt-error-banner" style={{ marginBottom: 16 }}>
          {apiError}
        </div>
      )}
    </BottomSheet>
  );
}
