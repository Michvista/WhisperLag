import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/privacy", label: "Institutional Privacy" },
  { href: "/handbook", label: "Student Handbook" },
  { href: "/support", label: "Technical Support" },
  { href: "/ethics", label: "Ethics Board" },
];

/** Editorial footer: rule-separated, institutional sign-off. */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-surface-dim">
      <div className="mx-auto flex w-full max-w-wide flex-col items-center justify-between gap-6 px-margin-desktop py-12 md:flex-row">
        <span className="font-display text-headline-md font-bold text-onSurface">WhisperLag</span>
        <span className="text-center font-body-md text-body-md text-onSurfaceVariant">
          © 2026 University of Lagos. End-to-End Encrypted via UNILAG Secure.
        </span>
        <nav className="flex flex-wrap justify-center gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-label-caps text-label-caps uppercase text-onSurfaceVariant underline transition-colors hover:text-onSurface"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}