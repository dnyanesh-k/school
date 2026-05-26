"use client";

import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

export function ToastClient() {
    const { toast, closeToast } = useToast();

    return <Toast toast={toast} onClose={closeToast} />;
}
