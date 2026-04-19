"use server";

import { createClient } from "../../../src/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUpWorker(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  if (!fullName || !email || !password) {
    throw new Error("Full name, email, and password are required.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  const userId = data.user?.id;

  if (userId) {
    const displayNameParts = fullName.trim().split(" ");
    const firstName = displayNameParts[0] || "Worker";
    const lastInitial = displayNameParts.length > 1
      ? `${displayNameParts[displayNameParts.length - 1][0]}.`
      : "";
    const displayName = `${firstName} ${lastInitial}`.trim();

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      display_name: displayName,
      phone,
      role: "worker",
      worker_status: "pending",
      worker_score: 85,
    });

    if (profileError) {
      throw new Error(profileError.message);
    }
  }

  redirect("/worker/status");
}

export async function loginWorker(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/worker");
}

export async function logoutWorker() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
