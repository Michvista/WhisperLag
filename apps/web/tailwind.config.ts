import type { Config } from "tailwindcss";

/**
 * WhisperLag design tokens — the "Whisper" system generated in Stitch AI.
 * A minimalist-institutional aesthetic: editorial typography, sharp corners,
 * 1px Ink@10% rules instead of cards, and Ink buttons that shift to UNILAG
 * Green on hover. Shadows are reserved for the Whisper Lock alone.
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
        secondary: "#00668a",
        onSecondary: "#ffffff",
        "secondary-container": "#87d2fd",
        onSecondaryContainer: "#005b7c",
        tertiary: "#795600",
        "tertiary-fixed-dim": "#fbbc38",
        error: "#ba1a1a",
        onError: "#ffffff",
        "error-container": "#ffdad6",
        onErrorContainer: "#93000a",
        // Brand anchors
        ink: "#111827",
        "unilag-green": "#006b2d",
        "sun-gold": "#fbbc38",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        unit: "4px",
        gutter: "24px",
        "margin-mobile": "20px",
        "margin-desktop": "64px",
        "section-gap": "120px",
      },
      maxWidth: {
        container: "1200px",
        wide: "1440px",
      },
      fontFamily: {
        display: ["Montserrat", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"],
        "display-xl": ["Montserrat", "ui-sans-serif", "system-ui"],
        "headline-lg": ["Montserrat", "ui-sans-serif", "system-ui"],
        "headline-md": ["Montserrat", "ui-sans-serif", "system-ui"],
        "body-lg": ["Inter", "ui-sans-serif", "system-ui"],
        "body-md": ["Inter", "ui-sans-serif", "system-ui"],
        "label-caps": ["Inter", "ui-sans-serif", "system-ui"],
        "mono-label": ["Inter", "ui-sans-serif", "system-ui"],
      },
      fontSize: {
        "display-xl": ["64px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-md": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.1em", fontWeight: "600" }],
        "mono-label": ["13px", { lineHeight: "1", letterSpacing: "0.02em", fontWeight: "500" }],
      },
    },
  },
  plugins: [],
};

export default config;