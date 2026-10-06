# 🌿 WhisperLag

> **A mobile-first, anonymous-by-design Quality Assurance & Student Feedback Platform for the University of Lagos (UNILAG).**  
> *"A student who whispers is still speaking. A system that listens quietly still hears everything."*

---

## 🌟 Executive Summary

**WhisperLag** modernizes and digitizes UNILAG's quality assurance, student feedback, and academic monitoring operations into a unified, secure platform. Built specifically for the **UNILAG Quality Assurance & SERVICOM Unit**, WhisperLag bridges the communication gap between students, lecturers, faculty heads, and university administrators.

The core differentiator is the **Whisper Lock**: a structural and architectural guarantee that student feedback is 100% anonymous. Anonymity is not an optional checkbox—it is **enforced at the database and network level**. Students never need an account, password, or matriculation number to speak freely.

---

## 🛡️ The Whisper Lock Guarantee

Most university feedback systems offer an optional "submit anonymously" checkbox while still recording student accounts, matric numbers, or IP addresses in database logs. WhisperLag re-engineers this from first principles:

1. **Zero-Identity Database Schema**: The `Whisper` database model has **no** `userId` column or relationship. There is no column in the database where a student's identity could ever be stored or leaked.
2. **No Accounts or Passwords for Students**: Students never register, log in, or provide personal credentials to submit feedback, evaluate courses, or vote in polls.
3. **Reference-Based Tracking (`WL-YYYY-XXXXXX`)**: Each submission receives a unique, unlinked tracking code. Students can check review status and official resolution actions on the public tracker without revealing who they are.
4. **Cloudinary Cloud Storage for Evidence**: Supporting screenshots, photos, and documents (PDF, DOCX, Images up to 10MB) are securely uploaded to **Cloudinary**, stripped of device metadata (EXIF/GPS) and renamed to random UUIDs to prevent file leakage.

---

## 🚀 Complete Feature Index

### 1. 📝 Anonymous Student Voice (`/whisper`)
- **4-Step Interactive Submission Flow**:
  1. **Category**: Choose from 6 major areas (*Lecturer*, *Course / Learning*, *Department / Service*, *Hostel / Facilities*, *Administration*, *Other*).
  2. **Details & Content**: Specify subject/course/lecturer, choose tone tags (*Constructive*, *Concern*, *Suggestion*, *Praise*, *Urgent*), select target department, and provide the message.
  3. **Privacy Reassurance**: Visual breakdown of Whisper Lock protections before final submission.
  4. **Review & Submit**: Full summary breakdown with inline editing before final dispatch.
- **Evidence Upload**: Upload screenshots, receipts, or documents (up to 10MB) directly to Cloudinary.
- **Offline Mode & Sync**: Automatically queues submissions in browser storage if network drops and flushes to the server when back online.
- **Instant Reference Receipt (`/whisper/success`)**: Generates a copyable `WL-2026-XXXXXX` reference code with a 3-step investigation lifecycle guide.

### 2. 🔍 Public Reference Tracker (`/track`)
- Zero-login search tool allowing students to paste their `WL-YYYY-XXXXXX` reference code.
- Real-time status badges:
  - `Submitted` (New submission awaiting department review)
  - `Under Review` (Currently under active investigation by QA / HOD)
  - `Resolved` (Action taken with official institutional resolution notes displayed)

### 3. 📢 Public Campus Whispers Feed (`/listwhispers`)
- **Live Community Whispers**: Browse verified student feedback and official institutional resolutions.
- **Filter by Status**: Filter by *All*, *Under Review*, or *Resolved*, with instant keyword search.
- **Confidentiality Guard**: Sensitive individual lecturer complaints are automatically kept confidential for verified QA/Faculty review.

### 4. 💡 Targeted Suggestion Box (`/suggestion`)
- Share constructive improvement ideas with campus administrators.
- **Target Scope Selector**: Route suggestions either to **General Campus (All UNILAG)** or directly to a **Specific Faculty / Department**.

