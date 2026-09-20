# 🌿 WhisperLag

> **A mobile-first, anonymous-by-design Quality Assurance & Student Feedback Platform for the University of Lagos (UNILAG).**  
> *"A student who whispers is still speaking. A system that listens quietly still hears everything."*

---

## 🌟 Executive Summary

**WhisperLag** modernises and digitises UNILAG's quality assurance, student feedback, and academic monitoring operations into a unified, secure platform. Built specifically for the **UNILAG Quality Assurance & SERVICOM Unit**, WhisperLag bridges the communication gap between students, lecturers, faculty heads, and university administrators.

The core differentiator is the **Whisper Lock**: a cryptographic and architectural guarantee that student feedback is 100% anonymous. Anonymity is not a checkbox—it is **structurally enforced at the database level**. 

---

## 🛡️ The Whisper Lock Guarantee

Most university feedback systems offer an optional "submit anonymously" checkbox while retaining user identifiers or IP addresses in database logs. WhisperLag re-engineers this from first principles:

1. **Zero-Identity Data Schema**: The `Whisper` PostgreSQL model has **no** `userId` foreign key. There is no column in the database where student identity could ever be stored or leaked.
2. **Network-Boundary Stripping**: When an authenticated student or public user submits feedback, authentication tokens and emails are validated at the perimeter and stripped before database insertion.
3. **Reference-Based Tracking (`WL-YYYY-XXXXXX`)**: Each whisper receives a unique, unlinked tracking code. Students can check review status and institutional actions on the public tracker without creating an account or revealing their identity.
4. **Isolated File Attachments**: Supporting screenshots and documents (PDF, DOCX, Images up to 10MB) are sanitized and renamed to random UUIDs upon upload to prevent metadata or filename leakage.

---

## 🚀 Complete Feature Index

### 1. 📝 Student Voice & Whisper Wizard (`/whisper`)
- **4-Step Interactive Submission Flow**:
  1. **Feedback Type**: Choose from 6 major categories (*Lecturer*, *Course / Learning*, *Department / Service*, *Hostel / Facilities*, *Administration*, *Other*).
  2. **Details & Content**: Specify subject/course/lecturer, choose tone tags (*Constructive*, *Concern*, *Suggestion*, *Praise*, *Urgent*), select target department, and provide the message.
  3. **Privacy Reassurance**: Visual confirmation of Whisper Lock protections before submission.
  4. **Review & Submit**: Full summary breakdown with inline editing before final dispatch.
- **Supporting File Attachments**: Upload screenshots, receipts, or documents (up to 10MB) directly from desktop or mobile.
- **Soft-Gated UNILAG Verification**: Optional UNILAG email validation (`@unilag.edu.ng` / `@live.unilag.edu.ng`) to verify community membership without saving or associating the email address.
- **Offline Mode & Sync**: Automatically queues submissions in local storage if network drops and flushes to the server when back online.
- **Instant Reference Receipt (`/whisper/success`)**: Provides a printable/copyable `WL-2026-XXXXXX` reference code and "What Happens Next" 3-step lifecycle breakdown.

### 2. 🔍 Reference Tracker (`/track`)
- Public, zero-login search tool allowing students to paste their `WL-YYYY-XXXXXX` reference code.
- Real-time status badge:
  - `Received` (New submission awaiting department assignment)
  - `Under Review` (Currently under active investigation by QA / HOD)
  - `Resolved` (Action taken with official institutional resolution notes displayed)

### 3. 📢 Public Campus Feeds (`/listwhispers` & `PublicRecent`)
- **Live Community Whispers**: Browse all verified student feedback and official institutional resolutions.
- **Real-Time Filtering**: Filter by *All*, *Under Review*, or *Resolved*, with instant keyword search across content and categories.
- **Attachment Previews**: Direct, secure links to view uploaded evidence files.
- **Recent Campus Feedback Widget**: Embedded sidebar feed across the student interface showing live community impact.

### 4. 📊 Campus Pulse & Surveys (`/surveys`)
- **Interactive Quick Polls**: Fast, single-click student voting on campus issues (e.g., library hours, portal performance, lecture facilities).
- **Multi-Criteria Rubric Evaluations**: Comprehensive student course evaluations covering *Clarity*, *Fairness*, *Expertise*, *Engagement*, and *Punctuality*.
- **Departmental Pulse Surveys**: Faculty-wide survey scheduling with automated open/close dates.

