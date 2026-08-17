/**
 * @whisperlag/shared
 *
 * Single source of truth for domain concepts shared across the
 * WhisperLag frontend and backend. Keeping these here (rather than
 * duplicated in each app) is an intentional architectural decision:
 * a change to a role name or module constant propagates everywhere,
 * so the API contracts and UI can never drift apart.
 */

export * from "./roles";
export * from "./constants";
export * from "./types";
