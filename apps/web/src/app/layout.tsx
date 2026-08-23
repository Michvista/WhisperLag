import type { Metadata } from "next";
import { BRAND } from "@whisperlag/shared";
import { PwaRegister } from "@/components/PwaRegister";
import { PwaControls } from "@/components/PwaControls";
import "./globals.css";

export const metadata: Metadata = {
  title: `${BRAND.name} — Quality Assurance System`,
  description: BRAND.tagline,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "WhisperLag" },
};

/**
 * Root layout. Fonts (Montserrat + Inter) and Material Symbols are loaded via
 * runtime <link> tags rather than next/font, so builds don't depend on the
 * network at compile time. PWA manifest + theme color make the app installable.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="theme-color" content="#4B8D6D" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen font-body antialiased">
        {children}
        <PwaRegister />
        <PwaControls />
      </body>
    </html>
  );
}