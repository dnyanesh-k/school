import type { Metadata, Viewport } from "next";
import { DM_Sans, Sora } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/hooks/useToast";
import { ToastClient } from "@/components/common/ToastClient";
import { ServiceWorkerRegistrar } from "@/components/common/ServiceWorkerRegistrar";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "VidyaTrack",
  description: "School management with AI — attendance, fees, WhatsApp & voice follow-ups",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VidyaTrack",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <ToastProvider>
          <ToastClient />
          <ServiceWorkerRegistrar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
