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
    <footer className="mt-auto border-t border-ink/10 bg-surface-container-low/40">
      <div className="mx-auto flex w-full max-w-wide flex-col gap-8 px-margin-desktop py-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-display text-headline-md font-bold tracking-tighter text-primary">
            WhisperLag
          </span>
          <span className="font-mono-label text-mono-label text-onSurfaceVariant">
            © 2026 University of Lagos. End-to-End Encrypted via UNILAG Secure.
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-label-caps text-label-caps uppercase tracking-wider text-onSurfaceVariant transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="whisper-lock-glow flex w-fit items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2">
          <span className="material-symbols-outlined text-[22px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            lock
          </span>
          <span className="font-label-caps text-label-caps text-onSurfaceVariant">Whisper Lock Active</span>
        </div>
      </div>
    </footer>
  );
}