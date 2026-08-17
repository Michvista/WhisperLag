import type { Role } from "./roles";

/**
 * Shared TypeScript types for API request/response contracts.
 * These define the shape of data crossing the wire so the frontend and
 * backend agree without needing to inspect each other's code.
 */

/** Standard API envelope used by every response. */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/** Authenticated principal attached to requests by the auth middleware. */
export interface AuthPrincipal {
  id: string;
  email: string;
  role: Role;
}

/** Paginated list envelope. */
export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** A whisper (anonymous feedback submission). */
export interface Whisper {
  id: string;
  category: string;
  content: string;
  /** Sensitivity flag; the submitter is NEVER stored for anonymous whispers. */
  isAnonymous: boolean;
  departmentId: string | null;
  status: "NEW" | "ACKNOWLEDGED" | "ACTIONED";
  createdAt: string;
}

/** A course / lecturer evaluation submission. */
export interface Evaluation {
  id: string;
  courseId: string;
  lecturerId: string;
  rating: number;
  comment: string;
  rubricId: string;
  createdAt: string;
}

/** Aggregate view of evaluation results (never includes identities). */
export interface EvaluationAggregate {
  courseId: string;
  lecturerId: string;
  averageRating: number;
  responseCount: number;
  breakdown: Record<string, number>;
}

/** Survey / poll. */
export interface Survey {
  id: string;
  title: string;
  description: string;
  isAnonymous: boolean;
  opensAt: string;
  closesAt: string | null;
  status: "DRAFT" | "OPEN" | "CLOSED";
}

/** Department performance snapshot used on admin dashboards. */
export interface DepartmentSnapshot {
  departmentId: string;
  name: string;
  kpiScores: Record<string, number>;
  trend: Array<{ period: string; score: number }>;
}
