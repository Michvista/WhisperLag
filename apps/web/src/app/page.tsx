"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { WhisperLogo } from "@/components/ui/WhisperLogo";

const TRUST_ITEMS = [
  {
    title: "End-to-End Encrypted via UNILAG Secure",
    body: "Every submission is stripped of identifying metadata before it ever reaches our servers. The Whisper Lock ensures your voice remains solely yours.",
  },
  {
    title: "Editorial Clarity",
    body: "We prioritize the substance of your message. Our interface removes distractions, allowing you to articulate complex concerns with focus and dignity.",
  },
  {
    title: "Direct Institutional Routing",
    body: "Feedback isn't shouted into a void. It is securely routed to the appropriate faculty or compliance boards for actionable, confidential review.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
};

/** Editorial marketing landing page (per the "Whisper" design). */
export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-surface font-body text-onSurface">
      {/* Top nav (public marketing page only) */}
      <header className="border-b border-ink/10">
        <div className="mx-auto flex w-full max-w-wide items-center justify-between px-margin-desktop py-4">
          <span className="font-display text-headline-md font-bold tracking-tighter text-primary">
            WhisperLag
          </span>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/dashboard" className="font-label-caps text-label-caps uppercase text-onSurfaceVariant/70 transition-colors hover:text-primary">
              Dashboard
            </Link>
            <Link href="/login" className="font-label-caps text-label-caps uppercase text-onSurfaceVariant/70 transition-colors hover:text-primary">
              Sign In
            </Link>
          </div>
          <button className="bg-ink px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary">
            Submit a Whisper
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-wide px-margin-desktop py-section-gap">
        <div className="flex flex-col gap-gutter md:flex-row">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex w-full flex-col justify-center md:w-3/5">
            <motion.h1 variants={itemVariants} className="mb-8 font-display text-4xl font-bold leading-tight tracking-tight text-onSurface md:text-display-xl">
              A student who whispers
              <br />
              <span className="font-normal text-onSurfaceVariant">is still speaking.</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mb-12 max-w-xl font-body-lg text-body-lg text-onSurfaceVariant">
              A space designed for institutional trust and absolute privacy.
              Because the most important feedback often requires a safe harbor.
            </motion.p>
            <motion.div variants={itemVariants} className="flex items-center gap-8">
              <Link
                href="/whisper"
                className="bg-ink px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary"
              >
                Speak Now
              </Link>
              <a href="#purpose" className="border-b border-onSurface pb-1 font-label-caps text-label-caps uppercase tracking-widest text-onSurface transition-colors hover:border-primary hover:text-primary">
                Learn More
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex w-full items-center justify-center pt-12 md:w-2/5 md:pt-0"
          >
            <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden border border-ink/10 bg-surface p-8">
              <WhisperLogo size={160} className="z-10 mb-8" />
              <div className="absolute inset-0 bg-gradient-to-br from-surface-container-highest/20 to-transparent" />
              <div className="z-10 text-center">
                <p className="mb-2 font-display text-headline-md font-semibold text-onSurface">Your whisper is hidden.</p>
                <p className="font-body-lg text-body-lg text-onSurfaceVariant">Nobody knows it is you.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-wide px-margin-desktop">
        <div className="rule-b" />
      </div>

      {/* Purpose */}
      <section id="purpose" className="mx-auto w-full max-w-wide px-margin-desktop py-section-gap">
        <div className="flex flex-col gap-gutter md:flex-row">
          <div className="w-full md:w-1/3 md:pr-12">
            <h2 className="mb-6 font-label-caps text-label-caps uppercase tracking-wider text-onSurfaceVariant">
              The Purpose
            </h2>
          </div>
          <div className="flex w-full flex-col gap-12 md:w-2/3">
            <p className="max-w-3xl font-display text-headline-md font-semibold leading-relaxed text-onSurface">
              At the University of Lagos, we believe candid feedback is the
              cornerstone of academic excellence — but voicing concerns can be daunting.
            </p>
            <p className="max-w-2xl font-body-lg text-body-lg leading-relaxed text-onSurfaceVariant">
              WhisperLag is an editorial, secure channel designed entirely around
              absolute anonymity. By removing the fear of reprisal, we uncover the
              truths that standard surveys miss, fostering a stronger, more
              accountable university identity.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture of Trust */}
      <section className="bg-surface-container-low">
        <div className="mx-auto w-full max-w-wide px-margin-desktop py-section-gap">
          <h2 className="mb-16 font-display text-headline-lg font-bold text-onSurface md:text-display-xl">
            The Architecture of Trust
          </h2>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
            {TRUST_ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="rule-b flex flex-col gap-8 border-t border-ink/10 py-8 md:flex-row md:items-start"
              >
                <span className="font-display w-16 text-headline-lg font-normal text-onSurfaceVariant/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-grow">
                  <h3 className="mb-4 font-display text-headline-md font-semibold text-onSurface">{item.title}</h3>
                  <p className="max-w-2xl font-body-md text-body-md text-onSurfaceVariant">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}