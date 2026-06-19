"use client";

import { useState } from "react";

interface ItemCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  description?: string;
  driveHref?: string;
  onEdit?: () => void;
  onDelete?: (onSuccess: () => void) => Promise<void>;
}

export function ItemCard({
  icon,
  title,
  subtitle,
  description,
  driveHref,
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

      {driveHref && (
        <a
          href={driveHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Open class notes in Google Drive"
          title="Open notes folder"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "var(--radius-sm)",
            color: "#1a73e8",
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          {/* Google Drive icon */}
          <svg width="20" height="20" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
            <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.5A9.06 9.06 0 000 53h27.5z" fill="#00ac47"/>
            <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.25z" fill="#ea4335"/>
            <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
            <path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
            <path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
          </svg>
        </a>
      )}

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
