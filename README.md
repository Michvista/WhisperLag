# WhisperLag

> **A mobile-first, anonymous-by-design Quality Assurance System for the University of Lagos.**
> *"A student who whispers is still speaking. A system that listens quietly still hears everything."*

WhisperLag digitises UNILAG's quality assurance processes — monitoring,
evaluation, feedback, performance measurement, and accreditation support —
into a single, role-based platform. Its defining idea is the **Whisper Lock**:
a permanent, visual guarantee of anonymity on every student screen, enforced
at the **database level** so a whisper truly stays a whisper.

Submission for the **UNILAG Quality Assurance & SERVICOM Unit — Student
Innovation Award 2026**.

---

## Why the architecture matters (for judges)

WhisperLag is a **monorepo** with a clear, layered architecture. We chose this
so the codebase reads cleanly, scales, and — most importantly — is easy to
explain and defend.

```
WhisperLag/
├── apps/
│   ├── api/                    # Express REST API (modular services)
│   └── web/                    # Next.js frontend (App Router)
├── packages/
│   └── shared/                 # Shared domain types, roles, constants
├── prisma/                     # Data models (single source of truth)
├── docker-compose.yml          # PostgreSQL + Redis for local dev
└── docs/
    ├── ARCHITECTURE.md         # Deep-dive for reviewers
    └── STITCH-PROMPT.md        # Design brief for Stitch AI
```

### The three layers

| Layer | Package | Responsibility |
|-------|---------|----------------|
| Presentation | `apps/web` | Role-specific UI, built mobile-first (375px). |
| API / Business | `apps/api` | Express routes → controllers → services → Prisma. |
| Data | `prisma` | PostgreSQL models; anonymity enforced structurally. |

### Architecture decisions worth pointing out

1. **Single source of truth** — `@whisperlag/shared` holds roles, the RBAC
   permission matrix, module labels, and brand tokens. Both apps import it, so
   a permission change propagates everywhere and the frontend can't drift from
   the backend contract.
2. **RBAC is declarative** — the role→permission matrix in
   `packages/shared/src/roles.ts` is the one authority the `authorize()`
   middleware consults. Adding a capability is a one-line change.
3. **Anonymity by structure, not discipline** — the `Whisper` Prisma model has
   **no** `userId` column. An anonymous whisper cannot leak an identity because
   there is nowhere to store one.
4. **Express is a thin layer** — routes only parse/validate; services hold all
   business logic. This keeps handlers tiny and unit-testable.
5. **Consistent envelopes** — every API response uses the shared
   `ApiResponse<T>` shape, and errors pass through one global handler.

---

## Tech stack

| Concern | Choice |
|---------|--------|
| Frontend | Next.js (React) + Tailwind CSS |
| Mobile | Progressive Web App (PWA-ready) |
| Backend | Node.js + Express (modular) |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT + RBAC (UNILAG SSO-ready) |
| Caching / Queue | Redis |
| Validation | Zod |
| Deployment | Docker + Railway (or on-prem) |
| Data Visualization | Recharts | Interactive charts for performance dashboards |
| AI Insights | Groq (LLM) + rule fallback | Groups whispers by viewpoint; flags noise |
| Collaboration | Internal messaging | Secure channel for faculty & admins |
| SIS/LMS | Import adapter + REST connector | Syncs course data (manual or live) |
| PWA | Manifest + service worker | Installable on phones; offline shell |
| Testing | Vitest | RBAC + service unit tests |
| CI | GitHub Actions | typecheck → test → build on every push |

---

## Quick start

### Prerequisites
- Node.js ≥ 18
- Docker (for PostgreSQL/Redis) — or point `DATABASE_URL` at an existing Postgres

### 1. Install dependencies
```bash
npm install
```

### 2. Start the database
```bash
npm run db:up          # docker compose up -d
```

### 3. Configure the API
```bash
cp apps/api/.env.example apps/api/.env
# edit DATABASE_URL etc. if needed
```

### 4. Generate the Prisma client and run migrations + seed
```bash
npm run prisma:generate -w @whisperlag/api
npm run db:migrate -w @whisperlag/api     # prisma migrate dev
npm run db:seed -w @whisperlag/api
```

### 5. Run everything
```bash
npm run dev            # api on :4000, web on :3000
```

