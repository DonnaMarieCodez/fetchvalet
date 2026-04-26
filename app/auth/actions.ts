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
  if (expectedRole === "admin") {
    redirect("/admin/login?error=invalid");
  }

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

  if (expectedRole === "admin") {
    redirect("/admin/login?error=invalid");
  }

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

export async function signUpWorker(formData: FormData) {
  const supabase = await createClient();

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!fullName || !email || !password) {
    throw new Error("Full name, email, and password are required.");
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "worker",
      },
    },
  });

if (signUpError) {
  const message = signUpError.message.toLowerCase();

  if (message.includes("already registered")) {
    redirect("/signup/worker?error=already_registered");
  }

  redirect("/signup/worker?error=signup_failed");
}

  const userId = signUpData.user?.id;

  if (!userId) {
    redirect("/worker/onboarding");
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    email,
    phone: phone || null,
    role: "worker",
    status: "pending",
    worker_score: 75,
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  redirect("/worker/status");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}