/**
 * Thin typed client for the WhisperLag API.
 * The API base URL is read from NEXT_PUBLIC_API_URL (defaults to the
 * local API dev server) and swapped for the deployed URL in production.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/** Auth token stored on sign-in (demo persistence; HTTP-only cookie is the production path). */
const TOKEN_KEY = "whisperlag_token";
const ROLE_KEY = "whisperlag_role";

export function getToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(TOKEN_KEY) ?? undefined;
}

export function getRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY);
}

export function storeSession(token: string, role: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

/**
 * Parses the shared ApiResponse envelope and throws on failure so callers
 * can handle errors with try/catch rather than checking success flags.
 */
export async function api<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const body = (await res.json().catch(() => ({}))) as ApiErrorBody & { data?: T };

  if (!res.ok) {
    throw new Error(body.error?.message ?? `Request failed (${res.status})`);
  }

  return body.data as T;
}
