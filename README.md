# VidyaTrack

Mobile-first school management POC for Indian schools and coaching institutes. Institutes register, get approved by a platform admin, then run attendance, fees, tests, and parent follow-ups from a phone-friendly dashboard.

**Marketing name:** VidyaTrack  
**Repo root:** `school/` (git root)

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, CSS variables + inline styles |
| Backend | FastAPI, SQLAlchemy 2 (async), Pydantic |
| Database | PostgreSQL (`asyncpg`) |
| Auth | JWT (Bearer), bcrypt passwords |
| Email | Gmail SMTP (forgot-password OTP) |
| Parent comms | WhatsApp reminders + AI voice agent (parent automation layer) |

---

## Architecture

> **VidyaTrack** — multi-tenant school ERP with JWT auth, async FastAPI + PostgreSQL, and a **parent communication layer** combining **WhatsApp reminders** and an **AI voice agent** for fee follow-ups. Mobile-first Next.js dashboard for attendance, installment-based fees, tests, and platform admin onboarding.

### 1. System context (C4 — Level 1)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#EEF2FF', 'lineColor': '#6366F1', 'fontSize': '14px'}}}%%
flowchart TB
    subgraph People["👥 Actors"]
        SA(["🏫 School Admin"])
        PA(["👨‍👩‍👧 Parent"])
        PL(["🛡️ Platform Admin"])
    end

    subgraph Platform["VidyaTrack Platform"]
        VT["VidyaTrack<br/><i>AI-assisted school ERP</i>"]
    end

    subgraph External["🌐 External Systems"]
        WA["💬 WhatsApp"]
        AI["🤖 AI Voice Agent<br/><i>Telephony + LLM</i>"]
        EM["📧 Gmail SMTP"]
        PG["🐘 PostgreSQL"]
    end

    SA -->|"Manage attendance, fees, tests"| VT
    PL -->|"Approve institutes"| VT
    VT -->|"Fee / absence / result alerts"| WA
    WA <-->|"Parent chat"| PA
    VT -->|"Overdue fee voice follow-up"| AI
    AI <-->|"Automated call"| PA
    VT -->|"Password OTP"| EM
    VT -->|"Persist data"| PG

    classDef actor fill:#F59E0B,stroke:#B45309,color:#fff,stroke-width:2px
    classDef core fill:#4F46E5,stroke:#312E81,color:#fff,stroke-width:2px
    classDef ext fill:#10B981,stroke:#047857,color:#fff,stroke-width:2px

    class SA,PA,PL actor
    class VT core
    class WA,AI,EM,PG ext
```

### 2. Container architecture (C4 — Level 2)

```mermaid
%%{init: {'theme': 'base'}}%%
flowchart LR
    subgraph Client["📱 Client Layer"]
        WEB["Next.js 16 App<br/>React 19 · Mobile-first UI"]
        LP["Marketing Site"]
        DASH["Institute Dashboard"]
        ADM["Admin Console"]
    end

    subgraph API["⚡ Application Layer"]
        GW["FastAPI Gateway<br/>/api/v1 · JWT · CORS"]
        AUTH["Auth Service"]
        CORE["Domain Services<br/>Students · Fees · Attendance · Tests"]
        COMM["Parent Comms Orchestrator"]
    end

    subgraph AIStack["🤖 AI & Messaging Layer"]
        WAB["WhatsApp Bridge<br/>wa.me · templated messages"]
        VAI["AI Voice Agent<br/>Call trigger · script · status"]
    end

    subgraph Data["💾 Data Layer"]
        DB[("PostgreSQL")]
        CACHE[("Session / JWT")]
    end

    WEB --> GW
    LP --> WEB
    DASH --> WEB
    ADM --> WEB

    GW --> AUTH
    GW --> CORE
    GW --> COMM

    CORE --> DB
    AUTH --> DB
    COMM --> WAB
    COMM --> VAI
    WAB -.->|"Opens chat"| WAExt["WhatsApp App"]
    VAI -.->|"Outbound call"| TelExt["Telephony Provider"]

    classDef client fill:#6366F1,stroke:#4338CA,color:#fff
    classDef api fill:#0EA5E9,stroke:#0369A1,color:#fff
    classDef ai fill:#8B5CF6,stroke:#6D28D9,color:#fff
    classDef data fill:#14B8A6,stroke:#0F766E,color:#fff
    classDef ext fill:#22C55E,stroke:#15803D,color:#fff

    class WEB,LP,DASH,ADM client
    class GW,AUTH,CORE,COMM api
    class WAB,VAI ai
    class DB,CACHE data
    class WAExt,TelExt ext
