import type { Config } from "tailwindcss";

/**
 * WhisperLag design tokens — "Whisper" system, re-grounded in the official
 * UNILAG institutional palette:
 *   Gold  #A99F84 · Green #4B8D6D · Blue #77C4EF
 * A warm, editorial, minimalist-institutional aesthetic: sharp corners,
 * 1px rule dividers, Ink buttons that shift to UNILAG Green on hover.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Warm neutral surfaces
        background: "#FAF9F6",
        onBackground: "#1A1C22",
        surface: "#FAF9F6",
        "surface-bright": "#FFFFFF",
        "surface-dim": "#EDEAE2",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F4F2EC",
        "surface-container": "#ECE9E0",
        "surface-container-high": "#E2DED2",
        "surface-container-highest": "#D9D4C6",
        onSurface: "#1A1C22",
        onSurfaceVariant: "#565B4A",
        "surface-variant": "#E2DED2",
        outline: "#6E7262",
        outlineVariant: "#C4C3B6",
        // UNILAG Green as primary
        primary: "#3C7A5B",
        onPrimary: "#FFFFFF",
        "primary-container": "#4B8D6D",
        onPrimaryContainer: "#F0F6F1",
        "primary-fixed": "#9FD4B5",
        "primary-fixed-dim": "#7BBE9B",
        onPrimaryFixed: "#06220F",
        onPrimaryFixedVariant: "#1F4A34",
        // UNILAG Blue as secondary
        secondary: "#77C4EF",
        onSecondary: "#0A2433",
        "secondary-container": "#A9DCF7",
        onSecondaryContainer: "#0B3A52",
        "secondary-fixed": "#C9EAFB",
        "secondary-fixed-dim": "#77C4EF",
        // Gold accent
        tertiary: "#A99F84",
        onTertiary: "#1C1A12",
        "tertiary-container": "#C7BFA8",
        onTertiaryContainer: "#2E2A1D",
        "tertiary-fixed": "#DCD6C4",
        "tertiary-fixed-dim": "#A99F84",
        // Semantic
        error: "#B3261E",
        onError: "#FFFFFF",
        "error-container": "#F9DEDC",
        onErrorContainer: "#8C1D18",
        // Brand anchors
        ink: "#1A1C22",
        "unilag-gold": "#A99F84",
        "unilag-green": "#4B8D6D",
        "unilag-blue": "#77C4EF",
        "sun-gold": "#C9A227",
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