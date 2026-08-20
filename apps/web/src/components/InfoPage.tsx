import Link from "next/link";

interface InfoPageProps {
  title: string;
  eyebrow?: string;
  body: string;
}

export function InfoPage({ title, eyebrow = "Institutional", body }: InfoPageProps) {
  return (
    <main className="flex min-h-screen flex-col bg-surface px-margin-mobile py-24 font-body text-onSurface md:px-margin-desktop">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="mb-12 font-display text-headline-md font-bold tracking-tighter text-primary">
          WhisperLag
        </Link>
        <p className="mb-4 font-label-caps text-label-caps uppercase tracking-widest text-onSurfaceVariant">{eyebrow}</p>
        <h1 className="mb-6 font-display text-headline-lg font-bold text-onSurface">{title}</h1>
        <p className="font-body-lg text-body-lg leading-relaxed text-onSurfaceVariant">{body}</p>
        <Link
          href="/"
          className="mt-12 inline-block border border-ink px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest text-onSurface transition-colors duration-300 hover:bg-surface-variant"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}