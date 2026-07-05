# Bug Fix Report

Status: Complete

Owner: Developer Agent
Last updated: 2026-07-06
Sprint: Doctor Note MVP (Auth scaffold)
Source: 23-Review-Report.md

---

## Summary

Fixed all 1 Critical, 4 High, and 3 Medium findings from the code review. Changes span the database migration, TypeScript types, Server Action, and signup page. The signup flow is now secure with server-side role validation, the schema aligns with architecture constraints, RLS policies are role-specific, and all required indexes are in place.

---

## Findings Fixed

| Bug ID | Fix Description | Files Changed | Status |
|---|---|---|---|
| FIND-001 | Added INSERT RLS policy on profiles table: `CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);` -- unblocks the signup flow. | supabase/migrations/00001_initial_schema.sql | Fixed |
| FIND-002 | Moved profile creation from client-side signup to a Server Action (`signup` in `src/app/actions/auth.ts`). Server-side role validation restricts self-registration to "doctor" and "receptionist" only. Updated signup page to use the Server Action via FormData. | src/app/actions/auth.ts, src/app/(auth)/signup/page.tsx | Fixed |
| FIND-003 | Added all 10 missing database indexes: idx_profiles_role, idx_profiles_email, idx_doctors_user_id, idx_doctors_name, idx_patients_name, idx_patients_email, idx_patients_created_by, idx_consultations_doctor_id, idx_consultations_patient_id, idx_consultations_created_at. | supabase/migrations/00001_initial_schema.sql | Fixed |
| FIND-004 | Aligned schema with architecture: profiles.full_name NOT NULL, doctors.specialty NOT NULL, patients.created_by NOT NULL with ON DELETE RESTRICT. Updated TypeScript types to match (removed nullability from full_name, specialty, created_by). Also replaced uuid_generate_v4() with gen_random_uuid() and removed uuid-ossp extension. | supabase/migrations/00001_initial_schema.sql, src/types/database.ts | Fixed |
| FIND-005 | Replaced blanket SELECT policies with role-specific policies. Patients: doctors see only patients with consultations they own (via subquery), receptionists see all, admins see all. Consultations: doctors see only their own (via doctors table join), receptionists see all, admins see all. | supabase/migrations/00001_initial_schema.sql | Fixed |
| FIND-008 | Added DELETE policies for patients and consultations: admin-only deletion via role check on profiles table. | supabase/migrations/00001_initial_schema.sql | Fixed |
| FIND-010 | Fixed consultation INSERT policy to verify doctor_id ownership: `WITH CHECK (EXISTS (SELECT 1 FROM doctors WHERE id = doctor_id AND user_id = auth.uid()));` -- prevents doctors from creating consultations attributed to other doctors. | supabase/migrations/00001_initial_schema.sql | Fixed |
| FIND-011 | Removed unused `revalidatePath` import from `src/app/actions/auth.ts`. | src/app/actions/auth.ts | Fixed |

---

## Files Modified

1. `supabase/migrations/00001_initial_schema.sql` -- Schema constraints, RLS policies, indexes
2. `src/app/actions/auth.ts` -- New signup Server Action with role validation
3. `src/app/(auth)/signup/page.tsx` -- Updated to use Server Action, removed client-side state
4. `src/types/database.ts` -- Aligned types with schema constraints

---

## Security Impact

- **FIND-001**: Signup flow was completely broken (missing INSERT policy). Now functional.
- **FIND-002**: Client-side role escalation vulnerability eliminated. Role is now validated server-side.
- **FIND-005**: PHI exposure risk mitigated. Doctors can no longer see all patients/consultations.
- **FIND-010**: Doctors can no longer create consultations attributed to other doctors.
- **FIND-008**: Admin-only delete enforcement on patients and consultations.

---

## Bugfix Round 2 (2026-07-06)

Fixed 1 Critical, 3 High, and 4 Medium findings from the re-review.

| Bug ID | Severity | Fix Description | Files Changed | Status |
|---|---|---|---|---|
| FIND-001 (R2) | Critical | Added Admin UPDATE policy on profiles: admins can now update any profile (role changes, name corrections). | supabase/migrations/00001_initial_schema.sql | Fixed |
| FIND-002 (R2) | High | Replaced deprecated `auth.role() = 'authenticated'` with `auth.uid() IS NOT NULL` in doctors SELECT policy. | supabase/migrations/00001_initial_schema.sql | Fixed |
| FIND-003 (R2) | High | Fixed self-signup role escalation: INSERT policy now restricts non-admin signups to `role = 'receptionist'` only. | supabase/migrations/00001_initial_schema.sql | Fixed |
| FIND-004 (R2) | High | Added `created_by = auth.uid()` validation to patients INSERT policy — audit trail integrity enforced. | supabase/migrations/00001_initial_schema.sql | Fixed |
| FIND-005 (R2) | Medium | Added explicit null checks on FormData values in signup Server Action — no more silent "null" strings. | src/app/actions/auth.ts | Fixed |
| FIND-006 (R2) | Medium | Updated cookie error comments to clarify they are safely ignorable (Server Component context). | src/lib/supabase/server.ts | Fixed |
| FIND-007 (R2) | Medium | Added security headers to next.config.js: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, X-XSS-Protection, poweredByHeader disabled. | next.config.js | Fixed |
| FIND-008 (R2) | Medium | Removed `user_id` from doctors.Update and `created_by` from patients.Update — these fields are now immutable after insert. | src/types/database.ts | Fixed |

### Round 2 Files Modified

1. `supabase/migrations/00001_initial_schema.sql` — Admin UPDATE policy, deprecated auth.role() fix, role-restricted INSERT, created_by validation
2. `src/app/actions/auth.ts` — FormData null checks
3. `src/lib/supabase/server.ts` — Clarified error handling comments
4. `next.config.js` — Security headers
5. `src/types/database.ts` — Immutable field types

### Round 2 Security Impact

- **Admin RBAC**: Admins can now manage all user roles — core RBAC requirement met.
- **Future-proofing**: Removed deprecated Supabase function call.
- **Self-signup hardened**: New users can only register as receptionist; admin/doctor roles require admin assignment.
- **Audit trail**: Patient creation attribution is now enforced at the database level.
- **Browser security**: Clickjacking, MIME sniffing, and XSS protections enabled via headers.
