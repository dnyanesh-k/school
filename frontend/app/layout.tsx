import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/hooks/useToast";
import { ToastClient } from "@/components/common/ToastClient";

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
  description: "Institute management made simple",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`}>
      <body>
        <ToastProvider>
          <ToastClient />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
