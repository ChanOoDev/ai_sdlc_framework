-- Fix infinite recursion in RLS policies
-- All role-check policies were querying profiles from within their own table policies
-- Solution: use auth.jwt() to read role from the token instead

-- ===================== PROFILES =====================
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING ((auth.jwt() ->> 'role') = 'admin' OR auth.uid() = id);

-- ===================== DOCTORS =====================
DROP POLICY IF EXISTS "Admins can manage doctors" ON doctors;

CREATE POLICY "Admins can manage doctors"
  ON doctors FOR ALL
  USING ((auth.jwt() ->> 'role') = 'admin');

-- ===================== PATIENTS =====================
DROP POLICY IF EXISTS "Doctors can view own patients" ON patients;
DROP POLICY IF EXISTS "Receptionists can view all patients" ON patients;
DROP POLICY IF EXISTS "Admins can view all patients" ON patients;
DROP POLICY IF EXISTS "Admins and receptionists can insert patients" ON patients;
DROP POLICY IF EXISTS "Admins and receptionists can update patients" ON patients;
DROP POLICY IF EXISTS "Admins can delete patients" ON patients;

CREATE POLICY "Doctors can view own patients"
  ON patients FOR SELECT
  USING (
    (auth.jwt() ->> 'role') = 'doctor'
    AND EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.patient_id = patients.id
      AND consultations.doctor_id IN (
        SELECT id FROM doctors WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Receptionists can view all patients"
  ON patients FOR SELECT
  USING ((auth.jwt() ->> 'role') = 'receptionist');

CREATE POLICY "Admins can view all patients"
  ON patients FOR SELECT
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins and receptionists can insert patients"
  ON patients FOR INSERT
  WITH CHECK (
    (auth.jwt() ->> 'role') IN ('admin', 'receptionist')
    AND created_by = auth.uid()
  );

CREATE POLICY "Admins and receptionists can update patients"
  ON patients FOR UPDATE
  USING ((auth.jwt() ->> 'role') IN ('admin', 'receptionist'));

CREATE POLICY "Admins can delete patients"
  ON patients FOR DELETE
  USING ((auth.jwt() ->> 'role') = 'admin');

-- ===================== CONSULTATIONS =====================
DROP POLICY IF EXISTS "Receptionists can view all consultations" ON consultations;
DROP POLICY IF EXISTS "Admins can view all consultations" ON consultations;
DROP POLICY IF EXISTS "Admins can delete consultations" ON consultations;

CREATE POLICY "Receptionists can view all consultations"
  ON consultations FOR SELECT
  USING ((auth.jwt() ->> 'role') = 'receptionist');

CREATE POLICY "Admins can view all consultations"
  ON consultations FOR SELECT
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can delete consultations"
  ON consultations FOR DELETE
  USING ((auth.jwt() ->> 'role') = 'admin');
