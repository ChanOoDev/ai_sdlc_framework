"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ConsultationInsert = Database["public"]["Tables"]["consultations"]["Insert"];
type ConsultationUpdate = Database["public"]["Tables"]["consultations"]["Update"];

/**
 * Fetch consultations. RLS filters:
 * - Doctors see only their own consultations
 * - Receptionists see all consultations (read-only)
 * - Admins see all consultations
 * Joins patient name and doctor name for display.
 */
export async function getConsultations() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("consultations")
    .select(
      "id, doctor_id, patient_id, notes, diagnosis, prescription, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  if (!data || data.length === 0) {
    return { data: [] };
  }

  // Collect unique doctor_ids and patient_ids
  const doctorIds = [...new Set(data.map((c) => c.doctor_id))];
  const patientIds = [...new Set(data.map((c) => c.patient_id))];

  // Fetch doctor names
  const { data: doctorsData } = await supabase
    .from("doctors")
    .select("id, name")
    .in("id", doctorIds);

  // Fetch patient names
  const { data: patientsData } = await supabase
    .from("patients")
    .select("id, name")
    .in("id", patientIds);

  const doctorMap = new Map(
    (doctorsData ?? []).map((d) => [d.id, d.name])
  );
  const patientMap = new Map(
    (patientsData ?? []).map((p) => [p.id, p.name])
  );

  const enriched = data.map((c) => ({
    ...c,
    doctor_name: doctorMap.get(c.doctor_id) ?? "Unknown Doctor",
    patient_name: patientMap.get(c.patient_id) ?? "Unknown Patient",
  }));

  return { data: enriched };
}

/**
 * Fetch a single consultation by ID.
 * Joins patient name and doctor name.
 */
export async function getConsultation(id: string) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  if (!id || typeof id !== "string") {
    return { error: "Consultation ID is required." };
  }

  const { data, error } = await supabase
    .from("consultations")
    .select(
      "id, doctor_id, patient_id, notes, diagnosis, prescription, created_at, updated_at"
    )
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  // Fetch doctor name
  const { data: doctorData } = await supabase
    .from("doctors")
    .select("name")
    .eq("id", data.doctor_id)
    .single();

  // Fetch patient name
  const { data: patientData } = await supabase
    .from("patients")
    .select("name")
    .eq("id", data.patient_id)
    .single();

  return {
    data: {
      ...data,
      doctor_name: doctorData?.name ?? "Unknown Doctor",
      patient_name: patientData?.name ?? "Unknown Patient",
    },
  };
}

/**
 * Create a new consultation. Doctors only.
 * Verifies the doctor_id matches the authenticated user's doctor record.
 */
export async function createConsultation(
  data: Omit<ConsultationInsert, "id" | "created_at" | "updated_at">
) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  // Get the user's profile to verify they are a doctor
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "Could not verify user profile." };
  }

  if (profile.role !== "doctor") {
    return { error: "Only doctors can create consultations." };
  }

  // Verify doctor_id matches the authenticated user's doctor record
  const { data: doctorRecord, error: doctorError } = await supabase
    .from("doctors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (doctorError || !doctorRecord) {
    return { error: "No doctor record found for this user." };
  }

  if (data.doctor_id !== doctorRecord.id) {
    return { error: "You can only create consultations for your own doctor record." };
  }

  // Server-side validation
  if (!data.patient_id || typeof data.patient_id !== "string") {
    return { error: "Patient is required." };
  }
  if (!data.notes || typeof data.notes !== "string" || data.notes.trim().length === 0) {
    return { error: "Notes are required." };
  }
  if (data.notes.length > 10000) {
    return { error: "Notes must be 10,000 characters or less." };
  }
  if (data.diagnosis !== undefined && data.diagnosis !== null) {
    if (typeof data.diagnosis !== "string") {
      return { error: "Diagnosis must be a string." };
    }
    if (data.diagnosis.length > 5000) {
      return { error: "Diagnosis must be 5,000 characters or less." };
    }
  }
  if (data.prescription !== undefined && data.prescription !== null) {
    if (typeof data.prescription !== "string") {
      return { error: "Prescription must be a string." };
    }
    if (data.prescription.length > 5000) {
      return { error: "Prescription must be 5,000 characters or less." };
    }
  }

  const insertData: ConsultationInsert = {
    doctor_id: data.doctor_id,
    patient_id: data.patient_id,
    notes: data.notes.trim(),
  };

  if (data.diagnosis !== undefined && data.diagnosis !== null) {
    insertData.diagnosis = data.diagnosis.trim();
  }
  if (data.prescription !== undefined && data.prescription !== null) {
    insertData.prescription = data.prescription.trim();
  }

  const { error } = await supabase.from("consultations").insert(insertData);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/consultations");
  revalidatePath(`/dashboard/patients/${data.patient_id}`);
  return { success: true };
}