### 5. 🎓 Dedicated Evaluations Hub (`/evaluations`)
- **Lecturer Evaluation (`/evaluations/lecturer`)**: 5-dimension teaching quality assessment:
  1. *Lecture Clarity & Teaching Style*
  2. *Punctuality & Lecture Consistency*
  3. *Student Engagement & Classroom Climate*
  4. *Assessment Fairness & Grading*
  5. *Accessibility & Academic Support*
- **Course Evaluation (`/evaluations/course`)**: Comprehensive curriculum evaluation covering syllabus depth, learning resources, workload pacing, and lab/practical alignment.

### 6. 📊 Campus Pulse & Surveys (`/polls` & `/results`)
- **Interactive Quick Polls**: Fast student voting on campus issues (library hours, portal speed, lecture hall facilities).
- **Live Visual Results**: Instant pie and bar chart visualizations of student opinions.

### 7. 🧹 Real-Time AI Noise Filtering & Auto-Routing (`/whispers`)
- **Groq LLM Integration**: Uses Groq AI (`llama-3.1-70b-versatile` / `openai/gpt-oss-120b`) to scan student messages and auto-assign them to matching courses, lecturers, and departments.
- **Real-Time Noise Filter Pill**: Automatically identifies low-substance, spam, or single-word submissions and isolates them into the **`⚠️ Low Substance (Noise)`** filter pill so QA staff can focus on actionable issues.

### 8. 📑 Institutional Reports & AI Synthesis (`/reports`)
- **Instant NUC Accreditation Dossiers**: Generate comprehensive compliance audit summaries in under 2 minutes.
- **Report Types**:
  - 📋 **Accreditation Summary** (Full institution QA evaluation & compliance overview)
  - 🏛️ **Department Snapshot** (Targeted deep-dive for a specific faculty or department)
  - 📈 **14-Day Trend Report** (Temporal sentiment shifts, resolution velocity, and volume surges)
- **Groq AI Synthesis**: Automatically drafts executive findings, key strengths, priority areas for improvement, and recommended interventions.
- **Export & Print**: Interactive report viewer with one-click Print to PDF and Export to CSV.

### 9. 🔌 SIS & LMS JSON Integrations (`/integrations`)
- Connects official course catalogs from the UNILAG Student Portal (SIS) and Moodle (LMS).
- **JSON File Upload & Paste**: Upload `.json` catalog files directly or select from preset faculty templates (*Nursing*, *Engineering*, *Management Sciences*).
- **Auto-Department Creation**: Automatically creates and maps new departments mentioned in imported rosters.
- **Export Catalog**: Download the active course registry as a formatted JSON document.

### 10. 📧 Real-Time Email Notifications & Collaboration (`/collaboration`)
- **Brevo REST API Engine**: High-reliability email delivery via **Brevo** (formerly Sendinblue) HTTP API over port 443 (bypassing cloud host SMTP port restrictions).
- **Incoming Whisper Alerts**: Automatically dispatches alerts to QA Administrators, Deans, and configured institutional emails whenever new student feedback or urgent facility reports arrive.
- **Internal Collaboration Alerts**: Instantly notifies faculty staff and department heads when collaborative notes are posted in the QA Hub.

---

## 🔐 Role-Based Access Control (RBAC)

WhisperLag operates on a clear, three-tier access model designed for maximum privacy and operational efficiency:

