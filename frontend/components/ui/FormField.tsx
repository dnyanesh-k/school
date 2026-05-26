"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/Label";
import { ErrorMsg } from "@/components/ui/ErrorMsg";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function FormField({ label, required, error, hint, children }: FormFieldProps) {
  return (
    <div className="vt-form-field">
      <Label required={required}>{label}</Label>
      {children}
      {hint && !error ? <p className="vt-form-hint">{hint}</p> : null}
      <ErrorMsg msg={error} />
    </div>
  );
}
