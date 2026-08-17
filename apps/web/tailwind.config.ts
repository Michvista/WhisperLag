import type { Config } from "tailwindcss";

/**
 * WhisperLag design tokens — "Institutional Guardian" system generated in
 * Stitch AI. The Material-3 style surface palette gives the platform a calm,
 * trustworthy, university-grade feel while UNILAG Green anchors the brand.
 *
 * Mirroring these hex values here keeps the UI consistent with the shared
 * BRAND constants in @whisperlag/shared (single source of truth).
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#f9f9ff",
        onBackground: "#141b2b",
        surface: "#f9f9ff",
        "surface-bright": "#f9f9ff",
        "surface-dim": "#d3daef",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1f3ff",
        "surface-container": "#e9edff",
        "surface-container-high": "#e1e8fd",
        "surface-container-highest": "#dce2f7",
        onSurface: "#141b2b",
        onSurfaceVariant: "#3e4a3e",
        "surface-variant": "#dce2f7",
        outline: "#6e7a6c",
        outlineVariant: "#bdcaba",
        primary: "#006b2d",
        onPrimary: "#ffffff",
        "primary-container": "#00873b",
        onPrimaryContainer: "#f7fff3",
        inversePrimary: "#63df7f",
        "surface-tint": "#006e2e",
        secondary: "#00668a",
        onSecondary: "#ffffff",
        "secondary-container": "#87d2fd",
        onSecondaryContainer: "#005b7c",
        "secondary-fixed-dim": "#84d0fa",
        tertiary: "#795600",
        onTertiary: "#ffffff",
        "tertiary-container": "#996d00",
        onTertiaryContainer: "#fffbff",
        "tertiary-fixed-dim": "#fbbc38",
        error: "#ba1a1a",
        onError: "#ffffff",
        "error-container": "#ffdad6",
        onErrorContainer: "#93000a",
        // Brand anchors (UNILAG identity)
        brand: {
          green: "#009A44",
          lagoon: "#78C4EE",
          gold: "#E5A823",
          ink: "#111827",
          gray: "#F5F5F5",
        },
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      spacing: {
        "margin-desktop": "64px",
        unit: "8px",
        "container-max": "1200px",
        "margin-mobile": "20px",
        gutter: "24px",
      },
      maxWidth: {
        container: "1200px",
      },
      fontFamily: {
        display: ["Montserrat", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"],
        // Design-system roles (font-{role} utilities, per Stitch tokens)
        "headline-xl": ["Montserrat", "ui-sans-serif", "system-ui"],
        "headline-lg": ["Montserrat", "ui-sans-serif", "system-ui"],
        "headline-md": ["Montserrat", "ui-sans-serif", "system-ui"],
        "headline-sm": ["Montserrat", "ui-sans-serif", "system-ui"],
        "headline-lg-mobile": ["Montserrat", "ui-sans-serif", "system-ui"],
        "body-lg": ["Inter", "ui-sans-serif", "system-ui"],
        "body-md": ["Inter", "ui-sans-serif", "system-ui"],
        "body-sm": ["Inter", "ui-sans-serif", "system-ui"],
        "label-md": ["Inter", "ui-sans-serif", "system-ui"],
      },
      fontSize: {
        "headline-xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "600" }],
      },
      boxShadow: {
        "level-1": "0px 4px 20px rgba(0,0,0,0.04)",
        "level-2": "0px 8px 30px rgba(0,0,0,0.08)",
      },
      keyframes: {
        "whisper-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(135,210,253,0.4)" },
          "50%": { boxShadow: "0 0 24px 6px rgba(135,210,253,0.4)" },
        },
      },
      animation: {
        "whisper-pulse": "whisper-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
