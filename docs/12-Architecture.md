# 12 - Architecture: Doctor Note MVP

**Version:** 1.0
**Date:** 2026-07-06
**Status:** Draft
**Owner:** Architect

---

## 1. Overview

Doctor Note MVP is a full-stack medical consultation management system built on **Next.js App Router** with **Supabase** as the backend platform. The architecture follows a server-first rendering model where React Server Components (RSC) are used by default, and Server Actions handle all data mutations. This approach minimizes client-side JavaScript, improves initial page load performance, and simplifies the data access layer by co-locating queries with the components that consume them.

The system provides role-based access control (RBAC) for three user types: Admin, Doctor, and Receptionist. Each role has distinct permissions governing what data can be viewed and what actions can be performed. All data flows through Supabase's PostgreSQL database, which is protected by Row-Level Security (RLS) policies enforced at the database level.

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rendering Model | Server Components + Server Actions | Reduced client JS, better SEO, simplified data fetching |
| Backend Pattern | Next.js API Routes + Server Actions | Co-located logic, type-safe mutations, progressive enhancement |
| Database | Supabase PostgreSQL | Managed PostgreSQL, built-in auth, RLS, real-time subscriptions |
| Authentication | Supabase Auth | Tight integration with PostgreSQL, JWT-based, supports email/password |
| Hosting | Vercel | Native Next.js support, edge functions, automatic deployments |
| UI Library | shadcn/ui + Tailwind CSS | Accessible components, customizable, no runtime overhead |

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 14+ | App Router, Server Components, Server Actions, image optimization |
| | React | 18+ | UI rendering, component model, concurrent features |
| | TypeScript | 5.x | Static typing, improved DX, fewer runtime errors |
| | Tailwind CSS | 3.x | Utility-first styling, design system foundation |
| | shadcn/ui | Latest | Pre-built accessible components (Button, Dialog, Table, Form) |
| **Backend** | Next.js Server Actions | 14+ | Server-side mutations, form handling, validation |
| | Next.js Route Handlers | 14+ | REST API endpoints for listing and fetching data |
| **Database** | Supabase PostgreSQL | 15+ | Primary data store, RLS enforcement, triggers |
| **Authentication** | Supabase Auth | Latest | Email/password auth, JWT tokens, session management |
| **Hosting** | Vercel | Latest | Deployment, serverless functions, edge network, preview deploys |
| **CI/CD** | GitHub Actions | Latest | Automated testing, linting, type checking, deployment gates |
| **Package Manager** | pnpm | 8+ | Fast, disk-efficient dependency management |
| **Linting** | ESLint + Prettier | Latest | Code quality, consistent formatting |
| **Testing** | Vitest + Testing Library | Latest | Unit tests, component tests |

---

## 3. Entity-Relationship Diagram (ERD)

```
+-------------------+       +-------------------+       +-------------------+
|     profiles      |       |      doctors      |       |     patients      |
|-------------------|       |-------------------|       |-------------------|
| id         UUID   |<------| user_id    UUID   |       | id         UUID   |
| full_name  TEXT   |  1:1  | name       TEXT   |       | name       TEXT   |
| email      TEXT   |       | specialty  TEXT   |       | email      TEXT   |
| role       TEXT   |       | created_at TSTZ   |       | phone      TEXT   |
| created_at TSTZ   |       +-------------------+       | date_of_birth DATE |
| updated_at TSTZ   |                                    | address    TEXT   |
+-------------------+                                    | created_by UUID   |------> profiles.id
       |                                                  | created_at TSTZ   |
       |                                                  | updated_at TSTZ   |
       |                                                  +-------------------+
       |                                                          |
       |                                                          | 1:N
       |                                                          v
       |                                                  +-------------------+
       |                                                  |  consultations    |
       |                                                  |-------------------|
       |                                                  | id         UUID   |
       |                                                  | doctor_id  UUID   |------> doctors.id
       |                                                  | patient_id UUID   |------> patients.id
       |                                                  | notes      TEXT   |
       |                                                  | diagnosis  TEXT   |
       |                                                  | prescription TEXT |
       |                                                  | created_at TSTZ   |
       |                                                  | updated_at TSTZ   |
       +------------------------------------------------->+-------------------+
```

### Relationships

- **profiles 1:1 doctors** -- A doctor user has one profile and one doctor record. `doctors.user_id` references `profiles.id`.
- **profiles 1:N patients** -- A receptionist (or admin) creates patients. `patients.created_by` references `profiles.id`.
- **doctors 1:N consultations** -- A doctor creates many consultations. `consultations.doctor_id` references `doctors.id`.
- **patients 1:N consultations** -- A patient has many consultations. `consultations.patient_id` references `patients.id`.

