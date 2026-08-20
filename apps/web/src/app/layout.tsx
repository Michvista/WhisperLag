import type { Metadata } from "next";
import { BRAND } from "@whisperlag/shared";
import "./globals.css";

export const metadata: Metadata = {
  title: `${BRAND.name} — Quality Assurance System`,
  description: BRAND.tagline,
};

/**
 * Root layout. Fonts (Montserrat + Inter) and Material Symbols are loaded via
 * runtime <link> tags rather than next/font, so builds don't depend on the
 * network at compile time.
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
      </head>
      <body className="min-h-screen font-body antialiased">{children}</body>
    </html>
  );
}