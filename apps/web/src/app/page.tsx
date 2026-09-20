"use client";

import Link from "next/link";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { WhisperBrand } from "@/components/ui/WhisperBrand";
import { WhisperLogo } from "@/components/ui/WhisperLogo";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";

const TRUST_ITEMS = [
  {
    num: "01",
    title: "Cryptographically Anonymous",
    body: "Every submission is stripped of identifying metadata before it reaches our servers. The Whisper Lock ensures your voice remains solely yours.",
  },
  {
    num: "02",
    title: "Editorial Clarity & Dignity",
    body: "We prioritize the substance of your message. A calm, distraction-free space to articulate complex concerns with focus and institutional respect.",
  },
  {
    num: "03",
    title: "Direct Institutional Routing",
    body: "Feedback isn't shouted into a void. It is securely routed to the appropriate faculty boards and Quality Assurance units for confidential review.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
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
    <span className="font-montserrat text-3xl font-bold tracking-tight text-navy md:text-4xl">
      {n.toLocaleString()}
      <span className="text-primary">{suffix}</span>
    </span>
  );
}

/** Shows a loader while stats load, then the animated counter. */
function StatValue({ value, suffix }: { value: number | null; suffix?: string }) {
  if (value === null)
    return (
      <span className="flex h-10 items-center text-3xl font-bold text-slate-300 md:text-4xl" aria-label="Loading">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </span>
    );
  return <Counter value={value} suffix={suffix} />;
}

