"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type DoctorInsert = Database["public"]["Tables"]["doctors"]["Insert"];
type DoctorUpdate = Database["public"]["Tables"]["doctors"]["Update"];

/**
 * Fetch all doctors. Only accessible to admin users via RLS.
 */
export async function getDoctors() {
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
    .select("id, user_id, name, specialty, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Fetch a single doctor by ID. Only accessible to admin users via RLS.
 */
export async function getDoctor(id: string) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  if (!id || typeof id !== "string") {
    return { error: "Doctor ID is required." };
  }

  const { data, error } = await supabase
    .from("doctors")
    .select("id, user_id, name, specialty, created_at")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Create a new doctor record. Only accessible to admin users via RLS.
 */
export async function createDoctor(data: Omit<DoctorInsert, "id" | "created_at">) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  // Server-side validation
  if (!data.user_id || typeof data.user_id !== "string") {
    return { error: "User ID is required." };
  }
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    return { error: "Name is required." };
  }
  if (data.name.length > 255) {
    return { error: "Name must be 255 characters or less." };
  }
  if (!data.specialty || typeof data.specialty !== "string" || data.specialty.trim().length === 0) {
    return { error: "Specialty is required." };
  }
  if (data.specialty.length > 255) {
    return { error: "Specialty must be 255 characters or less." };
  }

  const { error } = await supabase.from("doctors").insert({
    user_id: data.user_id,
    name: data.name.trim(),
    specialty: data.specialty.trim(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/doctors");
  return { success: true };
}

/**
 * Update a doctor record. Only accessible to admin users via RLS.
 */
export async function updateDoctor(id: string, data: DoctorUpdate) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  if (!id || typeof id !== "string") {
    return { error: "Doctor ID is required." };
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
  if (data.specialty !== undefined) {
    if (typeof data.specialty !== "string" || data.specialty.trim().length === 0) {
      return { error: "Specialty cannot be empty." };
    }
    if (data.specialty.length > 255) {
      return { error: "Specialty must be 255 characters or less." };
    }
  }

  const updateData: DoctorUpdate = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.specialty !== undefined) updateData.specialty = data.specialty.trim();

  const { error } = await supabase
    .from("doctors")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/doctors");
  return { success: true };
}

/**
 * Delete a doctor record. Only accessible to admin users via RLS.
 */
export async function deleteDoctor(id: string) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  if (!id || typeof id !== "string") {
    return { error: "Doctor ID is required." };
  }

  const { error } = await supabase
    .from("doctors")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/doctors");
  return { success: true };
}
