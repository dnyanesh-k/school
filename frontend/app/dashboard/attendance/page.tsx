"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PageContent } from "@/components/layout/PageContent";
import { ClassFilterTabs } from "@/components/common/ClassFilterTabs";
import { Pagination } from "@/components/common/Pagination";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { BottomSheet } from "@/components/common/BottomSheet";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { FormField } from "@/components/ui/FormField";
import { ErrorMsg } from "@/components/ui/ErrorMsg";
import { useToast } from "@/hooks/useToast";
import {
  attendanceService,
  getErrorMessage,
  type AbsentStreak,
  type AttendanceRecord,
  type ClassAttendanceResponse,
} from "@/services/attendanceService";
import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";
import { formatStudentName } from "@/components/students/StudentListItem";

interface ClassOption {
  id: number;
  name: string;
}

type PageView = "mark" | "alerts";

const STREAK_OPTIONS = [2, 3, 5, 7];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatSavedAt(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function AttendanceStatusBanner({
  isHoliday,
  isSubmitted,
  submittedAt,
  absentCount,
  dirty,
  saving,
}: {
  isHoliday: boolean;
  isSubmitted: boolean;
  submittedAt?: string | null;
  absentCount: number;
  dirty: boolean;
  saving: boolean;
}) {
  if (isHoliday) return null;

  let bg = "var(--ink-50)";
  let border = "var(--ink-200)";
  let color = "var(--ink-600)";
  let message = "Not marked yet — tap absent students (saves automatically)";

  if (saving) {
    bg = "var(--brand-accent)";
    border = "var(--brand-200)";
    color = "var(--brand-primary)";
    message = "Saving attendance…";
  } else if (dirty) {
    bg = "#fffbeb";
    border = "#fde68a";
    color = "#b45309";
    message = "Unsaved changes — auto-saving shortly";
  } else if (isSubmitted && submittedAt) {
    bg = "#ecfdf5";
    border = "#bbf7d0";
    color = "var(--success)";
    const time = formatSavedAt(submittedAt);
    message =
      absentCount > 0
        ? `Saved at ${time} · ${absentCount} absent`
        : `All present · saved at ${time}`;
  }

  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "var(--radius-md)",
        background: bg,
        border: `1px solid ${border}`,
        fontSize: "13px",
        color,
        lineHeight: 1.5,
        fontWeight: 500,
      }}
    >
      {message}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ViewToggle({ view, onChange }: { view: PageView; onChange: (view: PageView) => void }) {
  return (
    <SegmentedControl
      value={view}
      onChange={onChange}
      options={[
        { id: "mark", label: "Mark" },
        { id: "alerts", label: "Alerts" },
      ]}
    />
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "brand" | "success" | "error" | "neutral";
}) {
  const styles = {
    brand: { bg: "var(--brand-accent)", color: "var(--brand-primary)", border: "var(--brand-200)" },
    success: { bg: "#ecfdf5", color: "var(--success)", border: "#bbf7d0" },
    error: { bg: "var(--error-bg)", color: "var(--error)", border: "var(--error-border)" },
    neutral: { bg: "var(--ink-50)", color: "var(--ink-700)", border: "var(--ink-200)" },
  }[tone];

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: "12px 10px",
        borderRadius: "var(--radius-md)",
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "10px", color: "var(--ink-500)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "20px",
          color: styles.color,
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function AttendanceRow({
  student,
  disabled,
  onToggle,
}: {
  student: AttendanceRecord;
  disabled: boolean;
  onToggle: (studentId: number) => void;
}) {
  const isAbsent = student.status === "absent";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        background: "var(--surface-0)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        border: isAbsent ? "1px solid var(--error-border)" : "1px solid transparent",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: isAbsent ? "var(--error-bg)" : "var(--brand-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "13px",
            color: isAbsent ? "var(--error)" : "var(--brand-primary)",
          }}
        >
          {getInitials(student.student_name)}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "15px",
            color: "var(--ink-900)",
            marginBottom: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {formatStudentName(student.student_name)}
        </p>
        <p style={{ fontSize: "12px", color: "var(--ink-500)" }}>
          {student.roll_number ? `${student.roll_number} · ` : ""}
          {isAbsent ? "Absent" : "Present"}
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggle(student.student_id)}
        aria-label={isAbsent ? `Mark ${student.student_name} present` : `Mark ${student.student_name} absent`}
        style={{
          flexShrink: 0,
          minWidth: 88,
          minHeight: 44,
          padding: "8px 12px",
          borderRadius: "var(--radius-full)",
          border: "1.5px solid",
          borderColor: isAbsent ? "var(--success)" : "var(--error-border)",
          background: isAbsent ? "#ecfdf5" : "var(--error-bg)",
          color: isAbsent ? "var(--success)" : "var(--error)",
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: "var(--font-body)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
          transition: "all 0.15s ease",
        }}
      >
        {isAbsent ? "Present" : "Absent"}
      </button>
    </div>
  );
}

