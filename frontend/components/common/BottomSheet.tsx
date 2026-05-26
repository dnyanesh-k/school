"use client";

import { ReactNode } from "react";

interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function BottomSheet({ open, onClose, title, children, footer }: BottomSheetProps) {
    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.4)",
                    zIndex: 200,
                }}
            />

            {/* Sheet */}
            <div
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    width: "100%",
                    background: "var(--surface-0)",
                    borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
                    zIndex: 201,
                    maxHeight: "90dvh",
                    overflowY: "auto",
                    padding: "0 20px 40px",
                    maxWidth: "560px",
                    margin: "0 auto",
                }}
            >
                {/* Handle */}
                <div
                    style={{
                        width: 36,
                        height: 4,
                        background: "var(--ink-200)",
                        borderRadius: 2,
                        margin: "12px auto 20px",
                    }}
                />

                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                    }}
                >
                    <h2
                        style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: "18px",
                            color: "var(--ink-900)",
                        }}
                    >
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 4,
                            color: "var(--ink-400)",
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6 6 18M6 6l12 12"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div style={{ marginBottom: "20px" }}>
                    {children}
                </div>

                {/* Footer */}
                {footer}
            </div>
        </>
    );
}