### Seed logins
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@whisperlag.test` | `password123` |
| Faculty | `faculty@whisperlag.test` | `password123` |
| Student | `student@whisperlag.test` | `password123` |

---

## Deploying

Frontend on **Vercel** (free), API on **Render** (free tier), database stays
on **Neon** (free). There is also a `render.yaml` Blueprint in the repo root
for one-click Render setup.

### 1. API → Render (free)
- **Blueprint (easiest):** Render → *New → Blueprint* → select this repo.
  The `render.yaml` builds from the repo root so npm workspaces resolve
  `@whisperlag/shared` correctly.
- **Manual:** Render → *New → Web Service* → select repo → Root directory
  (leave empty) → Build command:
  `npm ci && npm run build -w @whisperlag/shared && npm run prisma:generate -w @whisperlag/api && npm run build -w @whisperlag/api`
  → Start command: `node apps/api/dist/index.js` → Free plan.
- Set env vars in the dashboard:
  | Key | Value |
  |-----|-------|
  | `DATABASE_URL` | your Neon string |
  | `JWT_SECRET` | a long random string |
  | `CORS_ORIGIN` | `https://<your-vercel-app>.vercel.app` |
  | `GROQ_API_KEY` | optional — enables AI insights |
  | `GROQ_MODEL` | `openai/gpt-oss-120b` |
- Note: the free tier **sleeps after ~15 min idle** and wakes on the next
  request (first hit may take ~30 s). Upgrade to the $7/mo instance for
  always-awake if you want it hot during judging.

### 2. Web → Vercel (free)
- Import this repo → Root directory `apps/web` → Framework *Next.js*
  (build `next build`).
- Env var: `NEXT_PUBLIC_API_URL=https://<your-render-api>.onrender.com/api/v1`.

### 3. Optional: same-origin API (enables offline PWA caching)
Add a `vercel.json` in `apps/web` that rewrites `/api/*` to the Render URL,
and set `NEXT_PUBLIC_API_URL=/api/v1`. Then the service worker can cache
dashboard responses for offline use.

---

## API surface (v1)

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| GET | `/api/v1/auth/me` | Authenticated |
| POST | `/api/v1/feedback` | Student+ |
| GET | `/api/v1/feedback` | Admin |
| GET | `/api/v1/feedback/recent` | Authenticated |
| PATCH | `/api/v1/feedback/:id/status` | Admin |
| POST | `/api/v1/evaluations` | Student+ |
| GET | `/api/v1/evaluations/aggregate/:courseId` | Faculty+ |
| GET | `/api/v1/evaluations/summary` | Faculty+ |
| GET | `/api/v1/surveys` | Authenticated |
| POST | `/api/v1/surveys` | Admin |
| POST | `/api/v1/surveys/questions/:questionId/respond` | Student+ |
| GET | `/api/v1/departments` | Authenticated |
| POST | `/api/v1/departments` | Admin |
| GET | `/api/v1/departments/:id/snapshot` | Authenticated |
| GET | `/api/v1/courses` | Authenticated |
| GET | `/api/v1/stats/overview` | Admin |
| POST | `/api/v1/insights/analyze` | Admin |
| GET | `/api/v1/messages` | Faculty+ |
| POST | `/api/v1/messages` | Faculty+ |
| GET | `/api/v1/integrations/sis/status` | Admin |
| POST | `/api/v1/integrations/sis/import` | Admin |
| GET | `/api/v1/reports` | Faculty+ |
| GET | `/api/v1/reports/:id` | Faculty+ |
| GET | `/api/v1/reports/:id/export` | Faculty+ |
| POST | `/api/v1/reports/generate` | Admin |

---

## The "Whisper Lock" — our differentiator

Most QA systems offer an *optional* anonymous checkbox. WhisperLag makes
anonymity the **default and the guarantee**:

- Every student screen carries a persistent indicator: *"Your whisper is
  hidden. Nobody knows it is you."*
- The `Whisper` model stores **no** submitting user — anonymity is enforced by
  the database schema itself.
- Faculty see **aggregates only** (averages, distributions) — never individual
  names — enforced at the query layer.

---

## Team

- **Koyinsola Samuel** — UI/UX Lead (Nursing Science)
- **Olumide Michelle** — FullStack Developer (Nursing Science)
- **Chime Jael** — Researcher / QA (Nursing Science)

Contact: Koyinsola.samuel3@gmail.com

*University of Lagos · Student Innovation Award 2026*
