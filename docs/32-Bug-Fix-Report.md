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
