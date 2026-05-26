"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastProps {
    toast: ToastMessage | null;
    onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (toast) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Allow fade-out animation
            }, toast.duration || 3000);

            return () => clearTimeout(timer);
        }
    }, [toast, onClose]);

    if (!toast) return null;

    const bgColor =
        toast.type === "success"
            ? "var(--success)"
            : toast.type === "error"
                ? "var(--error)"
                : "var(--brand-primary)";

    const icon =
        toast.type === "success"
            ? "✓"
            : toast.type === "error"
                ? "⚠"
                : "ℹ";

    return (
        <div
            style={{
                position: "fixed",
                bottom: isVisible ? "20px" : "-100px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 9999,
                opacity: isVisible ? 1 : 0,
                transition: "all 0.3s ease-in-out",
                maxWidth: "calc(100% - 32px)",
                width: "100%",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: bgColor,
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 500,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    wordBreak: "break-word",
                }}
            >
                <span style={{ fontSize: "18px", flexShrink: 0 }}>{icon}</span>
                <span>{toast.message}</span>
            </div>
        </div>
    );
}
