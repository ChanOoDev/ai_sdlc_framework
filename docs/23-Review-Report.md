# Review Report

Status: Draft

Owner: Reviewer Agent
Last updated: 2026-07-06
Sprint: Doctor Note MVP (Day 1-4 complete: Auth scaffold)
Scope: All source code in src/, middleware.ts, supabase/migrations/
Architecture Reference: 12-Architecture.md v1.0

---

## Summary

This review covers the initial authentication scaffold of the Doctor Note MVP. The implementation includes Next.js App Router setup, Supabase client configuration (server, client, middleware), login/signup pages, a basic dashboard layout, middleware route protection, and the initial database migration with RLS policies.

The scaffold is a reasonable starting point. The Next.js App Router patterns are correctly applied (Server Components, "use client" directives, middleware). However, the review identified **1 Critical** and **4 High** severity findings that must be resolved before proceeding to the next development phase. The Critical finding blocks the signup flow entirely -- a missing INSERT RLS policy on the profiles table means new users cannot create their profile after authentication. The High findings relate to client-side role escalation vulnerabilities, missing database indexes, schema drift from the architecture, and an overly permissive RLS policy design.

**Verdict: FAIL** (1 Critical finding present)

---

## Code Review Findings

| ID | Severity | Category | File | Line | Description | Recommendation |
|---|---|---|---|---|---|---|
| FIND-001 | Critical | RLS Policies | supabase/migrations/00001_initial_schema.sql | 54-69 | Missing INSERT RLS policy on profiles table. The signup flow inserts a profile row directly from the client, but no INSERT policy exists, so PostgreSQL denies the insert. Signup is broken. | Add INSERT policy: `CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);` Also move insert to Server Action (see FIND-002). |
| FIND-002 | High | Auth/RBAC | src/app/(auth)/signup/page.tsx | 24-48 | Client-side profile insert allows role escalation. Attacker can change role to "admin" in the HTTP request. UI limits choices but no server-side validation enforces the restriction. | Move profile creation to a Server Action. Validate role server-side, restricting self-registration to "doctor" and "receptionist" only. Admin role requires authenticated admin caller. |
| FIND-003 | High | Database Usage | supabase/migrations/00001_initial_schema.sql | -- | All 9 database indexes from the architecture are missing. No indexes on foreign keys, search columns, or RLS subquery columns. Queries will degrade to full table scans. | Add all specified indexes: idx_profiles_role, idx_profiles_email, idx_doctors_user_id, idx_doctors_name, idx_patients_name, idx_patients_email, idx_patients_created_by, idx_consultations_doctor_id, idx_consultations_patient_id, idx_consultations_created_at. |
| FIND-004 | High | Architecture Consistency | supabase/migrations/00001_initial_schema.sql and src/types/database.ts | Multiple | Multiple schema drifts from architecture: (1) profiles.full_name is nullable (architecture: NOT NULL), (2) doctors.specialty is nullable (architecture: NOT NULL), (3) patients.created_by is nullable with ON DELETE SET NULL (architecture: NOT NULL with ON DELETE RESTRICT). TypeScript types reflect the weaker schema. | Align migration with architecture. Make full_name and specialty NOT NULL. Change patients.created_by to NOT NULL with ON DELETE RESTRICT. Update TS types. Or update architecture if deviations are intentional. |
| FIND-005 | High | RLS Policies | supabase/migrations/00001_initial_schema.sql | 85-87, 106-108 | Blanket SELECT policies allow all authenticated users to view ALL patients and ALL consultations. Architecture specifies doctors should only see their own patients/consultations. Exposes patient PHI to unauthorized users -- HIPAA compliance risk. | Replace blanket policies with role-specific policies matching the architecture. Doctors: subquery on consultations to limit to own patients. Receptionists: view all (read-only). |
| FIND-006 | Medium | Input Validation | src/app/(auth)/signup/page.tsx | 18-58 | No server-side input validation. Relies entirely on HTML5 client-side validation. Zod is installed but not used. Attacker can submit arbitrary email, short password, or malicious name content. | Implement Zod validation schemas in src/lib/validations/. Validate email format, enforce minimum password length (8+ chars), sanitize full_name. Apply in Server Action. |
| FIND-007 | Medium | Framework Best Practices | src/app/(auth)/login/page.tsx, src/app/(auth)/signup/page.tsx | 14, 16 | Supabase client instantiated at component body level (every render). While createBrowserClient is a singleton, the pattern is fragile and creates client during SSR where browser cookies are unavailable. | Move createClient() inside event handlers or use a custom hook. Standard pattern: create inside the async handler function. |
| FIND-008 | Medium | RLS Policies | supabase/migrations/00001_initial_schema.sql | -- | Missing DELETE policies for patients and consultations. Architecture specifies "Admin can delete patients" and "Admin can delete consultations" but neither is implemented. | Add DELETE policies: `CREATE POLICY "Admins can delete patients" ON patients FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));` Same pattern for consultations. |
| FIND-009 | Medium | Security Risks | src/lib/supabase/client.ts, server.ts, middleware.ts | 5-6, 8-9, 10-11 | Non-null assertions (!) on environment variables. If NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY are missing, the app crashes at runtime with an unhelpful error. No startup validation. | Add runtime validation: check env vars exist before creating client. Throw descriptive error if missing. Consider a shared validation module. |
| FIND-010 | Medium | Auth/RBAC | supabase/migrations/00001_initial_schema.sql | 110-115 | Consultation INSERT policy checks user has role "doctor" but does not verify doctor_id matches the authenticated user's own doctor record. Any doctor can create consultations attributed to any other doctor. | Change INSERT policy to verify doctor_id ownership: `WITH CHECK (EXISTS (SELECT 1 FROM doctors WHERE id = doctor_id AND user_id = auth.uid()));` |
| FIND-011 | Low | Maintainability | src/app/actions/auth.ts | 3 | Unused import: revalidatePath from next/cache is imported but never used. Will trigger lint warnings. | Remove the unused import. |
| FIND-012 | Low | Architecture Consistency | (missing file) src/lib/supabase/admin.ts | -- | Architecture specifies admin.ts for service-role Supabase client (bypassing RLS). File does not exist. Needed for admin operations like user management. | Create when needed. Ensure service role key is never exposed to client bundle. |
| FIND-013 | Low | Database Usage | supabase/migrations/00001_initial_schema.sql | 1-2, 16, 25, 38 | Uses uuid-ossp extension with uuid_generate_v4(). Architecture specifies gen_random_uuid() which is built into PostgreSQL 13+ with no extension required. | Replace uuid_generate_v4() with gen_random_uuid(). Remove CREATE EXTENSION line. |
| FIND-014 | Low | Maintainability | src/utils/format.ts | 10-14 | formatCurrency hardcodes en-SG locale and SGD currency. No constants file exists (architecture specifies src/utils/constants.ts). | Make currency/locale configurable via constants, or document as intentional for MVP. |
| FIND-015 | Low | Architecture Consistency | src/types/database.ts | 69 | patients.created_by typed as string | null. Architecture specifies NOT NULL. TypeScript type does not enforce the intended database constraint. | Align TS type with architecture (string, not string | null). |