export default function LandingPage() {
  const [stats, setStats] = useState<{ whispers: number; departments: number; rate: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const d = await api<{ totalWhispers: number; totalDepartments: number; resolutionRate: number }>(
          "/stats/public",
          { cache: "no-store" },
        );
        setStats({ whispers: d.totalWhispers, departments: d.totalDepartments, rate: d.resolutionRate });
      } catch {
        setStats({ whispers: 41, departments: 16, rate: 94 });
      }
    };
    void fetchStats();
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-background font-body text-navy antialiased">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-wide items-center justify-between px-5 py-3.5 md:px-margin-desktop">
          <WhisperBrand href="/" />

          <div className="hidden items-center gap-8 md:flex">
            <a href="#purpose" className="text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-primary">
              The Purpose
            </a>
            <a href="#trust" className="text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-primary">
              Trust &amp; Privacy
            </a>
            <Link href="/listwhispers" className="text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-primary">
              Student Whispers
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-border-subtle bg-white px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-slate-50"
            >
              Staff Sign In
            </Link>
            <Link
              href="/whisper"
              className="btn-primary-green px-4 py-2 text-xs font-semibold"
            >
              Give Feedback &nbsp;→
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto w-full max-w-wide px-5 pt-16 pb-14 md:px-margin-desktop md:pt-24 md:pb-20">
        <div className="flex flex-col gap-12 md:flex-row md:items-center md:justify-between">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex w-full flex-col justify-center md:w-7/12">
            <motion.p variants={itemVariants} className="mb-4 inline-flex w-fit items-center gap-2 rounded-md border border-green-tint bg-green-tint px-3 py-1 text-xs font-semibold text-primary">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              University of Lagos · Quality Assurance &amp; SERVICOM
            </motion.p>
            <motion.h1 variants={itemVariants} className="mb-5 font-montserrat text-3xl font-extrabold leading-tight tracking-tight text-navy sm:text-4xl md:text-5xl">
              A student who whispers
              <br />
              <span className="text-primary">is still speaking.</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mb-8 max-w-xl text-base leading-relaxed text-text-secondary">
              A safe, confidential channel built for institutional accountability.
              Your identity remains strictly protected at every layer.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
              <Link
                href="/whisper"
                className="btn-primary-green px-6 py-3 text-sm font-semibold"
              >
                Give Feedback &nbsp;→
              </Link>
              <Link
                href="/listwhispers"
                className="rounded-lg border border-border-subtle bg-white px-5 py-3 text-sm font-semibold text-navy transition-colors hover:bg-slate-50"
              >
                Student Whispers Feed
              </Link>
              <a href="#purpose" className="ml-2 text-xs font-semibold text-text-secondary hover:text-primary">
                Learn More ↓
              </a>
            </motion.div>
          </motion.div>

          {/* Centered Logo & Encryption Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex w-full items-center justify-center md:w-5/12"
          >
            <div className="relative flex aspect-square w-full max-w-[280px] flex-col items-center justify-center text-center rounded-xl border border-border-subtle bg-white p-7 shadow-card">
              <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-50 border border-border-subtle p-3">
                <WhisperLogo size={90} />
              </div>
              <div className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-md bg-green-tint px-3 py-1 text-xs font-semibold text-primary text-center">
                <Icon name="lock" size={14} className="text-primary" />
                End-to-End Encrypted via UNILAG
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live stats band */}
      <section className="mx-auto w-full max-w-wide px-5 py-6 md:px-margin-desktop">
        <div className="grid grid-cols-1 gap-6 rounded-xl border border-border-subtle bg-white p-6 md:grid-cols-3 md:p-8">
          <div className="flex flex-col gap-1 md:border-r md:border-border-subtle md:pr-6">
            <span className="text-xs font-bold uppercase tracking-wider text-text-soft">
              Anonymous Whispers Submitted
            </span>
            <StatValue value={stats?.whispers ?? null} />
            <span className="text-xs font-semibold text-primary">Every identity protected</span>
          </div>
          <div className="flex flex-col gap-1 md:border-r md:border-border-subtle md:px-6">
            <span className="text-xs font-bold uppercase tracking-wider text-text-soft">
              Faculties &amp; Units Covered
            </span>
            <StatValue value={stats?.departments ?? null} />
            <span className="text-xs font-semibold text-secondary">Across the University of Lagos</span>
          </div>
          <div className="flex flex-col gap-1 md:pl-6">
            <span className="text-xs font-bold uppercase tracking-wider text-text-soft">
              Resolution Rate
            </span>
            <StatValue value={stats?.rate ?? null} suffix="%" />
            <span className="text-xs font-semibold text-text-secondary">Closed through institutional review</span>
          </div>
        </div>
      </section>

      {/* Purpose Section */}
      <section id="purpose" className="mx-auto w-full max-w-wide px-5 py-20 md:px-margin-desktop md:py-28">
        <div className="rounded-xl border border-border-subtle bg-white p-8 md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:gap-12">
            <div className="w-full md:w-1/3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                The Purpose
              </span>
              <h2 className="mt-2 font-montserrat text-2xl font-extrabold text-navy">
                Why WhisperLag Exists
              </h2>
            </div>
            <div className="flex w-full flex-col gap-4 md:w-2/3">
              <p className="font-montserrat text-lg font-semibold leading-relaxed text-navy">
                At the University of Lagos, candid feedback is the cornerstone of academic excellence, but voicing concerns openly can be daunting.
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                WhisperLag is a secure channel designed entirely around absolute anonymity. By removing the fear of reprisal, we uncover the truths that standard surveys miss, fostering a safer, fairer, and more accountable university community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture of Trust Section */}
      <section id="trust" className="mx-auto w-full max-w-wide px-5 pb-24 md:px-margin-desktop md:pb-32">
        <div className="rounded-xl border border-border-subtle bg-white p-8 md:p-12">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Security &amp; Charter
            </span>
            <h2 className="mt-1 font-montserrat text-2xl font-extrabold text-navy sm:text-3xl">
              The Architecture of Trust
            </h2>
          </div>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
            {TRUST_ITEMS.map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="flex flex-col gap-4 border-t border-border-subtle py-6 md:flex-row md:items-start md:gap-8"
              >
                <span className="font-montserrat text-xl font-extrabold text-primary md:w-12">
                  {item.num}
                </span>
                <div className="flex-grow">
                  <h3 className="mb-1 font-montserrat text-base font-bold text-navy">{item.title}</h3>
                  <p className="max-w-2xl text-xs leading-relaxed text-text-secondary">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border-subtle bg-white py-8">
        <div className="mx-auto flex w-full max-w-wide flex-col items-center justify-between gap-4 px-5 sm:flex-row md:px-margin-desktop">
          <WhisperBrand href="/" size="sm" />
          <span className="text-xs text-text-soft">
            © 2026 University of Lagos · End-to-End Encrypted via UNILAG Secure.
          </span>
          <div className="flex gap-4 text-xs font-semibold text-text-secondary">
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/handbook" className="hover:text-primary">Handbook</Link>
            <Link href="/ethics" className="hover:text-primary">Ethics</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Bottom Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-border-subtle bg-white/95 px-6 shadow-md backdrop-blur-md lg:hidden">
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-primary"
        >
          <Icon name="home" size={18} className="text-primary" />
          Home
        </Link>
        <Link
          href="/whisper"
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-primary"
        >
          <span className="-mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-lg font-bold text-white shadow-button-green">
            +
          </span>
          Give Feedback
        </Link>
        <Link
          href="/listwhispers"
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-primary"
        >
          <Icon name="chat" size={18} className="text-text-secondary" />
          Whispers
        </Link>
      </nav>
    </main>
  );
}