| Capability & Action | Anonymous Students / Public | Faculty Lead / HOD | QA Administrator |
|---|:---:|:---:|:---:|
| **Submit Feedback & Whispers (`/whisper`)** | ✅ | ✅ | ✅ |
| **Track Submission Status (`/track`)** | ✅ | ✅ | ✅ |
| **Browse Public Whispers & Resolutions (`/listwhispers`)** | ✅ | ✅ | ✅ |
| **Vote in Campus Pulse Polls (`/polls`)** | ✅ | ✅ | ✅ |
| **Submit Lecturer & Course Evaluations (`/evaluations`)** | ✅ | ✅ | ✅ |
| **Submit Targeted Suggestions (`/suggestion`)** | ✅ | ✅ | ✅ |
| **Access Faculty Analytics Hub (`/faculty`)** | ❌ | ✅ | ✅ |
| **View Department Sentiment & Course Scores** | ❌ | ✅ | ✅ |
| **Internal Staff Collaboration (`/collaboration`)** | ❌ | ✅ | ✅ |
| **Moderate Whispers & Publish Action Notes** | ❌ | ❌ | ✅ |
| **Manage UNILAG Faculties & Deans (`/admin/faculties`)** | ❌ | ❌ | ✅ |
| **Import & Sync SIS / LMS Data (`/integrations`)** | ❌ | ❌ | ✅ |
| **Generate & Export Accreditation Reports (`/reports`)** | ❌ | ❌ | ✅ |

> **Note for Students:** Students are 100% anonymous and never need to log in or create an account. Login credentials are strictly reserved for verified university staff and administrators.

---

## 🔑 Verified Staff & Admin Credentials

| Role | Email | Password | Access Portal |
|---|---|---|---|
| **QA Administrator (Demo)** | `admin@whisperlag.test` | `password123` | `/admin` (Command Center) |
| **Faculty Lead / Dean** | `faculty@whisperlag.test` | `password123` | `/faculty` (Faculty Hub) |

---

## 📱 Progressive Web App (PWA) & Offline-First Protocol

WhisperLag is engineered as an **Offline-First Progressive Web App (PWA)** to ensure seamless accessibility across UNILAG campus network environments:

- **Service Worker (`public/sw.js`)**: Caches static assets, stylesheets, icons, and shell layouts with a stale-while-revalidate strategy for instant load times.
- **Offline Outbox (`apps/web/src/lib/offline.ts`)**: When a student submits a whisper or survey while disconnected, feedback is cryptographically preserved in a local encrypted client queue.
- **Auto-Sync on Reconnect**: Automatically detects online status restoration and flushes queued submissions in the background without user intervention.
- **Mobile-First App Experience**: Fully installable on iOS and Android devices (Add to Home Screen) with standalone display mode and native-feeling gesture navigation.

---

## 🛡️ Governance, Audit Logging & Fallback Matchers

### 1. Administrative Audit Logging (`AuditLog`)
To maintain institutional accountability and prevent moderation abuse, WhisperLag maintains immutable audit logs in PostgreSQL (`model AuditLog`):
- `actorId` & `actorRole`: Staff member who performed the action.
- `action`: Specific operation (e.g. `STATUS_UPDATE`, `BULK_SIS_IMPORT`, `REPORT_GENERATION`).
- `target`: Modified entity ID or whisper reference number.
- `meta`: Structured JSON diff of changes made.
- `createdAt`: Immutable ISO timestamp.

### 2. High-Availability Fallback Matchers
WhisperLag incorporates resilient deterministic fallback layers if external AI services are unavailable:
- **Rule-Based Course Matcher (`matchCourse`)**: A deterministic regex engine in `feedback.service.ts` that parses course codes (e.g., `CSC 201`, `NSC 211`, `MEG 301`), lecturer names, and department acronyms directly from student submissions.
- **Heuristic NLP Clustering (`fallbackInsights`)**: Extracts high-frequency keywords, categorizes sentiment, and filters noise algorithmically when Groq API keys are not provided.
- **Local Media Storage Fallback**: Gracefully persists attachments to local disk storage if cloud storage credentials are not supplied.

---

## 📊 Key Accreditation Indicators & Quality Benchmarks