```

### 3. Parent communication flow (WhatsApp + AI agent)

```mermaid
%%{init: {'theme': 'base'}}%%
sequenceDiagram
    autonumber
    box rgb(238, 242, 255) Institute App
        participant Admin as 🏫 School Admin
        participant API as FastAPI Services
        participant Rules as 📋 Comms Rules Engine
    end
    box rgb(237, 233, 254) AI & Messaging
        participant WA as 💬 WhatsApp Bridge
        participant AI as 🤖 AI Voice Agent
    end
    participant Parent as 👨‍👩‍👧 Parent

    Admin->>API: Mark fee overdue / absent / publish score
    API->>Rules: Evaluate trigger (defaulter, streak, test)

    alt WhatsApp reminder
        Rules->>WA: Build message + parent phone
        WA->>Parent: wa.me deep link / message
        Parent-->>WA: Reads & replies in WhatsApp
    else AI voice follow-up
        Rules->>AI: Queue call (fee overdue, local language)
        AI->>Parent: Outbound voice call + script
        Parent-->>AI: Confirms payment date
        AI->>API: Callback status (answered / promised pay)
    end

    API->>Admin: Dashboard updated (sent / call done)
```

### 4. Backend layered architecture

```mermaid
%%{init: {'theme': 'base'}}%%
flowchart TB
    subgraph Presentation["🖥️ Presentation"]
        R1["REST Routers<br/>auth · students · fees · attendance · tests · admin"]
    end

    subgraph Application["🧠 Application Services"]
        S1["AuthService"]
        S2["FeeService · Installments"]
        S3["AttendanceService · Streaks"]
        S4["TestService · Scores"]
        S5["PasswordResetService + EmailService"]
        S6["CommsOrchestrator<br/><b>WhatsApp + AI Voice</b>"]
    end

    subgraph Domain["📦 Domain Models"]
        M1["Institute · User · Student"]
        M2["FeePlan · Installment"]
        M3["Attendance · Holiday"]
        M4["Test · TestScore"]
    end

    subgraph Infrastructure["🔧 Infrastructure"]
        REPO["Repositories"]
        DB[("PostgreSQL asyncpg")]
        SMTP["Gmail SMTP"]
        EXT["WhatsApp · Telephony · LLM APIs"]
    end

    R1 --> S1 & S2 & S3 & S4 & S5 & S6
    S1 & S2 & S3 & S4 & S5 --> REPO
    S6 --> EXT
    S5 --> SMTP
    REPO --> DB
    S2 & S3 & S4 --> M1 & M2 & M3 & M4

    classDef pres fill:#3B82F6,stroke:#1D4ED8,color:#fff
    classDef app fill:#8B5CF6,stroke:#5B21B6,color:#fff
    classDef dom fill:#F97316,stroke:#C2410C,color:#fff
    classDef infra fill:#10B981,stroke:#047857,color:#fff

    class R1 pres
    class S1,S2,S3,S4,S5,S6 app
    class M1,M2,M3,M4 dom
    class REPO,DB,SMTP,EXT infra
```

### 5. Multi-tenant & roles

```mermaid
%%{init: {'theme': 'base'}}%%
flowchart LR
    subgraph Roles
        PLA["Platform Admin"]
        IO["Institute Owner"]
        TC["Teacher"]
    end

    subgraph Tenant["Per Institute"]
        INST["Institute"]
        CLS["Classes · Subjects"]
        STU["Students + parent phone"]
        FP["Fee plans · Installments"]
        ATT["Attendance"]
        TST["Tests · Scores"]
    end

    subgraph Automation["Parent automation"]
        W1["💬 WhatsApp alerts"]
        V1["🤖 AI fee follow-up calls"]
    end

    PLA -->|"approve / suspend"| INST
    IO --> INST
    TC --> CLS & ATT & TST
    IO --> STU & FP
    FP --> W1 & V1
    ATT --> W1
    TST --> W1

    classDef role fill:#E11D48,stroke:#9F1239,color:#fff
    classDef tenant fill:#4F46E5,stroke:#3730A3,color:#fff
    classDef auto fill:#059669,stroke:#065F46,color:#fff

    class PLA,IO,TC role
    class INST,CLS,STU,FP,ATT,TST tenant
    class W1,V1 auto
