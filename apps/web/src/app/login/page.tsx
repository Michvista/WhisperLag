import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { WhisperBrand } from "@/components/ui/WhisperBrand";
import { WhisperLogo } from "@/components/ui/WhisperLogo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-navy md:flex-row">
      {/* Left Pane: Login Card */}
      <section className="flex flex-1 flex-col justify-center border-b border-border-subtle p-6 sm:p-10 md:flex-[0_0_45%] md:border-b-0 md:border-r md:p-14">
        <div className="mb-8">
          <WhisperBrand href="/" />
        </div>

        <div className="mx-auto w-full max-w-sm space-y-6">
          <div>
            <h1 className="font-montserrat text-2xl font-bold text-navy sm:text-3xl">
              Portal Sign In
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
              Staff, faculty, and administrative access. Students can{" "}
              <Link href="/whisper" className="font-bold text-primary hover:underline">
                submit whispers anonymously without signing in
              </Link>
              .
            </p>
          </div>

          <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-card">
            <LoginForm />
          </div>

          <div className="text-center text-xs font-medium text-text-soft">
            Protected by University of Lagos Access Control
          </div>
        </div>
      </section>

      {/* Right Pane: Trust & Security Context */}
      <aside className="flex flex-1 flex-col items-center justify-center p-8 sm:p-12 md:flex-[0_0_55%]">
        <div className="flex max-w-md flex-col items-center text-center">
          <div className="mb-6 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-white border border-border-subtle shadow-card">
            <WhisperLogo size={100} />
          </div>

          <h2 className="font-montserrat text-xl font-bold text-navy">
            Your whisper is hidden.
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            Our architecture severs the connection between authenticated accounts and confidential feedback at the network boundary.
          </p>

          <div className="mt-8 grid w-full gap-3 text-left">
            <div className="rounded-lg border border-border-subtle bg-white p-4">
              <div className="text-xs font-bold text-primary">
                01 — Cryptographic Isolation
              </div>
              <div className="mt-1 text-xs text-text-secondary">
                Submissions are stored without IP records or session tokens.
              </div>
            </div>

            <div className="rounded-lg border border-border-subtle bg-white p-4">
              <div className="text-xs font-bold text-secondary">
                02 — Institutional Charter
              </div>
              <div className="mt-1 text-xs text-text-secondary">
                Governed by the UNILAG Quality Assurance &amp; SERVICOM Ethics Policy.
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}