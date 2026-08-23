/**
 * Soft UNILAG community gate. Accepts an optional UNILAG email to confirm the
 * submitter is part of the campus community. The email is validated and then
 * DISCARDED — it is never stored or linked to the whisper, so anonymity holds.
 */
const UNILAG_DOMAINS = ["unilag.edu.ng", "live.unilag.edu.ng"];

export function isUnilagEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@").pop() ?? "";
  return UNILAG_DOMAINS.includes(domain);
}