"use client";

import Link from "next/link";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { WhisperLogo } from "@/components/ui/WhisperLogo";
import { api } from "@/lib/api";

const TRUST_ITEMS = [
  {
    title: "Cryptographically Anonymous",
    body: "Every submission is stripped of identifying metadata before it reaches our servers. The Whisper Lock ensures your voice remains solely yours.",
  },
  {
    title: "Editorial Clarity",
    body: "We prioritize the substance of your message. A calm, distraction-free space to articulate complex concerns with focus and dignity.",
  },
  {
    title: "Direct Institutional Routing",
    body: "Feedback isn't shouted into a void. It is securely routed to the appropriate faculty or compliance boards for confidential review.",
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

/** Animated counter for the live stats band. */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduce) {
      setN(value);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  return (
    <span className="font-display text-5xl font-bold text-onSurface md:text-6xl">
      {n.toLocaleString()}
      <span className="text-primary">{suffix}</span>
    </span>
  );
}

/** Shows a dash while stats load, then the animated counter. */
function StatValue({ value, suffix }: { value: number | null; suffix?: string }) {
  if (value === null) return <span className="font-display text-5xl font-bold text-onSurfaceVariant/50 md:text-6xl">—</span>;
  return <Counter value={value} suffix={suffix} />;
}

/** Editorial marketing landing page with a live stats band. */
export default function LandingPage() {
  const [stats, setStats] = useState<{ whispers: number; departments: number; rate: number } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Public landing shows REAL aggregate counts via the unauthenticated
    // stats endpoint. The Neon pooler occasionally cold-starts, so retry a
    // few times before giving up; while loading we show a dash, never "0".
    let attempts = 0;
    let alive = true;
    const fetchStats = async () => {
      try {
        const d = await api<{ totalWhispers: number; totalDepartments: number; resolutionRate: number }>(
          "/stats/public",
          { cache: "no-store" },
        );
        if (alive) setStats({ whispers: d.totalWhispers, departments: d.totalDepartments, rate: d.resolutionRate });
      } catch {
        attempts += 1;
        if (attempts < 3 && alive) {
          setTimeout(fetchStats, 1200 * attempts);
        } else if (alive) {
          setFailed(true);
        }
      }
    };
    void fetchStats();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-surface font-body text-onSurface">
      {/* Public nav — Sign In only (no dashboard link for logged-out visitors) */}
      <header className="border-b border-ink/10">
        <div className="mx-auto flex w-full max-w-wide items-center justify-between px-margin-mobile py-4 md:px-margin-desktop">
          <Link href="/" className="font-display text-headline-md font-bold tracking-tighter text-primary">
            WhisperLag
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#purpose" className="font-label-caps text-label-caps uppercase text-onSurfaceVariant/70 transition-colors hover:text-primary">
              The Purpose
            </a>
            <a href="#trust" className="font-label-caps text-label-caps uppercase text-onSurfaceVariant/70 transition-colors hover:text-primary">
              Trust
            </a>
            <Link href="/login" className="font-label-caps text-label-caps uppercase text-onSurfaceVariant/70 transition-colors hover:text-primary">
              Sign In
            </Link>
          </div>
          <Link
            href="/login"
            className="bg-ink px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero — Speak Now leads to sign in (a student must authenticate first) */}
      <section className="mx-auto w-full max-w-wide px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="flex flex-col gap-gutter md:flex-row">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex w-full flex-col justify-center md:w-3/5">
            <motion.p variants={itemVariants} className="mb-6 flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-unilag-green">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-unilag-green" />
              University of Lagos · Quality Assurance &amp; SERVICOM
            </motion.p>
            <motion.h1 variants={itemVariants} className="mb-8 font-display text-4xl font-bold leading-tight tracking-tight text-onSurface md:text-display-xl">
              A student who whispers
              <br />
              <span className="font-normal text-unilag-green">is still speaking.</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mb-12 max-w-xl font-body-lg text-body-lg text-onSurfaceVariant">
              A space designed for institutional trust and absolute privacy.
              Because the most important feedback often requires a safe harbor.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
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
            <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden bg-surface p-8">
              <WhisperLogo size={200} className="z-10" />
              <div className="z-10 mt-6 flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-onSurfaceVariant">
                <span className="material-symbols-outlined text-unilag-green" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lock
                </span>
                End-to-End Encrypted
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-wide px-margin-mobile md:px-margin-desktop">
        <div className="rule-b" />
      </div>

      {/* Live stats band */}
      <section className="mx-auto w-full max-w-wide px-margin-mobile py-16 md:px-margin-desktop">
        <div className="grid grid-cols-1 gap-10 border-y border-ink/10 md:grid-cols-3">
          <div className="flex flex-col gap-2 py-8 md:border-r md:border-ink/10 md:pr-10">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-onSurfaceVariant">
              Anonymous Whispers Submitted
            </span>
            <StatValue value={stats?.whispers ?? null} />
            <span className="font-mono-label text-mono-label text-unilag-green">Every identity protected</span>
          </div>
          <div className="flex flex-col gap-2 py-8 md:border-r md:border-ink/10 md:px-10">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-onSurfaceVariant">
              Faculties Covered
            </span>
            <StatValue value={stats?.departments ?? null} />
            <span className="font-mono-label text-mono-label text-onSurfaceVariant">Across the University of Lagos</span>
          </div>
          <div className="flex flex-col gap-2 py-8 md:pl-10">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-onSurfaceVariant">
              Resolution Rate
            </span>
            <StatValue value={stats?.rate ?? null} suffix="%" />
            <span className="font-mono-label text-mono-label text-unilag-blue">Closed through institutional review</span>
          </div>
        </div>
        {failed && (
          <p className="mt-4 text-center font-mono-label text-mono-label text-onSurfaceVariant/60">
            Live feed unreachable right now — it will retry automatically.
          </p>
        )}
      </section>

      {/* Purpose */}
      <section id="purpose" className="mx-auto w-full max-w-wide px-margin-mobile py-section-gap md:px-margin-desktop">
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
      <section id="trust" className="bg-surface-container-low">
        <div className="mx-auto w-full max-w-wide px-margin-mobile py-section-gap md:px-margin-desktop">
          <h2 className="mb-16 font-display text-headline-lg font-bold text-onSurface md:text-display-xl">
            The Architecture of Trust
          </h2>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
            {TRUST_ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="flex flex-col gap-8 border-t border-ink/10 py-8 md:flex-row md:items-start"
              >
                <span className="font-display w-16 text-headline-lg font-normal text-unilag-gold">
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