function AbsentStreakRow({ student }: { student: AbsentStreak }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        background: "var(--surface-0)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--error-border)",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: "var(--error-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "13px",
            color: "var(--error)",
          }}
        >
          {getInitials(student.student_name)}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "15px",
            color: "var(--ink-900)",
            marginBottom: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {student.student_name}
        </p>
        <p style={{ fontSize: "12px", color: "var(--ink-500)", marginBottom: 4 }}>
          {student.class_name} · {student.absent_days} day{student.absent_days !== 1 ? "s" : ""} absent
        </p>
        <span
          style={{
            display: "inline-flex",
            fontSize: "11px",
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: "var(--radius-full)",
            background: "var(--error-bg)",
            color: "var(--error)",
          }}
        >
          Needs follow-up
        </span>
      </div>

      <a
        href={attendanceService.buildWhatsAppUrl(
          student.parent_phone,
          student.student_name,
          student.absent_days
        )}
        target="_blank"
        rel="noreferrer"
        aria-label={`WhatsApp parent of ${student.student_name}`}
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          minWidth: 44,
          minHeight: 44,
          padding: "0 12px",
          background: "#25D366",
          borderRadius: "var(--radius-md)",
          fontSize: "12px",
          fontWeight: 600,
          color: "white",
          textDecoration: "none",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.126 1.526 5.855L.057 23.882l6.186-1.438A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.36-.214-3.722.865.93-3.617-.235-.372A9.818 9.818 0 0 1 2.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
        </svg>
        <span className="vt-wa-label">Notify</span>
      </a>
    </div>
  );
}

function EmptyClassesState() {
  return (
    <div className="vt-empty animate-fadeUp">
      <p className="vt-empty-title">No classes yet</p>
      <p className="vt-empty-desc">Add classes in Settings before marking attendance.</p>
    </div>
  );
}

function HolidaySheet({
  open,
  onClose,
  date,
  onSubmit,
  loading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  date: string;
  onSubmit: (reason: string) => void;
  loading: boolean;
  error: string;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Mark holiday"
      footer={
        <Button
          variant="primary"
          onClick={() => onSubmit(reason.trim())}
          loading={loading}
          disabled={loading || !reason.trim()}
          fullWidth
        >
          Save holiday
        </Button>
      }
    >
      <p style={{ fontSize: "14px", color: "var(--ink-500)", lineHeight: 1.5, marginBottom: 16 }}>
        Attendance cannot be submitted on <strong style={{ color: "var(--ink-800)" }}>{formatDisplayDate(date)}</strong>.
      </p>

      <FormField label="Reason" required error={error}>
        <Input
          placeholder="e.g. Diwali, Staff training"
          value={reason}
          onChange={setReason}
          error={error}
        />
      </FormField>
    </BottomSheet>
  );
}

