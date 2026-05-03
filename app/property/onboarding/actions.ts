"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/src/lib/supabase/admin";

function dollarsToCents(value: number) {
  return Math.round(value * 100);
}

export async function createPropertyOnboarding(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const addressLine1 = String(formData.get("addressLine1") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const zipCode = String(formData.get("zipCode") || "").trim();

  const pickupStartTime = String(formData.get("pickupStartTime") || "20:00").trim();

  const propertyManagerName = String(
    formData.get("propertyManagerName") || ""
  ).trim();
  const contactEmail = String(formData.get("contactEmail") || "").trim();
  const contactPhone = String(formData.get("contactPhone") || "").trim();

  const billingContactName = String(
    formData.get("billingContactName") || ""
  ).trim();
  const alternateContactName = String(
    formData.get("alternateContactName") || ""
  ).trim();

  const numberOfUnits = Number(formData.get("numberOfUnits") || 0);
  const numberOfBuildings = Number(formData.get("numberOfBuildings") || 0);

  const serviceDays = formData
    .getAll("serviceDays")
    .map((day) => String(day).trim())
    .filter(Boolean)
    .join(",");

  const accessNotes = String(formData.get("accessNotes") || "").trim();
  const specialHandlingNotes = String(
    formData.get("specialHandlingNotes") || ""
  ).trim();

  const requiresPhotoProof =
    String(formData.get("requiresPhotoProof") || "") === "on";

  const autoGenerateRoutes =
    String(formData.get("autoGenerateRoutes") || "") === "on";

  if (!name || !addressLine1 || !city || !state) {
    throw new Error("Property name, address, city, and state are required.");
  }

  if (!/^\d{2}:\d{2}$/.test(pickupStartTime)) {
    throw new Error("Pickup time must be a valid time.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("properties").insert({
    name,
    address_line_1: addressLine1,
    city,
    state,
    zip_code: zipCode || null,

    pickup_start_time: pickupStartTime,
    property_manager_name: propertyManagerName || null,
    contact_email: contactEmail || null,
    contact_phone: contactPhone || null,
    billing_contact_name: billingContactName || null,
    alternate_contact_name: alternateContactName || null,

    number_of_units: Number.isNaN(numberOfUnits) ? null : numberOfUnits,
    number_of_buildings: Number.isNaN(numberOfBuildings)
      ? null
      : numberOfBuildings,

    service_days: serviceDays || null,
    access_notes: accessNotes || null,
    special_handling_notes: specialHandlingNotes || null,

    requires_photo_proof: requiresPhotoProof,
    auto_generate_routes: autoGenerateRoutes,

    monthly_billing_cents: dollarsToCents(0),
    default_route_payout_cents: dollarsToCents(0),
    default_minimum_worker_score: 0,
    property_status: "pending",
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/property/onboarding/success");
}