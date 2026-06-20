"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DateInput } from "@/components/ui/DateInput";
import { FormField } from "@/components/ui/FormField";
import { ErrorMsg } from "@/components/ui/ErrorMsg";
import {
  feeService,
  getErrorMessage,
  formatDate,
  formatInr,
  type FeePlan,
  type Installment,
} from "@/services/feeService";

interface FeeDetailSheetProps {
  open: boolean;
  studentId: number | null;
  studentName?: string;
  onClose: () => void;
  onUpdated: () => void;
  onShowToast: (message: string, type?: "success" | "error") => void;
}

function StatusBadge({ status }: { status: Installment["status"] }) {
  const styles = {
    paid:    { bg: "#ecfdf5",           color: "var(--success)", label: "Paid" },
    overdue: { bg: "var(--error-bg)",   color: "var(--error)",   label: "Overdue" },
    pending: { bg: "var(--ink-100)",    color: "var(--ink-500)", label: "Pending" },
    partial: { bg: "var(--warning-bg)", color: "var(--warning)", label: "Partial" },
  }[status] ?? { bg: "var(--ink-100)", color: "var(--ink-500)", label: status };

  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: "var(--radius-full)",
        background: styles.bg,
        color: styles.color,
        whiteSpace: "nowrap",
      }}
    >
      {styles.label}
    </span>
  );
}

