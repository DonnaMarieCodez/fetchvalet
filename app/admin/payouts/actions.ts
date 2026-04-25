"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../src/lib/supabase/server";

export async function loginWorker(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/worker");
}

export async function loginAdmin(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin");
}

export async function loginProperty(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/property");
}

export async function signUpWorker(formData: FormData) {
  const supabase = await createClient();

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");

  if (!fullName || !email || !password) {
    throw new Error("Full name, email, and password are required.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "worker",
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  const userId = data.user?.id;

  if (userId) {
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
  }

  redirect("/worker/status");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}