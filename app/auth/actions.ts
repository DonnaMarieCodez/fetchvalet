"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

type Role = "admin" | "worker" | "property";

async function loginByRole(formData: FormData, role: Role, successPath: string) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    redirect(`/${role}/login?error=missing`);
  }

  const supabase = await createClient();

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    redirect(`/${role}/login?error=invalid`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${role}/login?error=invalid`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== role) {
    await supabase.auth.signOut();
    redirect(`/${role}/login?error=unauthorized`);
  }

  if (role === "worker" && profile.status !== "approved") {
    redirect("/worker/status");
  }

  redirect(successPath);
}

export async function loginAdmin(formData: FormData) {
  await loginByRole(formData, "admin", "/admin");
}

export async function loginWorker(formData: FormData) {
  await loginByRole(formData, "worker", "/worker");
}

export async function loginProperty(formData: FormData) {
  await loginByRole(formData, "property", "/property");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}