export default function AttendancePage() {
  const { showToast } = useToast();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [activeView, setActiveView] = useState<PageView>("mark");
  const [attendance, setAttendance] = useState<ClassAttendanceResponse | null>(null);
  const [students, setStudents] = useState<AttendanceRecord[]>([]);
  const [streakStudents, setStreakStudents] = useState<AbsentStreak[]>([]);
  const [streakDays, setStreakDays] = useState(2);
  const [streakPage, setStreakPage] = useState(1);
  const [streakTotalPages, setStreakTotalPages] = useState(1);
  const [streakTotal, setStreakTotal] = useState(0);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingStreak, setLoadingStreak] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingHoliday, setSavingHoliday] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showHolidaySheet, setShowHolidaySheet] = useState(false);
  const [holidayError, setHolidayError] = useState("");
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipAutoSaveRef = useRef(true);

  const selectedClassName = classes.find((item) => item.id === selectedClass)?.name;

  useEffect(() => {
    setLoadingClasses(true);
    api
      .get(API_URLS.CLASSES.LIST)
      .then((response) => {
        const data = response.data as ClassOption[];
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass((current) => current ?? data[0].id);
        }
      })
      .catch(() => setClasses([]))
      .finally(() => setLoadingClasses(false));
  }, []);

  const loadAttendance = useCallback(async () => {
    if (!selectedClass) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    setLoadingAttendance(true);
    skipAutoSaveRef.current = true;
    try {
      const data = await attendanceService.getClassAttendance(selectedClass, selectedDate);
      setAttendance(data);
      setStudents(data.students);
      setDirty(false);
    } catch (error) {
      setAttendance(null);
      setStudents([]);
      showToast(getErrorMessage(error, "Failed to load attendance"), "error");
    } finally {
      setLoadingAttendance(false);
      skipAutoSaveRef.current = false;
    }
  }, [selectedClass, selectedDate, showToast]);

  const loadAbsentStreak = useCallback(async () => {
    setLoadingStreak(true);
    try {
      const data = await attendanceService.getAbsentStreak(
        streakDays,
        selectedClass ?? undefined,
        streakPage,
        DEFAULT_PAGE_SIZE,
      );
      setStreakStudents(data.items);
      setStreakTotalPages(data.total_pages);
      setStreakTotal(data.total);
    } catch (error) {
      setStreakStudents([]);
      showToast(getErrorMessage(error, "Failed to load absent streak alerts"), "error");
    } finally {
      setLoadingStreak(false);
    }
  }, [streakDays, selectedClass, streakPage, showToast]);

  useEffect(() => {
    if (activeView === "mark") {
      loadAttendance();
    }
  }, [activeView, loadAttendance]);

  useEffect(() => {
    setStreakPage(1);
  }, [streakDays, selectedClass]);

  useEffect(() => {
    if (activeView === "alerts") {
      loadAbsentStreak();
    }
  }, [activeView, loadAbsentStreak]);

  const filteredStreak = streakStudents;

  const summary = useMemo(() => {
    const present = students.filter((item) => item.status === "present").length;
    const absent = students.filter((item) => item.status === "absent").length;
    return { total: students.length, present, absent };
  }, [students]);

  const toggleStudent = (studentId: number) => {
    if (attendance?.is_holiday) return;

    setStudents((current) =>
      current.map((item) =>
        item.student_id === studentId
          ? { ...item, status: item.status === "present" ? "absent" : "present" }
          : item
      )
    );
    setDirty(true);
  };

  const markAllPresent = () => {
    if (attendance?.is_holiday) return;
    setStudents((current) => current.map((item) => ({ ...item, status: "present" })));
    setDirty(true);
  };

  const isHoliday = attendance?.is_holiday ?? false;

  const persistAttendance = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!selectedClass || students.length === 0 || attendance?.is_holiday) return false;

      setSaving(true);
      try {
        const absentIds = students
          .filter((item) => item.status === "absent")
          .map((item) => item.student_id);
        const result = await attendanceService.markAttendance(selectedClass, selectedDate, absentIds);

        setAttendance((current) =>
          current
            ? {
                ...current,
                is_submitted: true,
                submitted_at: result.submitted_at,
                summary: {
                  total: students.length,
                  present: result.present,
                  absent: result.absent,
                },
              }
            : current
        );
        setDirty(false);

        if (!options?.silent) {
          showToast(`Saved · ${result.present} present, ${result.absent} absent`, "success");
        }
        return true;
      } catch (error) {
        showToast(getErrorMessage(error, "Failed to save attendance"), "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [attendance?.is_holiday, selectedClass, selectedDate, showToast, students]
  );

  useEffect(() => {
    if (
      skipAutoSaveRef.current ||
      !dirty ||
      loadingAttendance ||
      saving ||
      isHoliday ||
      !selectedClass ||
      students.length === 0
    ) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      void persistAttendance({ silent: true });
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [
    dirty,
    students,
    selectedClass,
    selectedDate,
    loadingAttendance,
    saving,
    isHoliday,
    persistAttendance,
  ]);

  const saveAttendance = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    void persistAttendance({ silent: false });
  };

  const submitHoliday = async (reason: string) => {
    if (!reason) {
      setHolidayError("Reason is required");
      return;
    }

    setSavingHoliday(true);
    setHolidayError("");
    try {
      await attendanceService.createHoliday(selectedDate, reason);
      showToast("Holiday marked successfully", "success");
      setShowHolidaySheet(false);
      await loadAttendance();
    } catch (error) {
      setHolidayError(getErrorMessage(error, "Failed to mark holiday"));
    } finally {
      setSavingHoliday(false);
    }
  };

  const canSave = dirty && !isHoliday && students.length > 0 && !saving;

  return (
    <>
      <TopBar title="Attendance" />

      <PageContent>
      {loadingClasses ? (
        <ListSkeleton count={4} />
      ) : classes.length === 0 ? (
        <EmptyClassesState />
      ) : (
        <>
          <ClassFilterTabs
            classes={classes}
            selectedClass={selectedClass}
            onSelect={setSelectedClass}
          />

          <ViewToggle view={activeView} onChange={setActiveView} />

          {activeView === "mark" ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                <div
                  className="vt-attendance-toolbar"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 10,
                    alignItems: "end",
                  }}
                >
                  <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink-500)" }}>
                      Date
                    </span>
                    <DateInput
                      value={selectedDate}
                      max={todayIso()}
                      onChange={setSelectedDate}
                    />
                  </label>

                  <button
                    type="button"
                    disabled={isHoliday}
                    onClick={() => setShowHolidaySheet(true)}
                    style={{
                      minHeight: 48,
                      minWidth: 48,
                      padding: "0 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1.5px solid",
                      borderColor: isHoliday ? "var(--ink-200)" : "#fed7aa",
                      background: isHoliday ? "var(--ink-50)" : "#fff7ed",
                      color: isHoliday ? "var(--ink-400)" : "#c2410c",
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily: "var(--font-body)",
                      cursor: isHoliday ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.75" />
                      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                    {isHoliday ? "Holiday" : "Mark holiday"}
                  </button>
                </div>

                <p style={{ fontSize: "12px", color: "var(--ink-400)", marginTop: -4 }}>
                  {formatDisplayDate(selectedDate)}
                  {selectedClassName ? ` · ${selectedClassName}` : ""}
                </p>

                {!loadingAttendance && students.length > 0 && (
                  <AttendanceStatusBanner
                    isHoliday={isHoliday}
                    isSubmitted={attendance?.is_submitted ?? false}
                    submittedAt={attendance?.submitted_at}
                    absentCount={summary.absent}
                    dirty={dirty}
                    saving={saving}
                  />
                )}

                {isHoliday && (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "var(--radius-md)",
                      background: "#fff7ed",
                      border: "1px solid #fed7aa",
                      fontSize: "13px",
                      color: "#c2410c",
                      lineHeight: 1.5,
                    }}
                  >
                    This date is a holiday
                    {attendance?.holiday_reason ? `: ${attendance.holiday_reason}` : ""}. Attendance cannot be submitted.
                  </div>
                )}

                {!loadingAttendance && students.length > 0 && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <SummaryPill label="Total" value={summary.total} tone="neutral" />
                    <SummaryPill label="Present" value={summary.present} tone="success" />
                    <SummaryPill label="Absent" value={summary.absent} tone="error" />
                  </div>
                )}

                {!isHoliday && students.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllPresent}
                    style={{
                      alignSelf: "flex-start",
                      minHeight: 44,
                      padding: "8px 14px",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid var(--ink-200)",
                      background: "var(--surface-0)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--ink-700)",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Mark all present
                  </button>
                )}
              </div>

              {loadingAttendance ? (
                <ListSkeleton count={4} />
              ) : students.length === 0 ? (
                <div
                  style={{
                    padding: "48px 20px",
                    textAlign: "center",
                    color: "var(--ink-500)",
                    fontSize: "14px",
                  }}
                >
                  No active students in this class.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 96 }}>
                  {students.map((student) => (
                    <AttendanceRow
                      key={student.student_id}
                      student={student}
                      disabled={isHoliday}
                      onToggle={toggleStudent}
                    />
                  ))}
                </div>
              )}

              {students.length > 0 && (
                <div className="vt-attendance-save">
                  <div style={{ maxWidth: 560, margin: "0 auto" }}>
                    <Button
                      variant="primary"
                      onClick={saveAttendance}
                      loading={saving}
                      disabled={!canSave}
                      fullWidth
                    >
                      {saving ? "Saving…" : dirty ? "Save now" : "Saved"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ paddingBottom: 24 }}>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--brand-accent)",
                  border: "1px solid var(--brand-200)",
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "15px",
                    color: "var(--ink-900)",
                    marginBottom: 4,
                  }}
                >
                  Absent alerts
                </p>
                <p style={{ fontSize: "13px", color: "var(--ink-500)", lineHeight: 1.5 }}>
                  Students absent for consecutive school days. Holidays are excluded automatically.
                  {selectedClassName ? ` Showing ${selectedClassName} only.` : ""}
                </p>
              </div>

              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--ink-500)",
                  marginBottom: 8,
                }}
              >
                Minimum absent days
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  paddingBottom: 4,
                  marginBottom: 16,
                  scrollbarWidth: "none",
                }}
              >
                {STREAK_OPTIONS.map((days) => {
                  const active = streakDays === days;
                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setStreakDays(days)}
                      style={{
                        flexShrink: 0,
                        minWidth: 44,
                        minHeight: 44,
                        padding: "0 16px",
                        borderRadius: "var(--radius-full)",
                        border: "1.5px solid",
                        borderColor: active ? "var(--brand-primary)" : "var(--ink-200)",
                        background: active ? "var(--brand-accent)" : "var(--surface-0)",
                        fontSize: "13px",
                        fontWeight: active ? 700 : 500,
                        color: active ? "var(--brand-primary)" : "var(--ink-500)",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {days}+ days
                    </button>
                  );
                })}
              </div>

              {loadingStreak ? (
                <ListSkeleton count={3} />
              ) : filteredStreak.length === 0 ? (
                <div
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    background: "var(--surface-0)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "#ecfdf5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6 9 17l-5-5" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "15px", color: "var(--ink-900)", marginBottom: 6 }}>
                    All clear
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--ink-500)", lineHeight: 1.5 }}>
                    No students absent {streakDays}+ consecutive days
                    {selectedClassName ? ` in ${selectedClassName}` : ""}.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ fontSize: "12px", color: "var(--ink-400)", marginBottom: 2 }}>
                      {streakTotal} student{streakTotal !== 1 ? "s" : ""} need follow-up
                    </p>
                    {filteredStreak.map((student) => (
                      <AbsentStreakRow key={student.student_id} student={student} />
                    ))}
                  </div>
                  <Pagination
                    page={streakPage}
                    totalPages={streakTotalPages}
                    total={streakTotal}
                    onPageChange={setStreakPage}
                    loading={loadingStreak}
                  />
                </>
              )}
            </div>
          )}
        </>
      )}
      </PageContent>

      <HolidaySheet
        open={showHolidaySheet}
        onClose={() => {
          setShowHolidaySheet(false);
          setHolidayError("");
        }}
        date={selectedDate}
        onSubmit={submitHoliday}
        loading={savingHoliday}
        error={holidayError}
      />

      <style>{`
        @media (max-width: 380px) {
          .vt-wa-label {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
