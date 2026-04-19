"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../src/lib/supabase/server";

export async function loginProperty(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/property");
}

export async function logoutProperty() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/property/login");
}