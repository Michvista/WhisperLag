import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/university-seal", label: "University Seal" },
];

/** Shared footer with the institutional sign-off. */
export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-outlineVariant bg-surface-container-lowest px-margin-mobile py-8 md:px-margin-desktop">
      <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-4 md:flex-row">
        <span className="text-center font-display text-headline-sm font-bold text-onSurface md:text-left">
          WhisperLag
        </span>
        <span className="text-body-sm text-body-sm text-onSurfaceVariant opacity-80">
          © 2024 University of Lagos. Protected by Whisper Lock.
        </span>
        <div className="flex items-center gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-label-md text-label-md text-onSurfaceVariant transition-opacity hover:text-primary hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}