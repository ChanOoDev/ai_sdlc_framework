"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];

/**
 * Fetch all patients. RLS filters by role:
 * - Admins and receptionists see all patients they created
 * - Doctors see only patients with consultations they own
 */
export async function getPatients() {
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
    .select("id, name, email, phone, date_of_birth, address, created_by, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Search patients by name, email, or phone.
 * RLS filters by role.
 */
export async function searchPatients(query: string) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  if (!query || query.trim().length === 0) {
    return { data: [] };
  }

  const searchTerm = query.trim();

  const { data, error } = await supabase
    .from("patients")
    .select("id, name, email, phone, date_of_birth, address, created_by, created_at, updated_at")
    .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Fetch a single patient by ID.
 */
export async function getPatient(id: string) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  if (!id || typeof id !== "string") {
    return { error: "Patient ID is required." };
  }

  const { data, error } = await supabase
    .from("patients")
    .select("id, name, email, phone, date_of_birth, address, created_by, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Create a new patient record. Only accessible to admin and receptionist via RLS.
 * Sets created_by to the current authenticated user.
 */
export async function createPatient(
  data: Omit<PatientInsert, "id" | "created_by" | "created_at" | "updated_at">
) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  // Server-side validation
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    return { error: "Name is required." };
  }
  if (data.name.length > 255) {
    return { error: "Name must be 255 characters or less." };
  }
  if (data.email !== undefined && data.email !== null) {
    if (typeof data.email !== "string" || data.email.trim().length === 0) {
      return { error: "Email cannot be empty." };
    }
    if (data.email.length > 255) {
      return { error: "Email must be 255 characters or less." };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { error: "Invalid email format." };
    }
  }
  if (data.phone !== undefined && data.phone !== null) {
    if (typeof data.phone !== "string" || data.phone.trim().length === 0) {
      return { error: "Phone cannot be empty." };
    }
    if (data.phone.length > 50) {
      return { error: "Phone must be 50 characters or less." };
    }
  }
  if (data.date_of_birth !== undefined && data.date_of_birth !== null) {
    if (typeof data.date_of_birth !== "string") {
      return { error: "Date of birth must be a valid date string (YYYY-MM-DD)." };
    }
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(data.date_of_birth)) {
      return { error: "Date of birth must be in YYYY-MM-DD format." };
    }
  }
  if (data.address !== undefined && data.address !== null) {
    if (typeof data.address !== "string" || data.address.trim().length === 0) {
      return { error: "Address cannot be empty." };
    }
    if (data.address.length > 500) {
      return { error: "Address must be 500 characters or less." };
    }
  }

  const insertData: PatientInsert = {
    name: data.name.trim(),
    created_by: user.id,
  };

  if (data.email !== undefined && data.email !== null) {
    insertData.email = data.email.trim();
  }
  if (data.phone !== undefined && data.phone !== null) {
    insertData.phone = data.phone.trim();
  }
  if (data.date_of_birth !== undefined && data.date_of_birth !== null) {
    insertData.date_of_birth = data.date_of_birth;
  }
  if (data.address !== undefined && data.address !== null) {
    insertData.address = data.address.trim();
  }

  const { error } = await supabase.from("patients").insert(insertData);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/patients");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Update a patient record. Only accessible to admin and receptionist via RLS.
 */
export async function updatePatient(id: string, data: PatientUpdate) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  if (!id || typeof id !== "string") {
    return { error: "Patient ID is required." };
  }

  // Server-side validation for provided fields
  if (data.name !== undefined) {
    if (typeof data.name !== "string" || data.name.trim().length === 0) {
      return { error: "Name cannot be empty." };
    }
    if (data.name.length > 255) {
      return { error: "Name must be 255 characters or less." };
    }
  }
  if (data.email !== undefined && data.email !== null) {
    if (typeof data.email !== "string" || data.email.trim().length === 0) {
      return { error: "Email cannot be empty." };
    }
    if (data.email.length > 255) {
      return { error: "Email must be 255 characters or less." };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { error: "Invalid email format." };
    }
  }
  if (data.phone !== undefined && data.phone !== null) {
    if (typeof data.phone !== "string" || data.phone.trim().length === 0) {
      return { error: "Phone cannot be empty." };
    }
    if (data.phone.length > 50) {
      return { error: "Phone must be 50 characters or less." };
    }
  }
  if (data.date_of_birth !== undefined && data.date_of_birth !== null) {
    if (typeof data.date_of_birth !== "string") {
      return { error: "Date of birth must be a valid date string (YYYY-MM-DD)." };
    }
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(data.date_of_birth)) {
      return { error: "Date of birth must be in YYYY-MM-DD format." };
    }
  }
  if (data.address !== undefined && data.address !== null) {
    if (typeof data.address !== "string" || data.address.trim().length === 0) {
      return { error: "Address cannot be empty." };
    }
    if (data.address.length > 500) {
      return { error: "Address must be 500 characters or less." };
    }
  }

  const updateData: PatientUpdate = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.email !== undefined) updateData.email = data.email !== null ? data.email.trim() : null;
  if (data.phone !== undefined) updateData.phone = data.phone !== null ? data.phone.trim() : null;
  if (data.date_of_birth !== undefined) updateData.date_of_birth = data.date_of_birth;
  if (data.address !== undefined) updateData.address = data.address !== null ? data.address.trim() : null;

  const { error } = await supabase
    .from("patients")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/patients");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Delete a patient record. Only accessible to admin via RLS.
 */
export async function deletePatient(id: string) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  if (!id || typeof id !== "string") {
    return { error: "Patient ID is required." };
  }

  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/patients");
  revalidatePath("/dashboard");
  return { success: true };
}