### ERD Summary Table

| Entity | Description | Key Fields |
|--------|-------------|------------|
| profiles | System users (admins, doctors, receptionists) | id, full_name, email, role |
| doctors | Doctor profiles linked to a user account | id, user_id (FK), name, specialty |
| patients | Patient records managed by receptionists/admins | id, name, email, phone, date_of_birth, address, created_by (FK) |
| consultations | Medical consultation notes | id, doctor_id (FK), patient_id (FK), notes, diagnosis, prescription |

---

## 4. Database Schema

### 4.1 Profiles Table

```sql
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'receptionist')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
```

### 4.2 Doctors Table

```sql
CREATE TABLE doctors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  specialty  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_name ON doctors(name);
```

### 4.3 Patients Table

```sql
CREATE TABLE patients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  date_of_birth DATE,
  address       TEXT,
  created_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_created_by ON patients(created_by);
```

### 4.4 Consultations Table

```sql
CREATE TABLE consultations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id     UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  notes         TEXT NOT NULL,
  diagnosis     TEXT,
  prescription  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_created_at ON consultations(created_at DESC);
```

### 4.5 Updated_at Trigger Function

```sql
-- Function to auto-update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to patients
CREATE TRIGGER set_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to consultations
CREATE TRIGGER set_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4.6 Enable Row-Level Security

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
```

---

## 5. API Specification

### 5.1 Server Actions (Mutations)

All mutations use Next.js Server Actions invoked from client components. Each action validates input, enforces authorization, and interacts with Supabase directly.

#### 5.1.1 Patient Actions

| Action | Input | Output | Authorization |
|--------|-------|--------|---------------|
| `createPatient` | `{ name, email?, phone?, date_of_birth?, address? }` | `Patient` | Admin, Receptionist |
| `updatePatient` | `{ id, name?, email?, phone?, date_of_birth?, address? }` | `Patient` | Admin, Receptionist |
| `deletePatient` | `{ id }` | `{ success: boolean }` | Admin |

#### 5.1.2 Consultation Actions

| Action | Input | Output | Authorization |
|--------|-------|--------|---------------|
| `createConsultation` | `{ patient_id, notes, diagnosis?, prescription? }` | `Consultation` | Admin, Doctor |
| `updateConsultation` | `{ id, notes?, diagnosis?, prescription? }` | `Consultation` | Admin, Doctor (own only) |
| `deleteConsultation` | `{ id }` | `{ success: boolean }` | Admin |

#### 5.1.3 Search Actions

| Action | Input | Output | Authorization |
|--------|-------|--------|---------------|
| `searchPatients` | `{ query: string }` | `Patient[]` | Admin, Doctor, Receptionist |

### 5.2 Route Handlers (GET)

| Route | Method | Query Params | Response | Authorization |
|-------|--------|--------------|----------|---------------|
| `/api/patients` | GET | `page`, `limit`, `search?` | `{ patients: Patient[], total: number }` | Admin, Doctor, Receptionist |
| `/api/patients/[id]` | GET | -- | `Patient` | Admin, Doctor, Receptionist |
| `/api/patients/[id]/history` | GET | -- | `Consultation[]` | Admin, Doctor (own patients), Receptionist (view only) |
| `/api/doctors` | GET | `page`, `limit` | `{ doctors: Doctor[], total: number }` | Admin, Doctor, Receptionist |
| `/api/consultations` | GET | `doctor_id?`, `patient_id?`, `page`, `limit` | `{ consultations: Consultation[], total: number }` | Admin, Doctor (own), Receptionist (view only) |
| `/api/dashboard/stats` | GET | -- | `DashboardStats` | Admin, Doctor (own stats), Receptionist |

### 5.3 Request/Response Types

```typescript
// Patient type
interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Consultation type
interface Consultation {
  id: string;
  doctor_id: string;
  patient_id: string;
  notes: string;
  diagnosis: string | null;
  prescription: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  doctor?: Doctor;
  patient?: Patient;
}

// Dashboard stats
interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalConsultations: number;
  recentConsultations: Consultation[];
}
```

---

## 6. Row-Level Security (RLS) Policies

### 6.1 Profiles Table

```sql
-- Admin: full access to all profiles
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Admin can update any profile
CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());
```

### 6.2 Doctors Table

