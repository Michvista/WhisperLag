"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

const TRUST_PILLARS = [
  {
    icon: "shield_lock",
    bg: "bg-secondary-container",
    fg: "text-onSecondaryContainer",
    title: "Cryptographic Anonymity",
    body: "Your identity is stripped at the database level. Not even system administrators can trace a whisper back to your account.",
  },
  {
    icon: "account_balance",
    bg: "bg-primary-container",
    fg: "text-onPrimaryContainer",
    title: "Official Channel",
    body: "Direct integration with UNILAG's quality assurance workflows ensures your feedback reaches the right department immediately.",
  },
  {
    icon: "visibility",
    bg: "bg-tertiary-container",
    fg: "text-onTertiaryContainer",
    title: "Transparent Progress",
    body: "Track the status of your reported issues through resolution, preserving your privacy the whole way.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export default function LandingPage() {

  return (
    <main className="flex min-h-screen flex-col bg-surface font-body text-onBackground">
      {/* TopNav */}
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b-2 border-primary bg-surface px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl font-bold text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            security
          </span>
          <span className="font-display text-headline-sm font-bold text-primary">WhisperLag</span>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/dashboard" className="rounded px-3 py-2 font-label-md text-label-md text-onSurfaceVariant transition-colors hover:bg-surface-container-low hover:text-primary">
            Dashboard
          </Link>
          <Link href="/whisper" className="rounded px-3 py-2 font-label-md text-label-md text-onSurfaceVariant transition-colors hover:bg-surface-container-low hover:text-primary">
            My Whispers
          </Link>
          <Link href="/faculty" className="rounded px-3 py-2 font-label-md text-label-md text-onSurfaceVariant transition-colors hover:bg-surface-container-low hover:text-primary">
            Faculty
          </Link>
          <Link href="/admin" className="rounded px-3 py-2 font-label-md text-label-md text-onSurfaceVariant transition-colors hover:bg-surface-container-low hover:text-primary">
            Admin
          </Link>
        </nav>
        <div className="flex items-center gap-4 text-primary">
          <button aria-label="Notifications" className="rounded-full p-2 transition-colors hover:bg-surface-container-low">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button aria-label="Account" className="rounded-full p-2 transition-colors hover:bg-surface-container-low">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-between gap-12 px-margin-mobile pb-16 pt-24 md:flex-row md:px-margin-desktop">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-container flex-1 space-y-6"
        >
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary-container bg-secondary-container/20 px-4 py-2 animate-whisper-pulse">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-onSecondary">
                <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lock
                </span>
              </span>
              <span className="font-label-md text-label-md text-secondary">
                Your whisper is hidden. Nobody knows it is you.
              </span>
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="font-display text-headline-lg-mobile font-bold text-onSurface md:text-headline-xl">
            A student who whispers is still speaking.
          </motion.h1>

          <motion.p variants={itemVariants} className="max-w-2xl font-body-lg text-body-lg text-onSurfaceVariant">
            WhisperLag is the secure, official channel for University of Lagos
            students to provide candid feedback, report issues, and improve
            campus life — with absolute anonymity guaranteed.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col gap-4 pt-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 font-label-md text-label-md text-onPrimary shadow-level-1 transition-colors hover:bg-surface-tint active:scale-95"
            >
              Go to Dashboard
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <a
              href="#trust"
              className="flex h-12 items-center justify-center rounded-lg border border-outline bg-transparent px-8 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container-low active:scale-95"
            >
              Learn More
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-surface-container shadow-level-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: "9rem", fontVariationSettings: "'FILL' 1" }}>
              lock
            </span>
          </div>
        </motion.div>
      </section>

      {/* Trust Promise */}
      <section id="trust" className="border-t border-outlineVariant bg-background px-margin-mobile py-16 md:px-margin-desktop">
        <div className="mx-auto max-w-container">
          <div className="mb-12 text-center">
            <h2 className="font-display text-headline-lg font-bold text-onSurface">The Trust Promise</h2>
            <p className="mx-auto mt-4 max-w-2xl font-body-md text-body-md text-onSurfaceVariant">
              Built on the pillars of institutional integrity and absolute user
              safety. Your voice is heard without ever feeling exposed.
            </p>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {TRUST_PILLARS.map((pillar) => (
              <motion.div
                key={pillar.title}
                variants={itemVariants}
                className="flex flex-col items-center rounded-lg border border-outlineVariant/30 bg-surface-container-lowest p-6 text-center shadow-level-1"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${pillar.bg} ${pillar.fg}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {pillar.icon}
                  </span>
                </div>
                <h3 className="font-display text-headline-sm font-semibold text-onSurface">{pillar.title}</h3>
                <p className="mt-2 font-body-sm text-body-sm text-onSurfaceVariant">{pillar.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}