### 5. 🏛️ Faculty Quality Hub (`/faculty`)
- **Real-Time Sentiment Analytics**: Overall department and faculty sentiment scores calculated from student ratings.
- **14-Day Activity Trends**: Area charts tracking whisper volume and course evaluations over time.
- **Evaluation Score Breakdown**: Visual bar charts displaying average ratings across teaching categories.
- **Member Departments Structure**: Scrollable departmental hierarchy cards displaying course counts and active whispers.
- **Faculty Course Registry**: Filterable table of all active courses, assigned lecturers, response counts, and aggregate satisfaction scores.

### 6. 🎛️ Admin Command Center (`/admin`)
- **Executive Institutional Metrics**: Key KPIs including Total Whispers, Active Courses across all faculties, Pending Interventions, and University-Wide Resolution Rate.
- **Whisper & Evaluation Volume Charts**: Comparative 14-day tracking of student voice metrics.
- **Resolution Rate Donut Chart**: Proportional breakdown of resolved vs. open feedback.
- **Faculty Course Registry & Management**: Fast search and filtering across all 9+ UNILAG faculties, with an inline modal to register new courses to any department.
- **Accreditation Export Engine**: One-click generation of comprehensive NUC accreditation dossiers aggregating sentiment across faculties.

### 7. 👥 Faculty & Dean Management (`/admin/faculties`)
- **Full CRUD Management**: View, add, edit, and delete UNILAG faculties and designated Faculty Heads / Deans.
- **Department & Course Rollup**: Live counts of member departments and courses under each faculty.
- **Automated Account Provisioning**: Adding a new faculty lead automatically provisions their faculty portal account with default credentials (`password123`).

### 8. 📚 Course Hub (`/courses`)
- Searchable directory of university courses across faculties and departments.
- Course syllabus outlines, credit units, semester breakdowns, and assigned lecturers.

### 9. 🤖 AI-Powered Whisper Routing (`feedback/analyze`)
- **Groq LLM Integration**: Uses Groq (LLaMA/Mixtral) to analyze raw student submissions and auto-tag the affected Course Code, Course Title, Lecturer, and Department.
- **Keyword Fallback Engine**: Deterministic regex matching against the course and lecturer registry when offline or without external API keys.

### 10. 🔌 SIS / LMS Bulk Integrations (`/integrations`)
- Simulated and live connectors for UNILAG Student Information Systems (SIS) and Learning Management Systems (LMS).
- One-click bulk sync for courses, departments, and lecturer assignments.

### 11. 📑 Audit Logs & Reports (`/reports`)
- Comprehensive audit trail of all administrative actions and status updates.
- Exportable structured reports in JSON and printable formats.

### 12. 💬 Internal Collaboration (`/collaboration`)
- Secure internal message channels between faculty members, HODs, and university administrators for coordinating whisper resolutions.

---

## 🏗️ Architecture & Tech Stack

```
WhisperLag/
├── apps/
│   ├── api/                    # Express REST API (Modular Architecture)
│   │   ├── prisma/             # PostgreSQL schema & seed scripts
│   │   ├── src/
│   │   │   ├── modules/        # Domain modules (auth, feedback, courses, stats, etc.)
│   │   │   ├── middleware/     # Auth, RBAC, Rate Limiting, Async Handlers
│   │   │   └── uploads/        # Sanitized file attachment storage
│   └── web/                    # Next.js 14 App Router (Mobile-First UI)
│       ├── src/
│       │   ├── app/            # Next.js routes (whisper, faculty, admin, track, etc.)
│       │   ├── components/     # UI components, layouts, wizards, charts
│       │   └── lib/            # API client, offline sync outbox, toast notifications
├── packages/
│   └── shared/                 # Monorepo shared types, RBAC permissions, constants
```

