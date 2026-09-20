import type { Config } from "tailwindcss";

/**
 * WhisperLag Design System — Prestigious Academic & Editorial Style
 * Deep UNILAG Forest Green #166534 · Refined Sapphire/Navy #0F2942 · Slate #475569
 * Surface #FFFFFF · Background #F8FAFC / #F1F5F9 · Border #E2E8F0
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Surfaces & Backgrounds
        background: "#F8FAFC",
        onBackground: "#0F172A",
        surface: "#FFFFFF",
        "surface-bright": "#FFFFFF",
        "surface-dim": "#F1F5F9",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F8FAFC",
        "surface-container": "#F1F5F9",
        "surface-container-high": "#E2E8F0",
        "surface-container-highest": "#CBD5E1",
        onSurface: "#0F172A",
        onSurfaceVariant: "#475569",
        "surface-variant": "#EDF7F1",
        outline: "#E2E8F0",
        outlineVariant: "#CBD5E1",

        // Primary Brand (Refined Deep UNILAG Forest Green)
        primary: "#166534",
        onPrimary: "#FFFFFF",
        "primary-container": "#EDF7F1",
        "primary-dark": "#14532D",
        "primary-light": "#22C55E",
        "primary-tint": "#DCFCE7",
        "unilag-green": "#166534",
        "green-tint": "#EDF7F1",
        "green-light": "#DCFCE7",
        "green-dark": "#14532D",

        // Secondary Brand (Refined Deep Academic Navy / Blue)
        secondary: "#1E3A5F",
        onSecondary: "#FFFFFF",
        "secondary-container": "#EBF2F7",
        "secondary-dark": "#0F2942",
        "secondary-light": "#2563EB",
        "unilag-blue": "#1E3A5F",
        "blue-tint": "#EBF2F7",
        "blue-light": "#DBEAFE",

        // Accent Colors
        tertiary: "#5B21B6",
        onTertiary: "#FFFFFF",
        "tertiary-container": "#F3E8FF",
        "unilag-purple": "#5B21B6",
        "purple-tint": "#F3E8FF",

        // Amber / Gold
        "unilag-gold": "#B45309",
        "sun-gold": "#D97706",
        "gold-accent": "#D97706",
        "gold-light": "#FEF3C7",
        "amber-tint": "#FEF3C7",
        "unilag-amber": "#B45309",

        // Text & Ink
        ink: "#0F172A",
        navy: "#0F172A",
        "text-primary": "#0F172A",
        "text-navy": "#0F172A",
        "text-dark": "#0F172A",
        "text-secondary": "#475569",
        "text-soft": "#64748B",
        "border-subtle": "#E2E8F0",
        "border-cream": "#E2E8F0",
        "cream-bg": "#F8FAFC",
        "phone-bg": "#F1F5F9",

        // Semantic
        error: "#DC2626",
        onError: "#FFFFFF",
        "error-container": "#FEE2E2",
        onErrorContainer: "#991B1B",
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        full: "9999px",
      },
      spacing: {
        unit: "4px",
        gutter: "24px",
        "margin-mobile": "16px",
        "margin-desktop": "48px",
        "section-gap": "80px",
      },
      maxWidth: {
        container: "1200px",
        wide: "1400px",
      },
      fontFamily: {
        display: ["Montserrat", "Manrope", "Inter", "sans-serif"],
        body: ["Inter", "Manrope", "sans-serif"],
        manrope: ["Manrope", "Inter", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        "display-xl": ["Montserrat", "sans-serif"],
        "headline-lg": ["Montserrat", "sans-serif"],
        "headline-md": ["Montserrat", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
        "mono-label": ["Inter", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["48px", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-lg": ["28px", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-lg-mobile": ["22px", { lineHeight: "1.25", fontWeight: "700" }],
        "headline-md": ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-caps": ["11px", { lineHeight: "1", letterSpacing: "0.06em", fontWeight: "700" }],
        "mono-label": ["12px", { lineHeight: "1", letterSpacing: "0.02em", fontWeight: "600" }],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)",
        "card-hover": "0 4px 12px rgba(15, 23, 42, 0.08)",
        "button-green": "0 2px 6px rgba(22, 101, 52, 0.2)",
        "button-blue": "0 2px 6px rgba(30, 58, 95, 0.2)",
        phone: "0 12px 36px rgba(15, 23, 42, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;