| Metric / KPI | Benchmark Target | Description |
|---|---|---|
| **Course Delivery Quality** | $\ge 3.5 / 5.0$ ($70\%+$) | Minimum average score across teaching clarity, punctuality, engagement, and fairness. |
| **Resolution / Compliance Rate** | $\ge 75\%$ | Percentage of student grievances resolved with verified institutional action notes. |
| **Resolution Turnaround Time** | $\le 7 - 14$ days | Average time from submission to review and final resolution. |
| **Department Sentiment Index** | $\ge 65\%$ Positive | Aggregate student satisfaction score computed from rubric evaluations and feedback. |
| **Noise-to-Substance Ratio** | $\le 10\%$ | Low-substance submissions filtered by Groq AI to preserve QA focus. |

---

## 🏗️ Architecture & Tech Stack

```
WhisperLag/
├── apps/
│   ├── api/                    # Express REST API (Modular Architecture)
│   │   ├── prisma/             # PostgreSQL schema & seed scripts
│   │   ├── src/
│   │   │   ├── modules/        # Domain modules (auth, feedback, courses, reports, etc.)
│   │   │   ├── lib/            # TLS SMTP mailer, Prisma client
│   │   │   └── middleware/     # Auth, RBAC, Rate Limiting, Async Handlers
│   └── web/                    # Next.js 14 App Router (Mobile-First UI)
│       ├── src/
│       │   ├── app/            # Next.js routes (whisper, faculty, admin, track, reports, etc.)
│       │   ├── components/     # UI components, wizards, charts, error boundaries
│       │   └── lib/            # Typed API client, offline outbox, toast notifications
├── packages/
│   └── shared/                 # Monorepo shared types, RBAC permissions, constants
```

### 🛠️ Technologies Used

- **Frontend (`apps/web`)**: Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS 3, Recharts, Hugeicons, Service Worker (PWA).
- **Backend API (`apps/api`)**: Node.js 18+, Express (ES Modules), Prisma ORM v5.19, Zod, Bcryptjs, JWT, Helmet.
- **Cloud Media Storage**: [Cloudinary](https://cloudinary.com/) (Secure evidence attachments with EXIF metadata stripping).
- **Artificial Intelligence**: [Groq Cloud](https://groq.com/) (`llama-3.1-70b-versatile` / `openai/gpt-oss-120b`) for automated intent analysis, routing, noise filtering, and report synthesis.
- **Database**: PostgreSQL (Hosted on [Neon Serverless](https://neon.tech/)).
- **Email Notifications**: [Brevo](https://www.brevo.com/) REST API (with Resend and STARTTLS/SMTPS fallbacks).

---

## ⚡ Quick Start Guide

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

# Groq AI (for automated routing, noise filtering, and report synthesis)
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="llama-3.1-70b-versatile"

# Cloudinary Storage Configuration
CLOUDINARY_URL="cloudinary://<api_key>:<api_secret>@<cloud_name>"

# Email Notifications (Brevo REST API - Recommended)
BREVO_API_KEY="xkeysib-your_brevo_api_key"
BREVO_SENDER_EMAIL="your-verified-email@gmail.com"
BREVO_SENDER_NAME="WhisperLag UNILAG"
ADMIN_NOTIFICATION_EMAILS="olumidenifemi07@gmail.com"
```

Create `.env.local` in `apps/web/`:
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### 3. Sync Database Schema & Seed Data
```bash
# Push schema to database
npm run db:migrate -w @whisperlag/api

# Seed departments, courses, rubrics, and realistic student whispers
npm run db:seed -w @whisperlag/api
```

### 4. Run Development Servers
```bash
npm run dev
```
- **Web Application**: `http://localhost:3001` (or `http://localhost:3000`)
- **API Server**: `http://localhost:4000`

---

## 👥 The Team

Created with passion for the **University of Lagos Student Innovation Award 2026**:

- **Koyinsola Samuel** — *UI/UX Lead* (Nursing Science)
- **Olumide Michelle** — *Full-Stack Developer* (Nursing Science)
- **Chime Jael** — *Researcher & Quality Assurance* (Nursing Science)

---

*University of Lagos · Quality Assurance & SERVICOM Unit · Student Innovation Award 2026*
