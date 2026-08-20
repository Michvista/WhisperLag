import Link from "next/link";

const CONTENT: Record<string, { title: string; body: string }> = {
  privacy: {
    title: "Institutional Privacy",
    body: "WhisperLag collects no identifying information with your submissions. Whispers are stored anonymously at the database level, and your identity is never linked to the feedback you provide. Data is encrypted in transit and at rest via UNILAG's secure infrastructure.",
  },
  handbook: {
    title: "Student Handbook",
    body: "WhisperLag is the University of Lagos channel for anonymous quality-assurance feedback. Students, faculty, and administrators each have role-appropriate views. Feedback is routed to the relevant faculty or compliance board for confidential review.",
  },
  support: {
    title: "Technical Support",
    body: "For help with signing in, submitting a whisper, or viewing reports, contact the Quality Assurance & SERVICOM Unit. Your queries are handled with the same confidentiality as your submissions.",
  },
  ethics: {
    title: "Ethics Board",
    body: "WhisperLag is built in collaboration with the UNILAG Ethics Board to ensure every voice can be heard without fear of repercussion. All administrative actions are audited, and anonymity protocols are reviewed regularly.",
  },
};

/** Static institutional pages behind the footer links. */
export default async function InfoPage({ params }: { params: { slug?: string } }) {
  const key = (params?.slug as string) ?? "privacy";
  const content = CONTENT[key] ?? CONTENT.privacy;

  return (
    <main className="flex min-h-screen flex-col bg-surface px-margin-mobile py-24 font-body text-onSurface md:px-margin-desktop">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="mb-12 font-display text-headline-md font-bold tracking-tighter text-primary">
          WhisperLag
        </Link>
        <p className="mb-4 font-label-caps text-label-caps uppercase tracking-widest text-onSurfaceVariant">
          Institutional
        </p>
        <h1 className="mb-6 font-display text-headline-lg font-bold text-onSurface">{content.title}</h1>
        <p className="font-body-lg text-body-lg leading-relaxed text-onSurfaceVariant">{content.body}</p>
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