export function FeeDetailSheet({
  open,
  studentId,
  studentName,
  onClose,
  onUpdated,
  onShowToast,
}: FeeDetailSheetProps) {
  const [feePlan, setFeePlan] = useState<FeePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payTarget, setPayTarget] = useState<Installment | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payError, setPayError] = useState("");

  useEffect(() => {
    if (!open || !studentId) {
      setFeePlan(null);
      setPayTarget(null);
      return;
    }

    setLoading(true);
    feeService
      .getPlanByStudent(studentId)
      .then(setFeePlan)
      .catch(() => setFeePlan(null))
      .finally(() => setLoading(false));
  }, [open, studentId]);

  const openPayForm = (installment: Installment) => {
    setPayTarget(installment);
    const instRemaining = installment.amount - (installment.paid_amount ?? 0);
    const planRemaining = feePlan ? Math.max(feePlan.total_amount - feePlan.paid_amount, 0) : instRemaining;
    setPayAmount(String(Math.min(instRemaining, planRemaining)));
    setPayError("");
  };

  const closePayForm = () => {
    if (payingId) return;
    setPayTarget(null);
    setPayAmount("");
    setPayError("");
  };

  const confirmPayment = async () => {
    if (!payTarget) return;

    const amount = Number(payAmount);
    if (!payAmount.trim() || Number.isNaN(amount) || amount <= 0) {
      setPayError("Enter a valid amount received");
      return;
    }

    setPayingId(payTarget.id);
    setPayError("");
    try {
      const updated = await feeService.payInstallment(payTarget.id, amount);
      setFeePlan(updated);
      setPayTarget(null);
      setPayAmount("");
      onShowToast("Payment recorded", "success");
      onUpdated();
    } catch (error) {
      setPayError(getErrorMessage(error, "Failed to record payment"));
    } finally {
      setPayingId(null);
    }
  };

  const formatPaidLine = (inst: Installment) => {
    const received = inst.paid_amount ?? inst.amount;
    if (received !== inst.amount) {
      return `Received ${formatInr(received)} (due ${formatInr(inst.amount)})`;
    }
    return `Received ${formatInr(received)}`;
  };

  if (!open || !studentId) return null;

  const pending = feePlan ? Math.max(feePlan.total_amount - feePlan.paid_amount, 0) : 0;

  return (
    <BottomSheet open={open} onClose={onClose} title="Fee details">
      {studentName && (
        <p style={{ fontSize: "13px", color: "var(--ink-500)", marginBottom: 16 }}>{studentName}</p>
      )}

      {loading && (
        <p style={{ textAlign: "center", color: "var(--ink-400)", padding: "32px 0" }}>Loading...</p>
      )}

      {!loading && !feePlan && (
        <p style={{ textAlign: "center", color: "var(--ink-500)", padding: "32px 0", fontSize: "14px" }}>
          No fee plan found for this student.
        </p>
      )}

      {!loading && feePlan && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
            {[
              { label: "Total", value: formatInr(feePlan.total_amount), color: "var(--ink-900)" },
              { label: "Paid", value: formatInr(feePlan.paid_amount), color: "var(--success)" },
              { label: "Pending", value: formatInr(pending), color: pending > 0 ? "var(--error)" : "var(--success)" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: "12px 10px",
                  background: "var(--ink-50)",
                  borderRadius: "var(--radius-md)",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "10px", color: "var(--ink-500)", marginBottom: 4, fontWeight: 600 }}>
                  {stat.label}
                </p>
                <p
                  style={{
                    fontSize: "14px",
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
            {feePlan.installments.map((inst, index) => {
              const canPay = inst.status !== "paid";
              const isOverdue = inst.status === "overdue";
              const isPartial = inst.status === "partial";
              const isPayOpen = payTarget?.id === inst.id;
              const remaining = inst.amount - (inst.paid_amount ?? 0);

              const cardBg = isOverdue ? "var(--error-bg)" : isPartial ? "var(--warning-bg)" : "var(--surface-0)";
              const cardBorder = isOverdue ? "var(--error-border)" : isPartial ? "var(--warning-border)" : "var(--ink-200)";

              return (
                <div
                  key={inst.id}
                  style={{
                    padding: "12px 14px",
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink-900)", marginBottom: 2 }}>
                        Installment {index + 1} · {formatInr(inst.amount)}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--ink-500)" }}>
                        Due {formatDate(inst.due_date)}
                        {inst.paid_date
                          ? ` · ${formatPaidLine(inst)} on ${formatDate(inst.paid_date)}`
                          : ""}
                      </p>
                      {isPartial && (
                        <p style={{ fontSize: "12px", color: "var(--warning)", fontWeight: 600, marginTop: 2 }}>
                          {formatInr(inst.paid_amount ?? 0)} paid · {formatInr(remaining)} remaining
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <StatusBadge status={inst.status} />
                      {canPay && !isPayOpen && (
                        <button
                          type="button"
                          disabled={!!payTarget && payTarget.id !== inst.id}
                          onClick={() => openPayForm(inst)}
                          style={{
                            minHeight: 36,
                            padding: "0 12px",
                            borderRadius: "var(--radius-sm)",
                            border: `1px solid ${isPartial ? "var(--warning-border)" : "var(--brand-200)"}`,
                            background: isPartial ? "var(--warning-bg)" : "var(--brand-accent)",
                            color: isPartial ? "var(--warning)" : "var(--brand-primary)",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: payTarget ? "not-allowed" : "pointer",
                            opacity: payTarget && payTarget.id !== inst.id ? 0.5 : 1,
                            fontFamily: "var(--font-body)",
                          }}
                        >
                          {isPartial ? "Add payment" : "Mark paid"}
                        </button>
                      )}
                    </div>
                  </div>

                  {isPayOpen && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: "1px solid var(--ink-200)",
                      }}
                    >
                      <FormField
                        label="Amount received (₹)"
                        required
                        error={payError}
                        hint={
                          inst.status === "partial"
                            ? `${formatInr(inst.paid_amount ?? 0)} already paid. ${formatInr(inst.amount - (inst.paid_amount ?? 0))} remaining. Enter amount received now.`
                            : `Installment due is ${formatInr(inst.amount)}. Enter what the parent actually paid.`
                        }
                      >
                        <Input
                          type="number"
                          placeholder={String(inst.amount)}
                          value={payAmount}
                          onChange={setPayAmount}
                          error={payError}
                        />
                      </FormField>

                      <div className="vt-sheet-actions" style={{ marginTop: 4 }}>
                        <Button
                          variant="secondary"
                          onClick={closePayForm}
                          disabled={payingId === inst.id}
                          fullWidth
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={confirmPayment}
                          loading={payingId === inst.id}
                          disabled={payingId === inst.id}
                          fullWidth
                        >
                          Confirm payment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </BottomSheet>
  );
}

interface AddFeePlanSheetProps {
  open: boolean;
  onClose: () => void;
  students: { id: number; name: string; class_name: string }[];
  preselectedStudentId?: number | null;
  onSuccess: () => void;
  onShowToast: (message: string, type?: "success" | "error") => void;
}

export function AddFeePlanSheet({
  open,
  onClose,
  students,
  preselectedStudentId,
  onSuccess,
  onShowToast,
}: AddFeePlanSheetProps) {
  const [studentId, setStudentId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [installments, setInstallments] = useState([{ amount: "", due_date: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStudentId(preselectedStudentId ? String(preselectedStudentId) : "");
    setTotalAmount("");
    setInstallments([{ amount: "", due_date: "" }]);
    setError("");
  }, [open, preselectedStudentId]);

  const installmentSum = installments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const total = Number(totalAmount) || 0;
  const totalsMatch = total > 0 && installmentSum === total;
  const sumExceedsTotal = total > 0 && installmentSum > total;
  const allRowsFilled = installments.every((item) => Number(item.amount) > 0 && !!item.due_date);
  const isFormValid = !!studentId && total > 0 && allRowsFilled && totalsMatch;

  const addRow = () => {
    setInstallments((current) => [...current, { amount: "", due_date: "" }]);
  };

  const updateRow = (index: number, field: "amount" | "due_date", value: string) => {
    setInstallments((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeRow = (index: number) => {
    if (installments.length === 1) return;
    setInstallments((current) => current.filter((_, i) => i !== index));
  };

  const submit = async () => {
    if (!studentId) {
      setError("Select a student");
      return;
    }
    if (!total || total <= 0) {
      setError("Enter a valid total amount");
      return;
    }
    if (!allRowsFilled) {
      setError("Fill in all installment amounts and due dates");
      return;
    }
    if (sumExceedsTotal) {
      setError(`Installments total (${formatInr(installmentSum)}) cannot exceed total amount (${formatInr(total)})`);
      return;
    }
    if (!totalsMatch) {
      setError(`Installments must add up to ${formatInr(total)} (currently ${formatInr(installmentSum)})`);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await feeService.createPlan({
        student_id: Number(studentId),
        total_amount: total,
        installments: installments.map((item) => ({
          amount: Number(item.amount),
          due_date: item.due_date,
        })),
      });
      onShowToast("Fee plan created", "success");
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create fee plan"));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Add fee plan"
      footer={
        <Button variant="primary" onClick={submit} loading={loading} disabled={loading || !isFormValid} fullWidth>
          Create fee plan
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormField label="Student" required>
          <Select
            value={studentId}
            onChange={setStudentId}
            placeholder="Select student"
            disabled={!!preselectedStudentId}
            options={students.map((student) => ({
              value: String(student.id),
              label: `${student.name} · ${student.class_name}`,
            }))}
          />
        </FormField>

        <FormField label="Total amount (₹)" required>
          <Input
            type="number"
            placeholder="e.g. 30000"
            value={totalAmount}
            onChange={setTotalAmount}
          />
        </FormField>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--ink-700)" }}>
              Installments<span style={{ color: "var(--brand-primary)", marginLeft: 3 }}>*</span>
            </span>
            <button
              type="button"
              onClick={addRow}
              style={{
                border: "none",
                background: "none",
                color: "var(--brand-primary)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                padding: "8px 0",
              }}
            >
              + Add row
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {installments.map((row, index) => (
              <div key={index} className="vt-installment-row">
                <div className="vt-installment-row-top">
                  <span className="vt-installment-row-label">Installment {index + 1}</span>
                  <button
                    type="button"
                    className="vt-installment-remove"
                    onClick={() => removeRow(index)}
                    disabled={installments.length === 1}
                    aria-label="Remove installment row"
                  >
                    ×
                  </button>
                </div>
                <div className="vt-installment-row-fields">
                  <FormField label="Amount">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={row.amount}
                      onChange={(value) => updateRow(index, "amount", value)}
                    />
                  </FormField>
                  <FormField label="Due date">
                    <DateInput
                      value={row.due_date}
                      onChange={(value) => updateRow(index, "due_date", value)}
                    />
                  </FormField>
                </div>
                <button
                  type="button"
                  className="vt-installment-remove vt-installment-remove-desktop"
                  onClick={() => removeRow(index)}
                  disabled={installments.length === 1}
                  aria-label="Remove installment row"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {total > 0 && (
            <p
              style={{
                marginTop: 10,
                fontSize: "12px",
                fontWeight: 600,
                color: totalsMatch
                  ? "var(--success)"
                  : sumExceedsTotal
                  ? "var(--error)"
                  : "var(--warning)",
              }}
            >
              {totalsMatch
                ? `✓ Installments match total ${formatInr(total)}`
                : sumExceedsTotal
                ? `✗ Exceeds total by ${formatInr(installmentSum - total)}`
                : `${formatInr(installmentSum)} of ${formatInr(total)} — remaining ${formatInr(total - installmentSum)}`}
            </p>
          )}
        </div>

        <ErrorMsg msg={error} />
      </div>
    </BottomSheet>
  );
}
