"use client";

import { createContext, useContext, useState, useCallback, ReactNode, ReactElement } from "react";
import { ToastMessage, ToastType } from "@/components/ui/Toast";

interface ToastContextType {
    toast: ToastMessage | null;
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    closeToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }): ReactElement {
    const [toast, setToast] = useState<ToastMessage | null>(null);

    const showToast = useCallback(
        (message: string, type: ToastType = "success", duration?: number) => {
            const id = Date.now().toString();
            setToast({ id, message, type, duration });
        },
        []
    );

    const closeToast = useCallback(() => {
        setToast(null);
    }, []);

    return (
        <ToastContext.Provider value={{ toast, showToast, closeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextType {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}
