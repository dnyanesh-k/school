import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { ToastClient } from "@/components/common/ToastClient";

export const metadata: Metadata = {
  title: "VidyaTrack",
  description: "Institute management made simple",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <ToastClient />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}