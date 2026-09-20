import Link from "next/link";
import { WhisperBrand } from "@/components/ui/WhisperBrand";

const FOOTER_LINKS = [
  { href: "/privacy", label: "Institutional Privacy" },
  { href: "/handbook", label: "Student Handbook" },
  { href: "/support", label: "Technical Support" },
  { href: "/ethics", label: "Ethics Charter" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border-subtle bg-white py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <WhisperBrand href="/" size="sm" />
          <span className="text-[11px] text-text-soft">
            © 2026 University of Lagos · End-to-End Encrypted via UNILAG Secure.
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-semibold text-text-secondary">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}