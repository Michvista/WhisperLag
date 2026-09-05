import { LoginForm } from "@/components/auth/LoginForm";
import { WhisperLogo } from "@/components/ui/WhisperLogo";
import { Icon } from "@/components/ui/Icon";

/**
 * Institutional sign-in: an asymmetric 40/60 split. The form lives on the
 * left; the right pane carries the Whisper Lock trust narrative.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background font-body text-onBackground md:flex-row">
      {/* Left pane : the form */}
      <section className="relative flex flex-1 flex-col justify-center border-b border-ink/10 p-margin-mobile md:flex-[0_0_40%] md:border-b-0 md:border-r md:p-margin-desktop">
        <div className="absolute left-margin-desktop top-margin-desktop hidden md:block">
          <h1 className="font-display text-headline-lg font-bold tracking-tighter text-primary">WhisperLag</h1>
        </div>
        <div className="mx-auto mt-24 w-full max-w-md md:mt-0">
          <div className="mb-12">
            <h2 className="mb-2 font-display text-headline-lg font-semibold text-onSurface">Staff &amp; Student Access</h2>
            <p className="font-body-md text-body-md text-onSurfaceVariant">
              Faculty and administrators sign in here. Students don&apos;t need
              an account : just <span className="font-medium text-onSurface">Speak Now</span>.
            </p>
          </div>
          <LoginForm />
          <p className="mt-12 text-center font-label-caps text-label-caps text-onSurfaceVariant">
            Students: <a href="/whisper" className="text-primary hover:underline">submit a whisper without signing in</a>.
          </p>
        </div>
      </section>

      {/* Right pane : trust context */}
      <aside className="relative flex flex-1 flex-col items-center justify-center p-margin-mobile md:flex-[0_0_60%] md:p-margin-desktop">
        <div className="absolute right-margin-desktop top-margin-desktop hidden md:block">
          <div className="whisper-lock-glow flex items-center gap-2 rounded-sm bg-surface px-4 py-2">
            <Icon name="lock" size={24} className="text-primary" />
            <span className="font-label-caps text-label-caps text-onSurface">End-to-End Encrypted via UNILAG Secure</span>
          </div>
        </div>

        <div className="flex max-w-lg flex-col items-center text-center">
          <div className="mb-12 flex h-64 w-64 items-center justify-center rounded-xl border border-ink/5 bg-white shadow-sm">
            <WhisperLogo size={200} />
          </div>
          <h3 className="mb-6 font-display text-headline-md font-semibold text-onSurface">Your whisper is hidden.</h3>
          <div className="space-y-6 text-left">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 pt-1 font-mono-label text-mono-label text-primary">01</span>
              <div className="rule-b pb-6">
                <h4 className="mb-2 font-label-caps text-label-caps text-onSurface">Cryptographic Detachment</h4>
                <p className="font-body-md text-body-md text-onSurfaceVariant">
                  Upon successful authentication, your identity is verified but
                  never linked to the reports you submit. The connection is
                  severed at the protocol level.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="mt-0.5 pt-1 font-mono-label text-mono-label text-primary">02</span>
              <div>
                <h4 className="mb-2 font-label-caps text-label-caps text-onSurface">Institutional Trust</h4>
                <p className="font-body-md text-body-md text-onSurfaceVariant">
                  Built in collaboration with the UNILAG Ethics Board. Every
                  voice can be heard without fear of repercussion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}