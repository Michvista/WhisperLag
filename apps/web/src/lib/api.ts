/**
 * Thin typed client for the WhisperLag API.
 * The API base URL is read from NEXT_PUBLIC_API_URL (defaults to the
 * local API dev server) and swapped for the deployed URL in production.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

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