```sql
-- Everyone can view doctors (needed for assignment)
CREATE POLICY "Authenticated users can view doctors"
  ON doctors FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admin can manage doctors
CREATE POLICY "Admin can insert doctors"
  ON doctors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update doctors"
  ON doctors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete doctors"
  ON doctors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 6.3 Patients Table

```sql
-- Admin: full access
CREATE POLICY "Admin can view all patients"
  ON patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Doctor: view patients who have consultations with them
CREATE POLICY "Doctors can view their patients"
  ON patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'doctor'
    )
    AND EXISTS (
      SELECT 1 FROM consultations c
      JOIN doctors d ON c.doctor_id = d.id
      WHERE d.user_id = auth.uid()
      AND c.patient_id = patients.id
    )
  );

-- Receptionist: view all patients
CREATE POLICY "Receptionists can view patients"
  ON patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'receptionist'
    )
  );

-- Admin and Receptionist can create patients
CREATE POLICY "Admin and Receptionist can create patients"
  ON patients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'receptionist')
    )
  );

-- Admin and Receptionist can update patients
CREATE POLICY "Admin and Receptionist can update patients"
  ON patients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'receptionist')
    )
  );

-- Admin can delete patients
CREATE POLICY "Admin can delete patients"
  ON patients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 6.4 Consultations Table

```sql
-- Admin: full access
CREATE POLICY "Admin can view all consultations"
  ON consultations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Doctor: view own consultations
CREATE POLICY "Doctors can view own consultations"
  ON consultations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE id = consultations.doctor_id
      AND user_id = auth.uid()
    )
  );

-- Receptionist: view all consultations (read-only)
CREATE POLICY "Receptionists can view consultations"
  ON consultations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'receptionist'
    )
  );

-- Doctor: create consultations
CREATE POLICY "Doctors can create consultations"
  ON consultations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE id = consultations.doctor_id
      AND user_id = auth.uid()
    )
  );

-- Doctor: update own consultations
CREATE POLICY "Doctors can update own consultations"
  ON consultations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE id = consultations.doctor_id
      AND user_id = auth.uid()
    )
  );

-- Admin: delete any consultation
CREATE POLICY "Admin can delete consultations"
  ON consultations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 6.5 RLS Policy Summary Table

| Table | Policy | Operation | Roles | Rule |
|-------|--------|-----------|-------|------|
| profiles | Admin full access | SELECT, UPDATE | Admin | Profile role = 'admin' |
| profiles | Own profile | SELECT, UPDATE | All | id = auth.uid() |
| doctors | View doctors | SELECT | All authenticated | auth.role() = 'authenticated' |
| doctors | Manage doctors | INSERT, UPDATE, DELETE | Admin | Profile role = 'admin' |
| patients | Admin full access | SELECT | Admin | Profile role = 'admin' |
| patients | Doctor own patients | SELECT | Doctor | Has consultation with patient |
| patients | Receptionist view | SELECT | Receptionist | Profile role = 'receptionist' |
| patients | Create patients | INSERT | Admin, Receptionist | role IN ('admin', 'receptionist') |
| patients | Update patients | UPDATE | Admin, Receptionist | role IN ('admin', 'receptionist') |
| patients | Delete patients | DELETE | Admin | Profile role = 'admin' |
| consultations | Admin full access | SELECT | Admin | Profile role = 'admin' |
| consultations | Doctor own | SELECT, INSERT, UPDATE | Doctor | doctor.user_id = auth.uid() |
| consultations | Receptionist view | SELECT | Receptionist | Profile role = 'receptionist' |
| consultations | Admin delete | DELETE | Admin | Profile role = 'admin' |

---

## 7. Authentication and Authorization

### 7.1 Authentication Flow

1. **Sign Up / Sign In** -- Users authenticate via Supabase Auth using email and password. Supabase handles password hashing (bcrypt), email verification, and session token generation.

2. **Session Management** -- Supabase issues JWT access tokens and refresh tokens. The Next.js middleware intercepts requests, validates the JWT, and attaches the authenticated user to the request context via `supabase.auth.getUser()`.

3. **Middleware Chain** -- The Next.js middleware (`middleware.ts`) runs on every request to protected routes. It:
   - Checks for a valid Supabase session cookie
   - Redirects unauthenticated users to `/login`
   - Attaches user metadata to the request for downstream server components

### 7.2 Authorization Model (RBAC)

Authorization is enforced at two levels:

**Application Level (Next.js Middleware + Server Components):**
- Middleware checks authentication and redirects accordingly
- Server components and server actions read the user's role from the `profiles` table
- Route-level guards prevent access to unauthorized pages

**Database Level (Supabase RLS):**
- Row-Level Security policies on every table ensure data isolation
- Even if application-level checks are bypassed, RLS prevents unauthorized data access
- Policies are written in SQL and enforced by PostgreSQL

### 7.3 Role Permissions Matrix

| Resource | Admin | Doctor | Receptionist |
|----------|-------|--------|--------------|
| **Dashboard** | Full stats | Own stats | Full stats (view only) |
| **Patients** | CRUD | View own patients | CRUD |
| **Doctors** | CRUD | View only | View only |
| **Consultations** | CRUD (all) | CRUD (own) | View only |
| **Patient History** | View all | View own patients | View all (read-only) |
| **PDF Export** | Yes | Yes (own patients) | No |
| **User Management** | Yes | No | No |

### 7.4 Supabase Client Setup

```typescript
// src/lib/supabase/server.ts -- Server-side client
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const cookieStore = cookies();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );
}

