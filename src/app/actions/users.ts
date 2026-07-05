"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type UserRole = Database["public"]["Enums"]["user_role"];

/**
 * Fetch all user profiles. Only accessible to admin users via RLS.
 */
export async function getUsers() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Update a user's role. Only accessible to admin users via RLS.
 */
export async function updateUserRole(userId: string, newRole: UserRole) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  const validRoles: readonly UserRole[] = ["admin", "doctor", "receptionist"];
  if (!validRoles.includes(newRole)) {
    return { error: "Invalid role." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}
