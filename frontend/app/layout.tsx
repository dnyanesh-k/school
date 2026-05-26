import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VidyaTrack",
  description: "Institute management made simple",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}