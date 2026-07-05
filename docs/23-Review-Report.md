# Review Report

Status: FAIL (3 High findings)

Owner: reviewer-agent
Last updated: 2026-07-06
Sprint: Doctor Note MVP (Post-bugfix re-review)
Scope: All source code in src/, middleware.ts, supabase/migrations/, config files
Architecture Reference: 12-Architecture.md v1.0

---

## Summary

Re-review after bugfix round 1. Previous Critical/High findings (missing INSERT RLS, client-side role escalation, missing indexes, schema drift, blanket SELECT policies) are resolved.

New findings from expanded scope: **1 Critical**, **3 High**, **6 Medium**, **4 Low**.

**Previous bugfix findings status:**
- FIND-001 (Critical, INSERT RLS) → Fixed ✅
- FIND-002 (High, client-side role escalation) → Fixed ✅
- FIND-003 (High, missing indexes) → Fixed ✅
- FIND-004 (High, schema drift) → Fixed ✅
- FIND-005 (High, blanket SELECT policies) → Fixed ✅
- FIND-008 (Medium, DELETE policies) → Fixed ✅
- FIND-010 (Medium, doctor_id ownership) → Fixed ✅
- FIND-011 (Medium, unused import) → Fixed ✅

---

## Code Review Findings

| ID | Severity | Category | File | Line | Description | Recommendation |
|---|---|---|---|---|---|---|
| FIND-001 | Critical | Security/RBAC | supabase/migrations/00001_initial_schema.sql | 60 | Missing Admin UPDATE policy on profiles table. Admin cannot change user roles, correct names, or modify any profile other than their own. Architecture doc specifies this policy but it was never implemented. Breaks the RBAC model for a medical system. | Add: `CREATE POLICY "Admin can update any profile" ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));` |
| FIND-002 | High | Security | supabase/migrations/00001_initial_schema.sql | 75 | Doctors SELECT policy uses deprecated `auth.role() = 'authenticated'`. Supabase may remove this function in a future release, silently breaking doctor visibility. | Replace with `auth.uid() IS NOT NULL`. |
| FIND-003 | High | Security/Auth | supabase/migrations/00001_initial_schema.sql | 52 | Self-signup role escalation: profiles INSERT policy only checks `auth.uid() = id`. User can set `role = 'admin'` during signup. CHECK constraint allows all three roles. No RLS guard against elevated role assignment. | Add WITH CHECK that restricts non-admin signups to `role = 'receptionist'`, or use Server Action with service_role key. |
| FIND-004 | High | Security/Audit | supabase/migrations/00001_initial_schema.sql | 118 | Patients INSERT policy doesn't validate `created_by = auth.uid()`. A receptionist could attribute patient records to any user, breaking audit trail integrity required for HIPAA compliance. | Add `AND created_by = auth.uid()` to the WITH CHECK clause. |
| FIND-005 | Medium | Type Safety | src/app/actions/auth.ts | 9 | `formData.get()` returns `string | null`, but values are cast with `as string` without null checks. Missing fields silently become the string "null". | Add explicit null checks or Zod validation before using values. |
| FIND-006 | Medium | Error Handling | src/lib/supabase/server.ts | 16 | Cookie `set` and `remove` handlers silently swallow errors with empty catch blocks. Auth state failures become invisible in production. | At minimum log errors: `console.error('Cookie operation failed:', error)`. |
| FIND-007 | Medium | Security | next.config.js | 1 | No security headers configured. Missing CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy. Exposes `X-Powered-By: Next.js`. | Add `poweredByHeader: false` and security headers via `headers` config key. |
| FIND-008 | Medium | Configuration | package.json | 18 | `@types/react` is ^19.2.17 but runtime React is ^18.3.1. Major version mismatch causes confusing type errors. | Downgrade `@types/react` and `@types/react-dom` to ^18.x. |
| FIND-009 | Medium | Architecture | src/app/actions/auth.ts | 38 | Auth-profile creation race condition: if `signUp()` succeeds but profile insert fails, user has auth account with no profile. Retry gives "User already registered". | Use database trigger to auto-create profiles, or implement cleanup logic. |
| FIND-010 | Medium | Maintainability | src/lib/errors.ts | -- | Centralized error handling module does not exist. Each server action handles errors independently with inconsistent shapes. | Create `src/lib/errors.ts` with AppError, ValidationError, AuthError types. |

---

## Low Findings

| ID | Severity | Category | File | Description | Recommendation |
|---|---|---|---|---|---|
| FIND-011 | Low | Error Handling | src/lib/supabase/client.ts | Non-null assertions on env vars cause obscure crashes if vars are missing. | Add validation with descriptive error messages. |
| FIND-012 | Low | Configuration | tailwind.config.ts | Tailwind v4 installed but config uses v3 format. May be silently ignored. | Downgrade to tailwindcss ^3.x or migrate to v4 CSS config. |
| FIND-013 | Low | Accessibility | src/app/(auth)/login/page.tsx | No `aria-live` on error messages, no `aria-busy` on loading button. | Add `role="alert"` and `aria-busy={loading}`. |
| FIND-014 | Low | Performance | supabase/migrations/00001_initial_schema.sql:226 | Consultations created_at index is ASC but primary use is `ORDER BY created_at DESC`. | Change to `CREATE INDEX ... ON consultations(created_at DESC)`. |

---

## Positive Observations

- ✅ RLS enabled on all 4 tables
- ✅ Role-specific SELECT policies for patients and consultations
- ✅ Server Actions used for mutations (not client-side fetches)
- ✅ Supabase SSR client correctly using `createServerClient` with cookie handling
- ✅ Middleware properly handles session refresh and route protection
- ✅ Database indexes cover primary query patterns
- ✅ TypeScript types aligned with database schema
- ✅ Doctor ownership check on consultation INSERT
- ✅ DELETE policies for patients and consultations
- ✅ Unused imports removed
