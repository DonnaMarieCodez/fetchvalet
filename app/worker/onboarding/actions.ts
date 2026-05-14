"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export async function completeWorkerOnboarding(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/worker/login");
  }

  const addressLine1 = String(formData.get("addressLine1") || "").trim();
  const addressLine2 = String(formData.get("addressLine2") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const zipCode = String(formData.get("zipCode") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const emergencyContactName = String(
    formData.get("emergencyContactName") || ""
  ).trim();
  const emergencyContactPhone = String(
    formData.get("emergencyContactPhone") || ""
  ).trim();

  const backgroundCheckConsent =
    String(formData.get("backgroundCheckConsent") || "") === "on";

  if (!addressLine1 || !city || !state || !zipCode || !phone) {
    throw new Error("Address and phone are required.");
  }

  if (!backgroundCheckConsent) {
    throw new Error("Background check consent is required.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      address_line_1: addressLine1,
      address_line_2: addressLine2 || null,
      city,
      state,
      zip_code: zipCode,
      phone,
      emergency_contact_name: emergencyContactName || null,
      emergency_contact_phone: emergencyContactPhone || null,
      background_check_consent: true,
      background_check_status: "pending",
      stripe_onboarding_status: "not_started",
      worker_onboarding_completed: true,
      status: "active",
    })
    .eq("id", user.id)
    .eq("role", "worker");

  if (error) {
    throw new Error(error.message);
  }

  redirect("/worker/status");
}