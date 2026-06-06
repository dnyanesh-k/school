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
  title: {
    default: "VidyaTrack — School Management App with AI",
    template: "%s | VidyaTrack",
  },
  description: "Mobile-first school and coaching management app for India. Attendance, fees, WhatsApp reminders and AI voice follow-ups. Starts at ₹499/month.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VidyaTrack",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://vidyatrackai.com/#org",
      name: "VidyaTrack",
      url: "https://vidyatrackai.com",
      logo: "https://vidyatrackai.com/icons/icon-512.png",
      contactPoint: {
        "@type": "ContactPoint",
        email: "vidyatrackai@gmail.com",
        contactType: "customer support",
        areaServed: "IN",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "VidyaTrack",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, Android, iOS",
      offers: {
        "@type": "Offer",
        price: "499",
        priceCurrency: "INR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "499",
          priceCurrency: "INR",
          unitText: "MONTH",
        },
      },
      description:
        "Mobile-first school management app for Indian schools and coaching institutes. Attendance, fee collection, WhatsApp reminders and AI voice follow-ups.",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