// src/lib/supabase/client.ts -- Client-side client
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

---

## 8. Folder Structure

```
doctor-note-mvp/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint, type-check, test on PR
│       └── deploy.yml          # Deploy to Vercel on main merge
├── docs/
│   ├── 01-Project-Brief.md
│   ├── 02-Stakeholders.md
│   ├── ...
│   └── 12-Architecture.md      # This file
├── public/
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Dashboard shell (sidebar, navbar)
│   │   │   ├── page.tsx                # Dashboard home
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx            # Patient list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx        # Create patient form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Patient detail / profile
│   │   │   │       ├── edit/
│   │   │   │       │   └── page.tsx    # Edit patient form
│   │   │   │       └── history/
│   │   │   │           └── page.tsx    # Patient consultation history
│   │   │   ├── doctors/
│   │   │   │   ├── page.tsx            # Doctor list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx        # Add doctor form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Doctor detail
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx    # Edit doctor form
│   │   │   └── consultations/
│   │   │       ├── page.tsx            # Consultation list
│   │   │       ├── new/
│   │   │       │   └── page.tsx        # New consultation form
│   │   │       └── [id]/
│   │   │           ├── page.tsx        # Consultation detail
│   │   │           └── edit/
│   │   │               └── page.tsx    # Edit consultation form
│   │   ├── api/
│   │   │   ├── patients/
│   │   │   │   ├── route.ts            # GET /api/patients
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts        # GET /api/patients/[id]
│   │   │   │       └── history/
│   │   │   │           └── route.ts    # GET /api/patients/[id]/history
│   │   │   ├── doctors/
│   │   │   │   └── route.ts            # GET /api/doctors
│   │   │   ├── consultations/
│   │   │   │   └── route.ts            # GET /api/consultations
│   │   │   └── dashboard/
│   │   │       └── stats/
│   │   │           └── route.ts        # GET /api/dashboard/stats
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Landing / redirect
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── toast.tsx
│   │   ├── patients/
│   │   │   ├── patient-form.tsx        # Create/edit patient form
│   │   │   ├── patient-table.tsx       # Patient list table
│   │   │   ├── patient-search.tsx      # Patient search component
│   │   │   └── patient-profile.tsx     # Patient profile card
│   │   ├── doctors/
│   │   │   ├── doctor-form.tsx
│   │   │   ├── doctor-table.tsx
│   │   │   └── doctor-card.tsx
│   │   ├── consultations/
│   │   │   ├── consultation-form.tsx
│   │   │   ├── consultation-table.tsx
│   │   │   └── consultation-detail.tsx
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx
│   │   │   └── recent-activity.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── navbar.tsx
│   │   │   └── auth-guard.tsx
│   │   └── shared/
│   │       ├── data-table.tsx
│   │       ├── loading-spinner.tsx
│   │       ├── empty-state.tsx
│   │       └── pdf-export-button.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts               # Server-side Supabase client
│   │   │   ├── client.ts               # Client-side Supabase client
│   │   │   └── admin.ts                # Service-role client (admin operations)
│   │   ├── validations/
│   │   │   ├── patient.ts              # Zod schemas for patient
│   │   │   ├── doctor.ts               # Zod schemas for doctor
│   │   │   └── consultation.ts         # Zod schemas for consultation
│   │   └── utils.ts                    # Helper functions
│   ├── types/
│   │   └── database.ts                 # Generated/database TypeScript types
│   ├── actions/
│   │   ├── patients.ts                 # Patient server actions
│   │   ├── doctors.ts                  # Doctor server actions
│   │   ├── consultations.ts            # Consultation server actions
│   │   └── search.ts                   # Search server actions
│   └── utils/
│       ├── constants.ts                # App constants
│       ├── pdf.ts                      # PDF generation helpers
│       └── date.ts                     # Date formatting utilities
├── supabase/
│   ├── migrations/                     # SQL migration files
│   │   ├── 001_create_profiles.sql
│   │   ├── 002_create_doctors.sql
│   │   ├── 003_create_patients.sql
│   │   ├── 004_create_consultations.sql
│   │   ├── 005_create_rls_policies.sql
│   │   └── 006_create_triggers.sql
│   └── seed.sql                        # Development seed data
├── .env.local                          # Environment variables (gitignored)
├── .env.example                        # Environment variable template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## 9. Technical Risks

| # | Risk | Severity | Likelihood | Impact | Mitigation |
|---|------|----------|------------|--------|------------|
| 1 | **RLS Misconfiguration** | High | Medium | Unauthorized data access across tenants; potential HIPAA violation if PHI is exposed to wrong users | Audit every RLS policy before deployment; write integration tests that verify each role can only access permitted rows; use `supabase db dump` to review policies in staging |
| 2 | **PDF Generation Performance** | Medium | High | Large consultation histories or complex patient profiles may cause slow PDF rendering, timeout on serverless functions, or OOM errors on Vercel's 50MB limit | Offload PDF generation to a background job or edge function; implement pagination for large datasets; set hard limits on PDF page count; use streaming PDF libraries (e.g., `@react-pdf/renderer` with streaming) |
| 3 | **Supabase Free Tier Limits** | Medium | High | Supabase free tier caps at 500MB database, 1GB file storage, 50,000 monthly active users, and limited API requests; exceeding limits causes downtime | Monitor usage via Supabase dashboard; implement soft alerts at 70% of each limit; design schema to minimize storage (e.g., no unnecessary BLOBs); plan migration path to Pro tier before launch |
| 4 | **Auth Session Management** | High | Medium | Stale sessions, race conditions on token refresh, or middleware bypass could allow unauthorized access; JWT expiry misconfiguration could lock users out or leave sessions open | Use Supabase's built-in session refresh; set short access token expiry (15 min) with long refresh tokens (7 days); implement proper logout that invalidates server-side session; test session expiry edge cases |
| 5 | **Data Migration and Backfill** | Medium | Low | Future schema changes (adding columns, changing constraints) may require downtime or data backfill on production; no rollback strategy if migration fails | Version all migrations in `supabase/migrations/`; test migrations against a staging copy of production data; write reversible migrations where possible; maintain a rollback script for each migration |
| 6 | **Next.js Server Action Security** | High | Medium | Server Actions exposed as POST endpoints could be called directly without authentication if middleware is misconfigured; input validation bypass could allow SQL injection or data corruption | Always validate inputs with Zod on the server side; never trust client-provided user IDs; check `auth.uid()` against the action context; rate-limit server actions; use CSRF tokens |
| 7 | **Vendor Lock-in with Supabase** | Low | Low | Tight coupling to Supabase-specific features (RLS, Edge Functions, Auth) makes future migration difficult | Abstract Supabase access behind a service layer (`src/lib/supabase/`); avoid Supabase-specific SQL in application code where possible; document all Supabase-specific dependencies |

---

## 10. Deployment Architecture

```
Developer Push --> GitHub Actions (CI) --> Vercel (Preview Deploy) --> Review & Approve --> Vercel (Production)
                                            |
                                       Supabase (Staging)
                                            |
                                       Supabase (Production)
```

- **Preview Deployments** -- Every PR triggers a Vercel preview deployment with its own URL. Environment variables point to the Supabase staging project.
- **Production Deployment** -- Merges to `main` trigger production deployment. Environment variables point to the Supabase production project.
- **Database Migrations** -- Run manually or via CI against the target Supabase project using `supabase db push`.

---

## 11. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 12. Open Questions

1. Should we support social login (Google, GitHub) in the MVP, or stick to email/password only?
2. Is there a maximum file size limit for PDF exports we should enforce?
3. Do we need audit logging for who accessed/modified patient records?
4. Should the doctor profile creation be self-service or admin-only?
5. What is the expected concurrent user count at launch?

---

*This architecture document is a living artifact. It will be updated as design decisions are made and implementation progresses.*
