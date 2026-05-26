"use client";

import { ReactNode, useState } from "react";

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
        } catch (error) {
            console.error("Failed to delete item");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "100%",
                background: "var(--surface-0)",
                borderRadius: "var(--radius-lg)",
                padding: "18px 16px",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid rgba(0,0,0,0.04)",
            }}
        >
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: "var(--radius-md)",
                            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(249, 115, 22, 0.1))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(0,0,0,0.05)",
                            flexShrink: 0,
                            fontSize: "20px",
                        }}
                    >
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
                            <p style={{ fontSize: "12px", color: "var(--ink-500)", marginBottom: 2 }}>
                                {subtitle}
                            </p>
                        )}
                        {description && (
                            <p style={{ fontSize: "12px", color: "var(--ink-500)" }}>
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Menu */}
            {(onEdit || onDelete) && (
                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 8,
                            color: "var(--ink-400)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
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
                                style={{
                                    position: "fixed",
                                    inset: 0,
                                    zIndex: 100,
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    top: "100%",
                                    right: 0,
                                    marginTop: 4,
                                    background: "var(--surface-0)",
                                    border: "1px solid rgba(0,0,0,0.08)",
                                    borderRadius: "var(--radius-md)",
                                    overflow: "hidden",
                                    zIndex: 101,
                                    minWidth: 140,
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                }}
                            >
                                {onEdit && (
                                    <button
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
                                            borderBottom: onDelete ? "1px solid rgba(0,0,0,0.04)" : "none",
                                            fontFamily: "var(--font-body)",
                                            transition: "background 0.2s",
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.background = "var(--ink-50)")
                                        }
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                                    >
                                        ✏️ Edit
                                    </button>
                                )}
                                {onDelete && (
                                    <button
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
                                        🗑️ {deleting ? "Deleting..." : "Delete"}
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
