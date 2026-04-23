"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../src/lib/supabase/server";

function parseCurrencyToCents(value: string) {
  const amount = Number(value);
  if (Number.isNaN(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

function normalizeServiceDays(formData: FormData) {
  const values = formData.getAll("serviceDays").map(String);
  return values.filter(Boolean);
}

export async function submitPropertyOnboarding(formData: FormData) {
  const supabase = await createClient();

  const propertyName = String(formData.get("propertyName") || "").trim();
  const addressLine1 = String(formData.get("addressLine1") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const zip = String(formData.get("zip") || "").trim();

  const managerName = String(formData.get("managerName") || "").trim();
  const managerEmail = String(formData.get("managerEmail") || "").trim().toLowerCase();
  const managerPhone = String(formData.get("managerPhone") || "").trim();

  const billingContact = String(formData.get("billingContact") || "").trim();
  const alternateContact = String(formData.get("alternateContact") || "").trim();

  const units = Number(formData.get("units") || 0);
  const buildings = Number(formData.get("buildings") || 1);
  const monthlyBillingDollars = String(formData.get("monthlyBillingDollars") || "").trim();
  const routePayoutDollars = String(formData.get("routePayoutDollars") || "").trim();

  const pickupTime = String(formData.get("pickupTime") || "").trim();
  const accessNotes = String(formData.get("accessNotes") || "").trim();
  const specialHandling = String(formData.get("specialHandling") || "").trim();

  const requiresPhotoProof = formData.get("requiresPhotoProof") === "on";
  const autoGenerateRoutes = formData.get("autoGenerateRoutes") === "on";
  const recyclingEnabled = formData.get("recyclingEnabled") === "on";
  const recyclingDay = String(formData.get("recyclingDay") || "").trim();
  const serviceDays = normalizeServiceDays(formData);

  if (!propertyName || !addressLine1 || !city || !state || !managerName || !managerEmail) {
    throw new Error("Property name, address, city, state, manager name, and manager email are required.");
  }

  if (serviceDays.length === 0) {
    throw new Error("Select at least one service day.");
  }

  if (units <= 0) {
    throw new Error("Units must be greater than 0.");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || "You must be logged in to complete onboarding.");
  }

  const monthlyBillingCents = parseCurrencyToCents(monthlyBillingDollars);
  const routePayoutCents = parseCurrencyToCents(routePayoutDollars);

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .insert({
      name: propertyName,
      address_line_1: addressLine1,
      city,
      state,
      zip,
      manager_name: managerName,
      manager_email: managerEmail,
      manager_phone: managerPhone || null,
      billing_contact: billingContact || null,
      alternate_contact: alternateContact || null,
      unit_count: units,
      building_count: buildings > 0 ? buildings : 1,
      monthly_billing_cents: monthlyBillingCents,
      route_payout_cents: routePayoutCents,
      pickup_time: pickupTime || null,
      access_notes: accessNotes || null,
      special_handling: specialHandling || null,
      requires_photo_proof: requiresPhotoProof,
      auto_generate_routes: autoGenerateRoutes,
      service_days: serviceDays,
      recycling_enabled: recyclingEnabled,
      recycling_day: recyclingEnabled && recyclingDay ? recyclingDay : null,
      property_status: "active",
    })
    .select("id")
    .single();

  if (propertyError || !property) {
    throw new Error(propertyError?.message || "Failed to create property.");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      role: "property",
      property_id: property.id,
      full_name: managerName,
      email: managerEmail,
      phone: managerPhone || null,
      status: "approved",
    })
    .eq("id", user.id);

  if (profileError) {
    throw new Error(profileError.message);
  }

  redirect("/property");
}