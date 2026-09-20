import type { Metadata } from "next";
import { BRAND } from "@whisperlag/shared";
import { PwaRegister } from "@/components/PwaRegister";
import { PwaControls } from "@/components/PwaControls";
import { Toaster } from "@/components/Toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: `${BRAND.name} — Student Feedback & Quality Assurance`,
  description: BRAND.tagline,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "WhisperLag" },
};

/**
 * Root layout with Montserrat, Inter, and Manrope fonts.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&family=Montserrat:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="theme-color" content="#009A44" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen bg-[#F5F5F5] font-body text-navy antialiased selection:bg-green-tint selection:text-unilag-green">
        {children}
        <PwaRegister />
        <PwaControls />
        <Toaster />
      </body>
    </html>
  );
}