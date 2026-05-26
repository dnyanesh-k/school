"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./DateInput.module.css";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  error?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
}

interface CalendarDay {
  iso: string;
  label: number;
  inMonth: boolean;
  disabled: boolean;
  isSelected: boolean;
  isToday: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toIso(year: number, month: number, day: number) {
  const monthText = String(month + 1).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  return `${year}-${monthText}-${dayText}`;
}

function todayIso() {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatDisplayDate(iso: string) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOutOfRange(iso: string, min?: string, max?: string) {
  if (min && iso < min) return true;
  if (max && iso > max) return true;
  return false;
}

function buildMonthGrid(
  viewYear: number,
  viewMonth: number,
  selected: string,
  min?: string,
  max?: string
): CalendarDay[] {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const leadingDays = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
  const today = todayIso();
  const days: CalendarDay[] = [];

  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - leadingDays + 1;
    let year = viewYear;
    let month = viewMonth;
    let inMonth = true;

    if (dayNumber < 1) {
      inMonth = false;
      month -= 1;
      if (month < 0) {
        month = 11;
        year -= 1;
      }
      const prevMonthDays = new Date(year, month + 1, 0).getDate();
      const iso = toIso(year, month, prevMonthDays + dayNumber);
      days.push({
        iso,
        label: prevMonthDays + dayNumber,
        inMonth,
        disabled: isOutOfRange(iso, min, max),
        isSelected: iso === selected,
        isToday: iso === today,
      });
      continue;
    }

    if (dayNumber > daysInMonth) {
      inMonth = false;
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
      const iso = toIso(year, month, dayNumber - daysInMonth);
      days.push({
        iso,
        label: dayNumber - daysInMonth,
        inMonth,
        disabled: isOutOfRange(iso, min, max),
        isSelected: iso === selected,
        isToday: iso === today,
      });
      continue;
    }

    const iso = toIso(viewYear, viewMonth, dayNumber);
    days.push({
      iso,
      label: dayNumber,
      inMonth,
      disabled: isOutOfRange(iso, min, max),
      isSelected: iso === selected,
      isToday: iso === today,
    });
  }

  return days;
}

function monthStartIso(year: number, month: number) {
  return toIso(year, month, 1);
}

function monthEndIso(year: number, month: number) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return toIso(year, month, lastDay);
}

function dayClassName(day: CalendarDay) {
  return [
    styles.day,
    !day.inMonth ? styles.dayOutside : "",
    day.isToday ? styles.dayToday : "",
    day.isSelected ? styles.daySelected : "",
    day.disabled ? styles.dayDisabled : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function DateInput({
  value,
  onChange,
  placeholder = "Select date",
  title,
  error,
  min,
  max,
  disabled = false,
}: DateInputProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const pickerId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    if (value) {
      const [year, month] = value.split("-").map(Number);
      if (year && month) {
        setViewYear(year);
        setViewMonth(month - 1);
      }
    } else {
      const now = new Date();
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const pickerTitle = title ?? placeholder;
  const displayValue = formatDisplayDate(value);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const days = useMemo(
    () => buildMonthGrid(viewYear, viewMonth, value, min, max),
    [viewYear, viewMonth, value, min, max]
  );

  const weeks = useMemo(() => {
    const rows: CalendarDay[][] = [];
    for (let index = 0; index < days.length; index += 7) {
      rows.push(days.slice(index, index + 7));
    }
    return rows;
  }, [days]);

  const canGoPrev = !min || monthEndIso(viewYear, viewMonth - 1) >= min;
  const canGoNext = !max || monthStartIso(viewYear, viewMonth + 1) <= max;

  const triggerClassName = [
    styles.trigger,
    error ? styles.triggerError : "",
    disabled ? styles.triggerDisabled : "",
    open ? styles.triggerOpen : "",
  ]
    .filter(Boolean)
    .join(" ");

  const picker =
    open && mounted
      ? createPortal(
          <>
            <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />
            <div className={styles.picker} role="dialog" aria-label={pickerTitle} id={pickerId}>
              <div className={styles.handle} aria-hidden="true" />
              <div className={styles.header}>
                <p className={styles.headerTitle}>{pickerTitle}</p>
                <button type="button" className={styles.headerDone} onClick={() => setOpen(false)}>
                  Done
                </button>
              </div>

              <div className={styles.calendar}>
                <div className={styles.nav}>
                  <button
                    type="button"
                    className={styles.navBtn}
                    onClick={() => {
                      if (!canGoPrev) return;
                      if (viewMonth === 0) {
                        setViewYear((year) => year - 1);
                        setViewMonth(11);
                      } else {
                        setViewMonth((month) => month - 1);
                      }
                    }}
                    disabled={!canGoPrev}
                    aria-label="Previous month"
                  >
                    ‹
                  </button>
                  <p className={styles.monthLabel}>{monthLabel}</p>
                  <button
                    type="button"
                    className={styles.navBtn}
                    onClick={() => {
                      if (!canGoNext) return;
                      if (viewMonth === 11) {
                        setViewYear((year) => year + 1);
                        setViewMonth(0);
                      } else {
                        setViewMonth((month) => month + 1);
                      }
                    }}
                    disabled={!canGoNext}
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>

                <div className={styles.weekdays} aria-hidden="true">
                  {WEEKDAYS.map((weekday) => (
                    <span key={weekday} className={styles.weekday}>
                      {weekday}
                    </span>
                  ))}
                </div>

                <div className={styles.weeks}>
                  {weeks.map((week, weekIndex) => (
                    <div key={`week-${weekIndex}`} className={styles.week}>
                      {week.map((day, dayIndex) => (
                        <button
                          key={`${weekIndex}-${dayIndex}-${day.iso}`}
                          type="button"
                          aria-label={day.iso}
                          aria-pressed={day.isSelected}
                          disabled={day.disabled}
                          className={dayClassName(day)}
                          onClick={() => {
                            if (day.disabled) return;
                            onChange(day.iso);
                            setOpen(false);
                          }}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <div className={styles.wrap}>
        <button
          type="button"
          className={triggerClassName}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? pickerId : undefined}
          onClick={() => {
            if (!disabled) setOpen(true);
          }}
        >
          <span className={displayValue ? styles.value : styles.placeholder}>
            {displayValue || placeholder}
          </span>
          <span className={styles.triggerIcon} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.75" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </div>
      {picker}
    </>
  );
}
