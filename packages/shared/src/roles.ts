/**
 * Roles and Role-Based Access Control (RBAC) definitions.
 *
 * WhisperLag distinguishes four actor types, matching the RFP's
 * "role-based access" requirement:
 *   - STUDENT  : submits anonymous feedback, evaluations, participates
 *   - FACULTY  : sees aggregated results (never individual identities)
 *   - ADMIN    : full oversight, reporting, accreditation support
 *   - GUEST    : read-only external stakeholders (e.g. NUC accreditors)
 *
 * The permission map below is the single authority the backend's
 * `authorize()` middleware consults. Adding a capability is a one-line
 * change here; nothing else in the codebase needs to know about it.
 */

export const ROLES = {
  STUDENT: "STUDENT",
  FACULTY: "FACULTY",
  ADMIN: "ADMIN",
  GUEST: "GUEST",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Ordered by privilege so we can compare "at least as powerful as". */
export const ROLE_ORDER: Role[] = [
  ROLES.GUEST,
  ROLES.STUDENT,
  ROLES.FACULTY,
  ROLES.ADMIN,
];

/** Human-readable labels for UI display. */
export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.STUDENT]: "Student",
  [ROLES.FACULTY]: "Faculty",
  [ROLES.ADMIN]: "Administrator",
  [ROLES.GUEST]: "Guest",
};

/**
 * Permission keys recognised by the system. Expressed as
 * `<resource>:<action>` strings for clarity and easy grepping.
 */
export const PERMISSIONS = {
  // Feedback (whispers)
  SUBMIT_WHISPER: "feedback:submit",
  VIEW_WHISPER_META: "feedback:view-meta",
  // Evaluations
  SUBMIT_EVALUATION: "evaluation:submit",
  VIEW_EVALUATION_AGGREGATES: "evaluation:view-aggregates",
  // Surveys & polls
  CREATE_SURVEY: "survey:create",
  RESPOND_SURVEY: "survey:respond",
  VIEW_SURVEY_RESULTS: "survey:view-results",
  // Departments
  VIEW_DEPARTMENT: "department:view",
  MANAGE_DEPARTMENT: "department:manage",
  // Reporting / accreditation
  GENERATE_REPORT: "report:generate",
  VIEW_REPORTS: "report:view",
  // Administration
  MANAGE_USERS: "users:manage",
  VIEW_AUDIT_LOG: "audit:view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * The role -> permission matrix. This is the core of RBAC in WhisperLag.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.STUDENT]: [
    PERMISSIONS.SUBMIT_WHISPER,
    PERMISSIONS.SUBMIT_EVALUATION,
    PERMISSIONS.RESPOND_SURVEY,
  ],
  [ROLES.FACULTY]: [
    PERMISSIONS.SUBMIT_WHISPER,
    PERMISSIONS.SUBMIT_EVALUATION,
    PERMISSIONS.RESPOND_SURVEY,
    PERMISSIONS.VIEW_EVALUATION_AGGREGATES,
    PERMISSIONS.VIEW_DEPARTMENT,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.SUBMIT_WHISPER,
    PERMISSIONS.SUBMIT_EVALUATION,
    PERMISSIONS.RESPOND_SURVEY,
    PERMISSIONS.VIEW_EVALUATION_AGGREGATES,
    PERMISSIONS.CREATE_SURVEY,
    PERMISSIONS.VIEW_SURVEY_RESULTS,
    PERMISSIONS.VIEW_WHISPER_META,
    PERMISSIONS.VIEW_DEPARTMENT,
    PERMISSIONS.MANAGE_DEPARTMENT,
    PERMISSIONS.GENERATE_REPORT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_AUDIT_LOG,
  ],
  [ROLES.GUEST]: [
    PERMISSIONS.VIEW_DEPARTMENT,
    PERMISSIONS.VIEW_REPORTS,
  ],
};

/** True if `role` holds `permission`. */
export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** True if `role` is at least as privileged as `minimum`. */
export function atLeast(role: Role, minimum: Role): boolean {
  return ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(minimum);
}
