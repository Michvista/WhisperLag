"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBlock, LoadingBlock } from "@/components/ui/States";
import { RoleGate } from "@/components/ui/RoleGate";
import { ROLES } from "@whisperlag/shared";
import { api, getToken } from "@/lib/api";
import { toast } from "@/lib/toast";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string; role: string } | null;
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "text-primary",
  FACULTY: "text-secondary",
  STUDENT: "text-onSurfaceVariant",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Secure staff group chat — coordination without student identities. */
export default function CollaborationPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [meId, setMeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [msgs, me] = await Promise.all([
        api<Message[]>("/messages", { token: getToken(), cache: "no-store" }),
        api<{ id: string }>("/auth/me", { token: getToken(), cache: "no-store" }),
      ]);
      // API returns newest-first; show like WhatsApp (oldest at top, newest at bottom).
      setMessages([...msgs].reverse());
      setMeId(me.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      await api("/messages", { method: "POST", body: JSON.stringify({ body }), token: getToken() });
      setBody("");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to send", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <RoleGate minRole={ROLES.FACULTY}>
      <AppShell>
        <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
          <header className="rule-b flex items-center gap-3 pb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <span className="material-symbols-outlined text-primary">forum</span>
            </span>
            <div>
              <h1 className="font-display text-headline-md font-semibold text-onSurface">Staff Collaboration</h1>
              <p className="font-body-sm text-body-sm text-onSurfaceVariant">
                Secure channel for faculty &amp; administrators
              </p>
            </div>
          </header>

          {/* Chat window */}
          <div className="no-scrollbar flex-1 overflow-y-auto py-6">
            {loading ? (
              <LoadingBlock label="Loading messages…" />
            ) : error ? (
              <ErrorBlock message={error} onRetry={load} />
            ) : messages.length === 0 ? (
              <p className="py-10 text-center font-body-md text-body-md text-onSurfaceVariant">
                No messages yet. Say hello — this is your staff coordination space.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((m) => {
                  const mine = m.sender?.id === meId;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] border px-4 py-3 ${
                          mine
                            ? "border-primary bg-primary text-white"
                            : "border-ink/10 bg-surface-container-lowest text-onSurface"
                        }`}
                      >
                        {!mine && m.sender && (
                          <p className={`mb-1 font-label-caps text-label-caps uppercase tracking-wider ${ROLE_BADGE[m.sender.role] ?? ""}`}>
                            {m.sender.name} · {m.sender.role}
                          </p>
                        )}
                        <p className="font-body-md text-body-md leading-relaxed">{m.body}</p>
                        <p className={`mt-1 font-mono-label text-mono-label ${mine ? "text-white/70" : "text-onSurfaceVariant"}`}>
                          {formatTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <form onSubmit={send} className="flex items-end gap-3 border-t border-ink/10 pt-4">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type a message…"
              rows={1}
              className="input-minimal min-h-[48px] flex-1 resize-none font-body-md text-body-md"
            />
            <button
              type="submit"
              disabled={sending || !body.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center bg-ink text-white transition-colors duration-300 hover:bg-primary disabled:opacity-40"
              aria-label="Send"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </AppShell>
    </RoleGate>
  );
}