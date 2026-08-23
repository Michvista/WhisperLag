"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBlock, LoadingBlock } from "@/components/ui/States";
import { RoleGate } from "@/components/ui/RoleGate";
import { ROLES } from "@whisperlag/shared";
import { api, getToken } from "@/lib/api";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string; role: string } | null;
  department: { id: string; name: string } | null;
}

interface Department {
  id: string;
  name: string;
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-primary/10 text-primary",
  FACULTY: "bg-secondary-fixed-dim/20 text-onSecondaryContainer",
  STUDENT: "bg-ink/5 text-ink/50",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Secure internal messaging — the collaboration module from the RFP. */
export default function CollaborationPage() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [body, setBody] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [msgs, deps] = await Promise.all([
        api<Message[]>("/messages", { token: getToken(), cache: "no-store" }),
        api<Department[]>("/departments", { token: getToken(), cache: "no-store" }),
      ]);
      setMessages(msgs);
      setDepartments(deps);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    try {
      await api("/messages", {
        method: "POST",
        body: JSON.stringify({ body, departmentId: departmentId || undefined }),
        token: getToken(),
      });
      setBody("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <RoleGate minRole={ROLES.FACULTY}>
      <AppShell>
        <header className="rule-b mb-12 flex items-end justify-between pb-8">
          <div>
            <h1 className="mb-2 font-display text-headline-lg font-semibold text-onSurface">Collaboration</h1>
            <p className="font-body-md text-body-md text-onSurfaceVariant">
              Secure internal channel for faculty &amp; administrators. Students&apos;
              whispers are never shared here — only staff coordination.
            </p>
          </div>
          <span className="font-mono-label text-mono-label text-onSurfaceVariant">
            {messages?.length ?? 0} messages
          </span>
        </header>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[60%_40%]">
          {/* Feed */}
          <div>
            {loading ? (
              <LoadingBlock label="Loading messages…" />
            ) : error ? (
              <ErrorBlock message={error} onRetry={load} />
            ) : messages && messages.length > 0 ? (
              <div className="flex flex-col">
                {messages.map((m, i) => (
                  <div key={m.id} className="rule-b flex items-start gap-6 py-6">
                    <span className="font-display w-12 text-3xl font-light text-onSurfaceVariant/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-3">
                        <span className="font-label-caps text-label-caps uppercase tracking-wider text-onSurface">
                          {m.sender?.name ?? "Unknown"}
                        </span>
                        <span className={`px-2 py-0.5 font-label-caps text-[10px] uppercase tracking-wider ${ROLE_BADGE[m.sender?.role ?? ""] ?? "bg-ink/5 text-ink/50"}`}>
                          {m.sender?.role ?? ""}
                        </span>
                        {m.department && (
                          <span className="font-mono-label text-mono-label text-onSurfaceVariant">{m.department.name}</span>
                        )}
                        <span className="ml-auto font-mono-label text-mono-label text-onSurfaceVariant">
                          {formatTime(m.createdAt)}
                        </span>
                      </div>
                      <p className="font-body-md text-body-md leading-relaxed text-onSurface">{m.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body-md text-body-md text-onSurfaceVariant">
                No messages yet. Start the conversation below.
              </p>
            )}
          </div>

          {/* Composer */}
          <form onSubmit={send} className="flex flex-col gap-6 border-l border-ink/10 pl-10">
            <h2 className="font-display text-headline-md font-semibold text-onSurface">Post a note</h2>
            <div>
              <label className="mb-2 block font-label-caps text-label-caps text-onSurfaceVariant">
                Department (optional)
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="input-minimal w-full font-body-md text-body-md text-onSurface"
              >
                <option value="">University-wide / my department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-label-caps text-label-caps text-onSurfaceVariant">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                placeholder="Coordinate on a whisper, an evaluation, or a report…"
                className="input-minimal min-h-[160px] w-full resize-none font-body-lg leading-relaxed"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="bg-ink px-6 py-4 font-label-caps text-label-caps uppercase tracking-widest text-white transition-colors duration-300 hover:bg-primary disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send Note"}
            </button>
            {error && (
              <p className="border border-error-container bg-error-container/30 p-3 font-body-sm text-body-sm text-onErrorContainer">
                {error}
              </p>
            )}
          </form>
        </div>
      </AppShell>
    </RoleGate>
  );
}