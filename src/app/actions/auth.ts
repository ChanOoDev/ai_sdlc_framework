"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_SELF_REGISTER_ROLES = ["doctor", "receptionist"] as const;

export async function signup(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const fullName = formData.get("fullName");
  const role = formData.get("role");

  // Validate required fields
  if (typeof email !== "string" || !email) {
    return { error: "Email is required." };
  }
  if (typeof password !== "string" || !password) {
    return { error: "Password is required." };
  }
  if (typeof fullName !== "string" || !fullName.trim()) {
    return { error: "Full name is required." };
  }
  if (typeof role !== "string" || !role) {
    return { error: "Role is required." };
  }

  // Server-side role validation -- only doctor and receptionist allowed for self-registration
  if (!ALLOWED_SELF_REGISTER_ROLES.includes(role as typeof ALLOWED_SELF_REGISTER_ROLES[number])) {
    return { error: "Invalid role. Only doctor and receptionist can self-register." };
  }

  const supabase = createClient();

  // 1. Sign up the user via Supabase Auth
  // Profile is auto-created by the on_auth_user_created trigger in Supabase
  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  // Profile is auto-created by the on_auth_user_created trigger in Supabase
  redirect("/dashboard");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
