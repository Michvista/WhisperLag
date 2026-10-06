"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, storeSession } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Icon } from "@/components/ui/Icon";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      toast(`Signed in as ${result.user.role.toLowerCase()}.`);
      router.push(
        result.user.role === "ADMIN" ? "/admin" : result.user.role === "FACULTY" ? "/faculty" : "/dashboard",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      toast(err instanceof Error ? err.message : "Sign in failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label htmlFor="student_id" className="text-xs font-extrabold uppercase tracking-wider text-[#10253A]">
          UNILAG Staff / Student ID
        </label>
        <input
          id="student_id"
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. 1902030... or staff email"
          className="wl-input"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-extrabold uppercase tracking-wider text-[#10253A]">
            Secure Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-primary transition-colors focus:outline-hidden"
            tabIndex={-1}
          >
            <Icon name={showPassword ? "visibility_off" : "visibility"} size={14} />
            <span>{showPassword ? "Hide" : "Show"}</span>
          </button>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="wl-input pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-soft hover:text-navy transition-colors focus:outline-hidden"
            title={showPassword ? "Hide password" : "Show password"}
          >
            <Icon name={showPassword ? "visibility_off" : "visibility"} size={17} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary-green w-full py-3.5 text-sm font-extrabold"
      >
        {loading ? "Authenticating…" : "Authenticate & Enter →"}
      </button>
    </form>
  );
}