```

### 6. Deployment (production target)

```mermaid
%%{init: {'theme': 'base'}}%%
flowchart TB
    U["Users · Mobile browser"] --> CDN["CDN / Edge"]
    CDN --> FE["Next.js<br/>Vercel or Node host"]
    FE --> LB["Load Balancer"]
    LB --> BE["FastAPI · Uvicorn<br/>Docker / VM"]
    BE --> RDS[("PostgreSQL managed")]
    BE --> SM["Secrets Manager"]
    BE --> WH["Webhooks<br/>Telephony · WhatsApp Business"]

    classDef edge fill:#6366F1,stroke:#4338CA,color:#fff
    classDef compute fill:#0EA5E9,stroke:#0284C7,color:#fff
    classDef store fill:#14B8A6,stroke:#0D9488,color:#fff

    class CDN,FE edge
    class LB,BE compute
    class RDS,SM,WH store
```

### Request flow

1. **Institute owner** registers → institute status `pending` → **platform admin** approves → owner logs in.
2. JWT (30-day expiry) stored in browser localStorage; dashboard routes call `/api/v1/*` with `Authorization: Bearer`.
3. Tables created on first startup via `create_all`; Alembic tracks all subsequent schema changes.
4. **Parent automation:** fee defaulters, absent streaks, and test scores trigger **WhatsApp reminders** or **AI voice follow-ups** to the parent’s phone on file.

---

### Deployment

| Layer | Platform | Notes |
|-------|----------|-------|
| Frontend | Vercel | Auto-deploy on push to `main` |
| Backend | AWS EC2 t4g.small (ARM64) | Docker + GitHub Actions CI/CD |
| Database | Supabase (PostgreSQL) | Pgbouncer pooler, port 6543 |

**CI/CD:** Push to `main` -> GitHub Actions SSHes into EC2 -> `git pull` -> Alembic migrations -> Docker build (ARM64 native) -> `docker compose up -d`.
See `.github/workflows/deploy-backend.yml` and `backend/deploy/README.md`.

---

## Project structure

```
school/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST routes
│   │   ├── core/            # config, auth, security
│   │   ├── db/              # async session
│   │   ├── models/          # SQLAlchemy models
│   │   ├── repositories/    # data access
│   │   ├── schemas/         # Pydantic DTOs
│   │   └── services/        # business logic
│   ├── scripts/init_db.py   # drop + recreate all tables (dev only)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/                 # pages (landing, auth, dashboard, admin)
│   ├── components/          # UI, layout, feature sheets
│   ├── services/            # API clients
│   ├── config/urls.ts       # API base URL
│   └── package.json
├── steps.md                 # original build checklist
└── README.md                # this file
```

---

## Features implemented

### Marketing & auth
- Landing page (hero, feature previews, pricing tiers, 14-day trial CTAs)
- Institute registration and login
- Forgot password (email OTP, bcrypt-hashed OTP storage)
- Password show/hide on auth forms
- Footer pages: Contact, Privacy policy, Terms of service

### Platform admin
- Approve / suspend institutes
- Paginated institute list

### Institute dashboard (mobile-first)
- **Dashboard** — student count, fees collected, pending fees, today’s attendance %
- **Students** — CRUD, class filter, roll number, parent phone
- **Classes & subjects** — CRUD, subjects per class
- **Fees** — one fee plan per student, installment schedule, mark paid, defaulters list, WhatsApp reminder links
- **Attendance** — class-wise marking, holidays, absent streak, WhatsApp to chronic absentees
- **Tests & scores** — schedule tests, enter marks, WhatsApp result links to parents
- **Settings** — institute profile, teachers, academic year

### Integrations (current)
- **WhatsApp:** opens parent chat with pre-filled message (`lib/whatsapp.ts`)
- **Email OTP:** optional; if SMTP is unset, OTP is logged to backend console in dev
- **PWA:** installable on Android/iOS, offline fallback, 30-day JWT sessions (no daily re-login)

### Not implemented yet (roadmap / marketing only)
- AI voice calls (shown on landing page only)
- Payment gateway / UPI links for parent or SaaS billing
- WhatsApp Business API (automated send)
- Multi fee heads (tuition vs transport) — single plan + installments only
- Gmail OTP login (steps.md mentions it; current login is email + password)

---

## Prerequisites

- **Python** 3.11+
- **Node.js** 20+ (or Bun)
- **PostgreSQL** 14+

---

## Setup

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE school_db;
```

### 2. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env`:

- **DATABASE_URL** — toggle local vs Supabase by commenting one line (both pre-filled in `.env.example`):

```env
# Local dev (active)
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@localhost:5432/school_db

# Supabase production (uncomment when deploying)
# DATABASE_URL=postgresql+asyncpg://postgres.[ref]:[pass]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

- **SECRET_KEY** — generate with `openssl rand -hex 32`
- **PLATFORM_ADMIN_EMAIL / PASSWORD** — auto-created on first backend startup
- Optional: Gmail SMTP vars for forgot-password OTP (see `.env.example`)
- When switching to Supabase free tier, also set `DB_POOL_SIZE=3` and `DB_MAX_OVERFLOW=2`

**Alembic migrations** (run from `backend/` with venv active):

```bash
# After any model change — autogenerate a migration
alembic revision --autogenerate -m "describe the change"

# Apply to DB
alembic upgrade head

# Roll back one step
alembic downgrade -1

# Show current revision
alembic current
```

> On a fresh DB (e.g. new Supabase instance), just start the server once —
> `create_all` builds all tables and auto-stamps Alembic at `head`.
> All future deploys only need `alembic upgrade head` before starting.

Run the API:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API: http://127.0.0.1:8000  
- Swagger (when `DEBUG=true`): http://127.0.0.1:8000/docs  

**Reset all tables (destructive):**

```bash
python scripts/init_db.py
```

### 3. Frontend

```bash
cd frontend
npm install
```

Optional — create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

Run the app:

```bash
npm run dev
```

- App: http://localhost:3000  

---

## Default flows (local dev)

| Step | Action |
|------|--------|
| 1 | Start backend + frontend |
| 2 | Open `/register` → create institute (status: **pending**) |
| 3 | Log in as **platform admin** (`/login` → redirects to `/admin`) → approve institute |
| 4 | Institute owner logs in → `/dashboard` |
| 5 | Settings → set up classes, students, fees, etc. |

Platform admin is seeded on first backend startup from `.env` (`PLATFORM_ADMIN_*`).

---

## API overview

Base path: `/api/v1`

| Area | Prefix | Notes |
|------|--------|--------|
| Auth | `/auth` | register, login, me, forgot/reset password |
| Admin | `/admin` | institutes list, approve/suspend |
| Students | `/students` | CRUD, search |
| Classes | `/classes` | CRUD + nested subjects |
| Fees | `/fees`, `/installments` | plans, defaulters, pay installment |
| Attendance | `/attendance` | mark, class view, absent streak |
| Holidays | `/holidays` | CRUD |
| Tests | `/tests` | schedule, scores |
| Dashboard | `/dashboard` | summary stats |
| Admissions | `/admissions` | admission records |
| Users | `/users` | teachers |

Protected routes require JWT. Fee routes require institute admin role.

---

## Environment variables

### Backend (`backend/.env`)

See [`backend/.env.example`](backend/.env.example) for the full list. Required:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@localhost:5432/school_db` |
| `SECRET_KEY` | JWT signing secret |
| `ALLOWED_ORIGINS` | JSON array, e.g. `["http://localhost:3000"]` |

### Frontend

| Variable | Default |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000/api/v1` |

---

## Development notes

- **Mobile-first:** primary UX is phone; test dashboard on narrow viewport.
- **Security:** never commit `.env`; use `.env.example` with placeholder values only.
- **CORS:** add production frontend origin to `ALLOWED_ORIGINS`.
- **Forgot password:** generic response prevents email enumeration; unregistered emails receive no OTP but same message is shown.

---

## Related docs

- [`steps.md`](steps.md) — original step-by-step build order
- [`backend/.env.example`](backend/.env.example) — SMTP and OTP setup notes

---

## License

Internal POC — adjust before public release.
