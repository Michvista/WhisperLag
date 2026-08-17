import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { BRAND } from "@whisperlag/shared";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: `${BRAND.name} — Quality Assurance System`,
  description: BRAND.tagline,
};

/**
 * Root layout: fonts loaded once and exposed as CSS variables; Material
 * Symbols loaded for the iconography used across the Stitch design.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-screen font-body antialiased">{children}</body>
    </html>
  );
}