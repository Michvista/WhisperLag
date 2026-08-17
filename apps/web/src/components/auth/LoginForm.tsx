"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, storeSession } from "@/lib/api";

/**
 * Sign-in form wired to the WhisperLag API. On success the token is
 * persisted to localStorage (kept simple for the hackathon demo) and the
 * user is routed to the dashboard.
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
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-2 block font-label-md text-label-md text-onSurface">
            Institutional Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@unilag.edu.ng"
            className="h-[48px] w-full rounded border border-outlineVariant bg-surface-container-lowest px-3 font-body-md text-body-md text-onSurface transition-all placeholder:text-onSurfaceVariant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block font-label-md text-label-md text-onSurface">
              Password
            </label>
            <a href="#" className="font-label-md text-label-md text-primary hover:underline">
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-[48px] w-full rounded border border-outlineVariant bg-surface-container-lowest px-3 font-body-md text-body-md text-onSurface transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {error && (
        <p className="rounded bg-error-container px-3 py-2 font-body-sm text-body-sm text-onErrorContainer">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-[48px] w-full items-center justify-center gap-2 rounded bg-primary font-label-md text-label-md text-onPrimary transition-colors hover:bg-surface-tint disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign In"}
        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
      </button>
    </form>
  );
}