---

## Security Review Findings

| ID | Severity | Category | File | Line | Description | Recommendation |
|---|---|---|---|---|---|---|
| SEC-001 | High | Auth/RBAC | src/app/(auth)/signup/page.tsx | 42-48 | Profile creation from client allows role escalation to admin. No server-side role validation. | Move to Server Action with role whitelist validation. |
| SEC-002 | High | RLS Policies | supabase/migrations/00001_initial_schema.sql | 85-87 | Patients visible to all authenticated users. Doctors can see patients they have no relationship with. PHI exposure risk. | Implement role-specific SELECT policies per architecture. |
| SEC-003 | High | RLS Policies | supabase/migrations/00001_initial_schema.sql | 106-108 | Consultations visible to all authenticated users. Doctors can see other doctors' consultations. | Implement role-specific SELECT policies per architecture. |
| SEC-004 | Medium | Auth/RBAC | src/app/(auth)/signup/page.tsx | 24-33 | signUp options.data includes role, but this is client-provided metadata stored in auth.users. Could be used for impersonation if relied upon for authorization decisions. | Never rely on auth metadata for authorization. Always check profiles table with RLS. |
| SEC-005 | Medium | RLS Policies | supabase/migrations/00001_initial_schema.sql | 110-115 | Consultation INSERT does not verify doctor_id matches authenticated user. | Add doctor_id ownership check to INSERT policy. |
| SEC-006 | Low | Input Validation | src/app/(auth)/login/page.tsx, signup/page.tsx | -- | No rate limiting on auth attempts. Potential for brute-force attacks on login. | Implement rate limiting via middleware or Supabase's built-in rate limiting. Consider account lockout after failed attempts. |

---

## Refactoring Plan

| ID | Priority | Scope | Description | Est. Effort |
|---|---|---|---|---|
| REFACTOR-001 | Critical | Database migration | Add INSERT policy on profiles table to unblock signup flow | 0.5 hours |
| REFACTOR-002 | High | Signup flow | Move profile creation from client-side to Server Action with server-side validation | 1 hour |
| REFACTOR-003 | High | Database migration | Add all 9 indexes from architecture document | 0.5 hours |
| REFACTOR-004 | High | Database migration + TS types | Align schema with architecture (NOT NULL constraints, ON DELETE behavior) | 1 hour |
| REFACTOR-005 | High | Database migration | Replace blanket SELECT policies with role-specific RLS policies | 2 hours |
| REFACTOR-006 | Medium | Validation layer | Create Zod validation schemas in src/lib/validations/ for all entities | 2 hours |
| REFACTOR-007 | Medium | Auth pages | Move Supabase client creation inside event handlers | 0.5 hours |
| REFACTOR-008 | Medium | Database migration | Add DELETE policies for patients and consultations | 0.5 hours |
| REFACTOR-009 | Medium | Supabase clients | Add environment variable validation at startup | 0.5 hours |
| REFACTOR-010 | Medium | Database migration | Fix consultation INSERT policy to verify doctor_id ownership | 0.5 hours |

---

## Verdict

**Status:** FAIL

**Summary:** The authentication scaffold demonstrates correct Next.js App Router patterns and solid Supabase client setup. However, the implementation has a Critical finding that blocks the signup flow (missing INSERT RLS policy on profiles) and 4 High findings that create security risks (role escalation, permissive RLS, missing indexes, schema drift). These must be fixed before any user testing or progression to the next development phase.

**Critical/High blocking:** 5 findings (FIND-001, FIND-002, FIND-003, FIND-004, FIND-005)

**Positive Observations:**
- TypeScript strict mode is enabled in tsconfig.json
- Next.js App Router patterns correctly applied: Server Components by default, "use client" only for forms
- Middleware correctly refreshes sessions and protects routes
- @supabase/ssr package used correctly for both server and client clients
- Database types well-structured with Row/Insert/Update variants
- Architecture document is thorough and provides clear implementation reference
