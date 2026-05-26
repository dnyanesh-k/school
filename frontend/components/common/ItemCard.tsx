"use client";

import { useState } from "react";

interface ItemCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  description?: string;
  onEdit?: () => void;
  onDelete?: (onSuccess: () => void) => Promise<void>;
}

export function ItemCard({
  icon,
  title,
  subtitle,
  description,
  onEdit,
  onDelete,
}: ItemCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(() => {
        setShowMenu(false);
      });
    } catch {
      console.error("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="vt-card vt-item-card">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="vt-item-icon" style={{ fontSize: "20px" }}>
            {icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "15px",
                color: "var(--ink-900)",
                marginBottom: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </p>
            {subtitle && (
              <p style={{ fontSize: "12px", color: "var(--ink-500)", marginBottom: 2 }}>{subtitle}</p>
            )}
            {description && <p style={{ fontSize: "12px", color: "var(--ink-500)" }}>{description}</p>}
          </div>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="More actions"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              color: "var(--ink-400)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
              <div
                className="vt-card"
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 4,
                  overflow: "hidden",
                  zIndex: 101,
                  minWidth: 140,
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "13px",
                      color: "var(--ink-700)",
                      borderBottom: onDelete ? "1px solid var(--ink-100)" : "none",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "none",
                      background: "none",
                      cursor: deleting ? "not-allowed" : "pointer",
                      textAlign: "left",
                      fontSize: "13px",
                      color: "var(--error)",
                      fontFamily: "var(--font-body)",
                      opacity: deleting ? 0.5 : 1,
                    }}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
