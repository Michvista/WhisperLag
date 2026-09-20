import Link from "next/link";
import { WhisperBrand } from "@/components/ui/WhisperBrand";

interface InfoPageProps {
  title: string;
  eyebrow?: string;
  body: string;
}

export function InfoPage({ title, eyebrow = "Institutional Quality Assurance", body }: InfoPageProps) {
  return (
    <main className="min-h-screen bg-[#F5F5F5] px-4 py-12 font-body text-[#10253A] sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-[#DCE3E7] bg-white p-8 sm:p-12 shadow-sm">
        <div className="mb-8">
          <WhisperBrand href="/" />
        </div>
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#009A44]">{eyebrow}</span>
        <h1 className="mt-2 mb-6 font-montserrat text-3xl font-extrabold text-[#10253A]">{title}</h1>
        <div className="space-y-4 text-sm leading-relaxed text-[#60758C]">{body}</div>
        <div className="mt-8">
          <Link
            href="/"
            className="btn-primary-green inline-flex px-6 py-2.5 text-xs font-extrabold"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}