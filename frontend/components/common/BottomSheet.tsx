"use client";

import { ReactNode, useEffect } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function BottomSheet({ open, onClose, title, children, footer }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="vt-bottom-sheet-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="vt-bottom-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="vt-bottom-sheet-handle" aria-hidden="true" />

        <div className="vt-bottom-sheet-header">
          <h2 className="vt-bottom-sheet-title">{title}</h2>
          <button type="button" className="vt-bottom-sheet-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="vt-bottom-sheet-body">{children}</div>

        {footer ? <div className="vt-bottom-sheet-footer">{footer}</div> : null}
      </div>
    </>
  );
}
