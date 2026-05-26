"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  title?: string;
  error?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  title,
  error,
  disabled = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const listboxId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const selectedLabel = options.find((option) => option.value === value)?.label;
  const pickerTitle = title ?? placeholder;

  const triggerClassName = [
    "vt-select-trigger",
    error ? "is-error" : "",
    disabled ? "is-disabled" : "",
    open ? "is-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const picker =
    open && mounted
      ? createPortal(
          <>
            <div
              className="vt-select-backdrop"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="vt-select-picker" role="dialog" aria-label={pickerTitle}>
              <div className="vt-select-picker-handle" aria-hidden="true" />
              <div className="vt-select-picker-header">
                <p className="vt-select-picker-title">{pickerTitle}</p>
                <button
                  type="button"
                  className="vt-select-picker-done"
                  onClick={() => setOpen(false)}
                >
                  Done
                </button>
              </div>
              <ul className="vt-select-picker-list" role="listbox" id={listboxId}>
                {options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <li key={option.value} role="none">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`vt-select-option${isSelected ? " is-selected" : ""}`}
                        onClick={() => {
                          onChange(option.value);
                          setOpen(false);
                        }}
                      >
                        <span className="vt-select-option-label">{option.label}</span>
                        <span className="vt-select-option-check" aria-hidden="true">
                          {isSelected ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M5 12l5 5L20 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <div className="vt-select-wrap">
        <button
          type="button"
          className={triggerClassName}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          onClick={() => {
            if (!disabled) setOpen(true);
          }}
        >
          <span className={selectedLabel ? "vt-select-value" : "vt-select-placeholder"}>
            {selectedLabel ?? placeholder}
          </span>
          <span className="vt-select-trigger-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>
      {picker}
    </>
  );
}
