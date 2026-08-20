# WhisperLag — Architecture

This document explains **how** WhisperLag is built and **why**, so reviewers
can see the reasoning behind the structure, not just the code.

## 1. System overview

```
                         ┌────────────────────────────┐
                         │        Browser / PWA        │
                         │      apps/web (Next.js)     │
                         └──────────────┬─────────────┘
                                        │ HTTPS + Bearer JWT
                         ┌──────────────▼─────────────┐
                         │        Express API          │
                         │        apps/api             │
                         │  routes → controllers →     │
                         │  services → repository      │
                         └──────────────┬─────────────┘
                                        │ Prisma (type-safe)
                         ┌──────────────▼─────────────┐
                         │       PostgreSQL            │
                         │   (schema in prisma/)       │
                         └────────────────────────────┘
```

Supporting services: **Redis** (caching / queues), **Cloudinary** (document
storage for accreditation evidence), **JWT** (stateless auth).

## 2. Monorepo layout

We use **npm workspaces**. Each app/package is versioned independently and has
a narrow responsibility:

| Path | Role |
|------|------|
| `apps/web` | UI. Renders role-specific dashboards; consumes the API. |
| `apps/api` | Business logic + HTTP. No UI concerns. |
| `packages/shared` | Shared domain knowledge. No runtime dependencies beyond types. |

`packages/shared` is the architectural linchpin: the two apps share types and
the RBAC matrix through it, eliminating the "contract drift" that plagues
frontend/backend split codebases.

### Feature modules (`apps/api/src/modules/`)

| Module | Responsibility | Key endpoints |
|--------|----------------|---------------|
| `auth` | Register, login (JWT), current user | `POST /auth/login`, `GET /auth/me` |
| `feedback` | Anonymous whispers + the "Have I been heard?" feed | `POST /feedback`, `GET /feedback/recent` |
| `evaluations` | Course evaluations; aggregate-only summaries | `POST /evaluations`, `GET /evaluations/summary` |
| `surveys` | Polls / surveys with anonymous responses | `GET /surveys`, `POST /surveys/questions/:id/respond` |
| `departments` | Departments + admin KPI snapshots | `GET /departments/:id/snapshot` |
| `courses` | Academic course registry | `GET /courses` |
| `stats` | Live admin analytics + 14-day trend | `GET /stats/overview` |
| `insights` | AI/algorithm clustering of whispers by viewpoint + noise detection | `POST /insights/analyze` |
| `reports` | Accreditation reports + CSV export | `POST /reports/generate`, `GET /reports/:id/export` |

## 3. The shared package (`packages/shared`)

Contains:

- **`roles.ts`** — the `Role` union, `ROLE_PERMISSIONS` matrix, and the
  `can()` / `atLeast()` helpers. This is the single RBAC authority.
- **`constants.ts`** — brand tokens, module labels, HTTP statuses, pagination.
- **`types.ts`** — shared API/DTO types (`ApiResponse`, `Whisper`, `Evaluation`,
  etc.).

Because both apps import these, changing a role permission updates the API
enforcement **and** the frontend's understanding in one place.

## 4. Backend layering (`apps/api`)

Express is deliberately a thin transport layer. The pattern per feature module
(e.g. `modules/feedback/`):

```
feedback/
├── feedback.routes.ts      # URL → middleware wiring (no logic)
├── feedback.controller.ts  # request parsing, status codes, response shape
├── feedback.service.ts     # business rules + Prisma access
└── feedback.schema.ts      # Zod input validation
```

This separation means:
- Routes are readable at a glance.
- Services are pure enough to unit test without HTTP.
- Schemas guarantee the boundary between "untrusted input" and "business logic".

### Cross-cutting concerns (in `middleware/`)
- **`auth.ts`** — `authenticate()` verifies the JWT and attaches
  `req.principal`; `authorize(...permissions)` checks them against the shared
  matrix.
- **`asyncHandler.ts`** — funnels async errors to the global handler (Express 4
  doesn't catch rejected promises natively) and provides Zod validation.
- **`errorHandler.ts`** — the single place every failure becomes a consistent
  `ApiResponse`.
- **`notFound.ts`** — 404 fallback.

## 5. Data model (`prisma/schema.prisma`)

Normalised around the six RFP modules. Two models are worth calling out:

### Whisper — anonymity by structure
```prisma
model Whisper {
  id          String       @id @default(cuid())
  category    String
  content     String
  isAnonymous Boolean      @default(true)
  departmentId String?
  status      WhisperStatus @default(NEW)
  createdAt   DateTime     @default(now())
}
```
There is **no** `userId` field. Anonymous feedback cannot be de-anonymised
because the schema gives the system nowhere to store an identity. This is the
technical heart of the *Whisper Lock*.

### Evaluation — aggregate-only visibility
Individual evaluations store who evaluated whom (needed for peer review), but
the service's `aggregateByCourse` query returns only averages and
distributions. Faculty literally cannot request raw rows with identities.

## 6. The RBAC flow (request lifecycle)

1. Client sends `POST /login` → receives a signed JWT.
2. For a protected route, `authenticate` decodes the JWT → `req.principal`.
3. `authorize(PERMISSIONS.X)` checks `can(principal.role, X)` against the
   shared matrix → 403 if missing.
4. `validate(schema)` parses/type-checks the body.
5. Controller calls a service method.
6. Errors bubble to the global handler; successes return the standard envelope.

## 7. Security posture

- Passwords hashed with bcrypt (cost 12).
- JWT with expiry + issuer; stateless (no server session to leak).
- Input validated with Zod on every endpoint (prevents injection).
- Helmet sets secure HTTP headers; CORS restricted by config.
- Anonymous feedback has no PII stored at all.
- `AuditLog` records administrative actions for accountability.

## 8. Scaling plan (from proposal)

- **1 department → 12 faculties**: RBAC scales users; no schema change needed.
- **External accreditors (NUC)**: a read-only `GUEST` role already exists and
  maps to view-only permissions.
- **New features**: modular service layer lets us add modules (e.g. real-time
  chat, AI report summaries) without touching existing ones.
- **Performance**: Redis dashboard caching + Prisma connection pooling handle
  growing evaluation/whisper volume; reports run as background jobs.

## 9. What this buys the judges

- **Explainability**: every decision maps back to a requirement or a security
  invariant.
- **Testability**: services and the RBAC matrix are pure and isolated.
- **Maintainability**: shared contracts + thin transport layer.
- **Correctness**: anonymity is structurally impossible to break.
