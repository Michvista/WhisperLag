/**
 * Global constants for the WhisperLag domain and brand.
 *
 * Brand tokens live here so the design system (web) and any server-rendered
 * outputs (reports, emails) can reference the same source of truth rather
 * than hard-coding hex values in many places.
 */

export const BRAND = {
  name: "WhisperLag",
  tagline: "A student who whispers is still speaking.",
  colors: {
    unilagGreen: "#009A44",
    white: "#FFFFFF",
    softGray: "#F5F5F5",
    trustBlue: "#2C7DA0",
  },
  typography: {
    body: "Inter",
    display: "Montserrat",
  },
} as const;

/** Core feature modules, mirroring the RFP scope areas. */
export const MODULES = {
  MONITORING: "MONITORING",
  EVALUATION: "EVALUATION",
  FEEDBACK: "FEEDBACK",
  PERFORMANCE: "PERFORMANCE",
  COLLABORATION: "COLLABORATION",
  ACCREDITATION: "ACCREDITATION",
} as const;

export type Module = (typeof MODULES)[keyof typeof MODULES];

export const MODULE_LABELS: Record<Module, string> = {
  [MODULES.MONITORING]: "Monitoring & Reporting",
  [MODULES.EVALUATION]: "Evaluation & Assessment",
  [MODULES.FEEDBACK]: "Feedback & Engagement",
  [MODULES.PERFORMANCE]: "Performance Measurement",
  [MODULES.COLLABORATION]: "Collaboration Tools",
  [MODULES.ACCREDITATION]: "Accreditation Support",
};

/** WhisperLag product promises used across marketing + UI copy. */
export const PROMISES = {
  whisperTime: "60 seconds", // "submit a whisper in under 60 seconds"
  reportTime: "2 minutes", // "print an accreditation report in under 2 minutes"
} as const;

/** Response/HTTP status codes we standardise on. */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/** Pagination defaults for list endpoints. */
export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
} as const;