### Technology Matrix

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [Next.js 14](https://nextjs.org/) (React, App Router, TypeScript) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), Montserrat & Inter Typography |
| **Data Visualization** | [Recharts](https://recharts.org/) (Responsive Area, Bar, Pie charts) |
| **Backend Framework** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) (Modular ES Modules) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) (Neon Serverless) + [Prisma ORM](https://www.prisma.io/) |
| **File Upload Handling** | [Busboy](https://github.com/mscdex/busboy) multipart streaming parser |
| **Authentication & RBAC** | JWT (JSON Web Tokens) + Declarative permission matrix in `@whisperlag/shared` |
| **AI Insights & Routing** | [Groq API](https://groq.com/) with deterministic keyword fallback |
| **Offline Resilience** | Browser LocalStorage / IndexedDB sync outbox |

---

## 🔐 Role-Based Access Control (RBAC)

WhisperLag implements a strict, declarative permission matrix:

| Permission | Guest / Anon | Student | Faculty | Admin |
|---|:---:|:---:|:---:|:---:|
| **Submit Anonymous Whisper** | ✅ | ✅ | ✅ | ✅ |
| **Track Whisper via Reference (`/track`)** | ✅ | ✅ | ✅ | ✅ |
| **View Public Feed (`/listwhispers`)** | ✅ | ✅ | ✅ | ✅ |
| **Vote on Campus Polls** | ✅ | ✅ | ✅ | ✅ |
| **Submit Course Evaluations** | ❌ | ✅ | ❌ | ❌ |
| **Access Faculty Portal (`/faculty`)** | ❌ | ❌ | ✅ | ✅ |
| **View Department Sentiment & Courses** | ❌ | ❌ | ✅ | ✅ |
| **Internal Collaboration Messaging** | ❌ | ❌ | ✅ | ✅ |
| **Resolve Whispers & Post Actions** | ❌ | ❌ | ❌ | ✅ |
| **Manage Faculties & Deans (`/admin/faculties`)** | ❌ | ❌ | ❌ | ✅ |
| **Add / Edit Courses** | ❌ | ❌ | ❌ | ✅ |
| **Generate Accreditation Reports** | ❌ | ❌ | ❌ | ✅ |

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: `v18.17.0` or later
- **npm**: `v9.0.0` or later
- **PostgreSQL Database**: Local PostgreSQL instance or a free cloud database like [Neon](https://neon.tech)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Michvista/WhisperLag.git
cd WhisperLag
npm install
```

### 2. Configure Environment Variables
Create `.env` in `apps/api/`:
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@ep-shy-surf.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
GROQ_API_KEY="" # Optional: enables AI routing
GROQ_MODEL="llama-3.1-70b-versatile"
```

Create `.env.local` in `apps/web/`:
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### 3. Sync Database Schema & Seed Data
```bash
# Push schema to database
npm run db:migrate -w @whisperlag/api

# Seed test departments, courses, rubrics, and realistic student whispers
npm run db:seed -w @whisperlag/api
```

### 4. Run Development Servers
```bash
npm run dev
```
- **Web Application**: `http://localhost:3001` (or `http://localhost:3000`)
- **API Server**: `http://localhost:4000`

---

## 🔑 Demo & Test Credentials

| Role | Email | Password | Default Landing |
|---|---|---|---|
| **Admin** | `admin@whisperlag.test` | `password123` | `/admin` (Command Center) |
| **Faculty Lead** | `faculty@whisperlag.test` | `password123` | `/faculty` (Faculty Hub) |
| **Student** | `student@whisperlag.test` | `password123` | `/dashboard` (Student Portal) |
| **Public / Guest** | *No login needed* | *N/A* | `/whisper` (Feedback Wizard) |

---

## 📡 Key API Endpoints (v1)

### Feedback & Whispers
- `POST /api/v1/feedback/public` — Submit feedback anonymously (supports `multipart/form-data` with attachments).
- `GET /api/v1/feedback/public-recent` — Public stream of recent whispers and resolutions.
- `GET /api/v1/feedback/lookup/:ref` — Query status and resolution notes by `refNumber`.
- `GET /api/v1/feedback` — Admin paginated whisper feed with moderation controls.
- `PATCH /api/v1/feedback/:id/status` — Update status (`NEW` → `ACKNOWLEDGED` → `ACTIONED`) with public resolution note.
- `POST /api/v1/feedback/analyze` — AI automatic routing of untagged whispers to courses and lecturers.

### Academic Registry & Analytics
- `GET /api/v1/courses` — Course registry with faculty and department filtering.
- `POST /api/v1/courses` — Register a new course under any faculty.
- `GET /api/v1/departments` — Department directory and course counts.
- `POST /api/v1/departments` — Create or update departments and faculties.
- `GET /api/v1/evaluations/summary` — Aggregate sentiment statistics and rubric scores.
- `GET /api/v1/stats/overview` — Institutional QA performance metrics.

### Surveys & Collaboration
- `GET /api/v1/surveys` — Active surveys and pulse polls.
- `POST /api/v1/surveys/questions/:questionId/respond` — Anonymous poll vote submission.
- `GET /api/v1/messages` & `POST /api/v1/messages` — Secure internal staff messaging.
- `POST /api/v1/reports/generate` — Generate institutional accreditation reports.

---

## 👥 The Team

Created with passion for the **University of Lagos Student Innovation Award 2026**:

- **Koyinsola Samuel** — *UI/UX Lead* (Nursing Science)
- **Olumide Michelle** — *Full-Stack Developer* (Nursing Science)
- **Chime Jael** — *Researcher & Quality Assurance* (Nursing Science)

---

*University of Lagos · Quality Assurance & SERVICOM Unit · Student Innovation Award 2026*