/**
 * Update a consultation. Doctors can update their own consultations.
 */
export async function updateConsultation(id: string, data: ConsultationUpdate) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  if (!id || typeof id !== "string") {
    return { error: "Consultation ID is required." };
  }

  // Server-side validation for provided fields
  if (data.notes !== undefined) {
    if (typeof data.notes !== "string" || data.notes.trim().length === 0) {
      return { error: "Notes cannot be empty." };
    }
    if (data.notes.length > 10000) {
      return { error: "Notes must be 10,000 characters or less." };
    }
  }
  if (data.diagnosis !== undefined && data.diagnosis !== null) {
    if (typeof data.diagnosis !== "string") {
      return { error: "Diagnosis must be a string." };
    }
    if (data.diagnosis.length > 5000) {
      return { error: "Diagnosis must be 5,000 characters or less." };
    }
  }
  if (data.prescription !== undefined && data.prescription !== null) {
    if (typeof data.prescription !== "string") {
      return { error: "Prescription must be a string." };
    }
    if (data.prescription.length > 5000) {
      return { error: "Prescription must be 5,000 characters or less." };
    }
  }

  const updateData: ConsultationUpdate = {};
  if (data.notes !== undefined) updateData.notes = data.notes.trim();
  if (data.diagnosis !== undefined)
    updateData.diagnosis = data.diagnosis !== null ? data.diagnosis.trim() : null;
  if (data.prescription !== undefined)
    updateData.prescription = data.prescription !== null ? data.prescription.trim() : null;

  // Fetch consultation to get patient_id for revalidation
  const { data: existing } = await supabase
    .from("consultations")
    .select("patient_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("consultations")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/consultations");
  revalidatePath(`/dashboard/consultations/${id}/edit`);
  if (existing?.patient_id) {
    revalidatePath(`/dashboard/patients/${existing.patient_id}`);
  }
  return { success: true };
}

/**
 * Delete a consultation. Admin only via RLS.
 */
export async function deleteConsultation(id: string) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  if (!id || typeof id !== "string") {
    return { error: "Consultation ID is required." };
  }

  // Fetch consultation to get patient_id for revalidation
  const { data: existing } = await supabase
    .from("consultations")
    .select("patient_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("consultations")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/consultations");
  if (existing?.patient_id) {
    revalidatePath(`/dashboard/patients/${existing.patient_id}`);
  }
  return { success: true };
}

/**
 * Fetch consultations for a specific patient, ordered by date (newest first).
 * Joins doctor name for display.
 */
export async function getConsultationsByPatient(patientId: string) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  if (!patientId || typeof patientId !== "string") {
    return { error: "Patient ID is required." };
  }

  const { data, error } = await supabase
    .from("consultations")
    .select(
      "id, doctor_id, patient_id, notes, diagnosis, prescription, created_at, updated_at"
    )
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  if (!data || data.length === 0) {
    return { data: [] };
  }

  // Fetch doctor names
  const doctorIds = [...new Set(data.map((c) => c.doctor_id))];
  const { data: doctorsData } = await supabase
    .from("doctors")
    .select("id, name")
    .in("id", doctorIds);

  const doctorMap = new Map(
    (doctorsData ?? []).map((d) => [d.id, d.name])
  );

  const enriched = data.map((c) => ({
    ...c,
    doctor_name: doctorMap.get(c.doctor_id) ?? "Unknown Doctor",
  }));

  return { data: enriched };
}

/**
 * Fetch all patients for dropdown selection.
 */
export async function getPatientsForDropdown() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("patients")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Fetch all doctors for dropdown selection.
 */
export async function getDoctorsForDropdown() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("doctors")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { data };
}
