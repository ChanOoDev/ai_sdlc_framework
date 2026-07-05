# Doctor Note MVP

Lightweight clinic management for doctors, patients, and consultation notes.

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components, Server Actions)
- **Database:** Supabase PostgreSQL with Row-Level Security
- **Auth:** Supabase Auth (email/password)
- **Styling:** Tailwind CSS + shadcn/ui
- **Language:** TypeScript (strict mode)
- **Deployment:** Vercel

## Features

- **Authentication:** Email/password login and signup with role selection
- **Role-Based Access Control:** Admin, Doctor, Receptionist with enforced permissions
- **Patient Management:** Register, view, edit, and delete patients (Admin/Receptionist)
- **Doctor Management:** Manage doctor roster with specialties (Admin only)
- **Consultation Notes:** Create and view consultation records (Doctor only)
- **Patient History:** Chronological view of all consultations per patient
- **Dashboard:** Clinic activity overview with stats
- **Search:** Find patients by name, phone, or email
- **PDF Export:** Export consultation notes as PDF

## Getting Started

### Prerequisites

- Node.js 22+
- Supabase project (free tier works)

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/ChanOoDev/ai_sdlc_framework.git
   cd ai_sdlc_framework
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project URL and anon key.

4. Apply database migration:
   - Open Supabase Dashboard → SQL Editor
   - Paste contents of `supabase/migrations/00001_initial_schema.sql`
   - Run the query

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type check |

## Project Structure

```
src/
  app/
    (auth)/           # Login and signup pages
      login/page.tsx
      signup/page.tsx
    (dashboard)/      # Dashboard and main app pages
    actions/          # Server Actions (auth, patients, etc.)
    api/              # Route handlers
  components/         # React components
  lib/
    supabase/         # Supabase client setup (server, client, middleware)
  types/              # TypeScript type definitions
supabase/
  migrations/         # Database migrations
docs/                 # Project documentation
```

## Database Schema

4 tables with RLS policies:

- **profiles** — User accounts with roles (admin, doctor, receptionist)
- **doctors** — Doctor profiles linked to user accounts
- **patients** — Patient records with demographics
- **consultations** — Medical consultation notes

## Roles

| Resource | Admin | Doctor | Receptionist |
|---|---|---|---|
| Dashboard | Full stats | Own stats | Full stats |
| Patients | CRUD | View own | CRUD |
| Doctors | CRUD | View only | View only |
| Consultations | CRUD (all) | CRUD (own) | View only |

## AI SDLC Framework

This project is built using the AI Software Company Template framework. Claude Code acts as a structured delivery team with:

- 9 specialist agents (orchestrator, product-manager, architect, scrum-master, developer, reviewer, qa, release-manager, devops)
- 14 slash commands (`/status`, `/review`, `/qa`, `/bugfix`, `/regression`, `/release-check`, etc.)
- Quality hooks (secret-scan, lint, typecheck, build, test)
- Phase-gated SDLC workflow

### Quick Commands

```text
/status          # Check project status
/next-task       # Get next task to work on
/review          # Run code review
/qa              # Run QA tests
/bugfix          # Fix critical/high findings
/regression      # Run regression tests
/release-check   # Release readiness check
/deploy-check    # Deployment readiness check
/docs-sync       # Sync documentation
```

## License

Private — For internal use only.
