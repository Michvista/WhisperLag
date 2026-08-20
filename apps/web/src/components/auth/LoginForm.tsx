"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, storeSession } from "@/lib/api";

/**
 * Institutional sign-in form (editorial style). Wires to the API and stores
 * the session token on success.
 */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await api<{ token: string; user: { role: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      storeSession(result.token, result.user.role);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="relative">
        <label htmlFor="student_id" className="absolute -top-5 left-0 font-label-caps text-label-caps text-onSurfaceVariant">
          UNILAG ID
        </label>
        <input
          id="student_id"
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. 1902030..."
          className="input-minimal w-full font-body-md text-body-md text-onSurface"
        />
      </div>
      <div className="relative">
        <label htmlFor="password" className="absolute -top-5 left-0 font-label-caps text-label-caps text-onSurfaceVariant">
          Secure Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input-minimal w-full font-body-md text-body-md text-onSurface"
        />
      </div>

      {error && (
        <p className="border border-error-container bg-error-container/30 p-3 font-body-sm text-body-sm text-onErrorContainer">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4 pt-8">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink py-4 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary disabled:opacity-60"
        >
          {loading ? "Authenticating…" : "Authenticate & Enter"}
        </button>
        <div className="mt-4 flex items-center justify-between">
          <span className="h-px flex-1 bg-ink/10" />
          <span className="px-4 font-label-caps text-label-caps text-onSurfaceVariant">Or</span>
          <span className="h-px flex-1 bg-ink/10" />
        </div>
        <button
          type="button"
          className="w-full border border-ink bg-transparent py-4 font-label-caps text-label-caps uppercase tracking-widest text-onSurface transition-colors duration-300 hover:bg-surface-variant"
        >
          Register New Account
        </button>
      </div>
    </form>
  );
}