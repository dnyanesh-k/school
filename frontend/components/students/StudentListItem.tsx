"use client";

import { useState } from "react";
import type { Student } from "@/services/studentService";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function StudentListItem({
  student,
  onEdit,
  onDelete,
  onViewFees,
}: {
  student: Student;
  onEdit: () => void;
  onDelete: (onSuccess: () => void) => Promise<void>;
  onViewFees?: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(() => setShowMenu(false));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="vt-card vt-item-card">
      <button
        type="button"
        className="vt-student-card-main"
        onClick={onEdit}
        aria-label={`Edit ${student.full_name}`}
      >
        <div className="vt-student-avatar">{getInitials(student.full_name)}</div>
        <div className="vt-student-info">
          <p className="vt-student-name">{student.full_name}</p>
          <p className="vt-student-meta">
            {student.class_name ?? "Class"} · Admitted {formatDate(student.admission_date)}
          </p>
          <p className="vt-student-meta">Parent: {student.parent_phone}</p>
        </div>
      </button>

      <div className="vt-student-card-actions">
        {onViewFees && (
          <button type="button" className="vt-student-fees-btn" onClick={onViewFees}>
            Fees
          </button>
        )}

        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="More actions"
            className="vt-student-menu-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="5" r="2" fill="currentColor" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <circle cx="12" cy="19" r="2" fill="currentColor" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div
                onClick={() => setShowMenu(false)}
                style={{ position: "fixed", inset: 0, zIndex: 100 }}
                aria-hidden="true"
              />
              <div className="vt-card vt-student-menu">
                <button
                  type="button"
                  onClick={() => {
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="vt-student-menu-item"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="vt-student-menu-item is-danger"
                >
                  {deleting ? "Removing..." : "Remove student"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
