"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../src/lib/supabase/server";

async function signInAndRoute(
  email: string,
  password: string,
  expectedRole: "admin" | "worker" | "property",
  fallbackPath: string
) {
  const supabase = await createClient();

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    throw new Error("Email and password are required.");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPassword,
  });

  if (signInError) {
    throw new Error(signInError.message);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message || "Unable to load signed-in user.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message || "Profile not found.");
  }

  if (profile.role !== expectedRole) {
    await supabase.auth.signOut();
    throw new Error("You do not have access to this portal.");
  }

  if (expectedRole === "worker") {
    const workerStatus = String(profile.status || "pending").toLowerCase();

    if (workerStatus === "approved") {
      redirect("/worker");
    }

    redirect("/worker/status");
  }

  if (expectedRole === "property") {
    redirect("/property");
  }

  redirect(fallbackPath);
}

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  await signInAndRoute(email, password, "admin", "/admin");
}

export async function loginWorker(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  await signInAndRoute(email, password, "worker", "/worker");
}

export async function loginProperty(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  await signInAndRoute(email, password, "property", "/property");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}