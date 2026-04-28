"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function updateProperty(formData: FormData) {
  const propertyId = String(formData.get("propertyId") || "").trim();

  const name = String(formData.get("name") || "").trim();
  const addressLine1 = String(formData.get("addressLine1") || "").trim();
  const addressLine2 = String(formData.get("addressLine2") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const zipCode = String(formData.get("zipCode") || "").trim();

  const propertyManagerName = String(
    formData.get("propertyManagerName") || ""
  ).trim();
  const contactPhone = String(formData.get("contactPhone") || "").trim();
  const contactEmail = String(formData.get("contactEmail") || "").trim();

  const accessNotes = String(formData.get("accessNotes") || "").trim();

  const serviceDays = formData
    .getAll("serviceDays")
    .map((value) => String(value).trim())
    .filter(Boolean)
    .join(",");

  const recyclingServiceDays = formData
    .getAll("recyclingServiceDays")
    .map((value) => String(value).trim())
    .filter(Boolean)
    .join(",");

  const pickupStartTime = String(formData.get("pickupStartTime") || "").trim();

  const requiresPhotoProof =
    String(formData.get("requiresPhotoProof") || "") === "on";

  const residentRemindersEnabled =
    String(formData.get("residentRemindersEnabled") || "") === "on";

  const autoGenerateRoutes =
    String(formData.get("autoGenerateRoutes") || "") === "on";

  const billingContactName = String(
    formData.get("billingContactName") || ""
  ).trim();
  const billingContactEmail = String(
    formData.get("billingContactEmail") || ""
  ).trim();

  const alternateContactName = String(
    formData.get("alternateContactName") || ""
  ).trim();
  const alternateContactPhone = String(
    formData.get("alternateContactPhone") || ""
  ).trim();

  const defaultRoutePayoutDollars = Number(
    formData.get("defaultRoutePayoutDollars") || 0
  );
  const monthlyBillingDollars = Number(
    formData.get("monthlyBillingDollars") || 0
  );
  const defaultMinimumWorkerScore = Number(
    formData.get("defaultMinimumWorkerScore") || 0
  );
  const maxUnitsPerRoute = Number(formData.get("maxUnitsPerRoute") || 150);

  const specialHandlingNotes = String(
    formData.get("specialHandlingNotes") || ""
  ).trim();

  if (!propertyId) {
    throw new Error("Missing property ID.");
  }

  if (!name || !addressLine1 || !city || !state) {
    throw new Error("Name, address, city, and state are required.");
  }

  if (Number.isNaN(defaultRoutePayoutDollars) || defaultRoutePayoutDollars < 0) {
    throw new Error("Default route payout must be a valid number.");
  }

  if (Number.isNaN(monthlyBillingDollars) || monthlyBillingDollars < 0) {
    throw new Error("Monthly billing amount must be a valid number.");
  }

  if (
    Number.isNaN(defaultMinimumWorkerScore) ||
    defaultMinimumWorkerScore < 0
  ) {
    throw new Error("Default minimum worker score must be a valid number.");
  }

  if (Number.isNaN(maxUnitsPerRoute) || maxUnitsPerRoute <= 0) {
    throw new Error("Max units per route must be a valid number.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("properties")
    .update({
      name,
      address_line_1: addressLine1,
      address_line_2: addressLine2 || null,
      city,
      state,
      zip_code: zipCode || null,
      property_manager_name: propertyManagerName || null,
      contact_phone: contactPhone || null,
      contact_email: contactEmail || null,
      access_notes: accessNotes || null,
      service_days: serviceDays || null,
      recycling_service_days: recyclingServiceDays || null,
      pickup_start_time: pickupStartTime || null,
      requires_photo_proof: requiresPhotoProof,
      resident_reminders_enabled: residentRemindersEnabled,
      auto_generate_routes: autoGenerateRoutes,
      billing_contact_name: billingContactName || null,
      billing_contact_email: billingContactEmail || null,
      alternate_contact_name: alternateContactName || null,
      alternate_contact_phone: alternateContactPhone || null,
      default_route_payout_cents: Math.round(defaultRoutePayoutDollars * 100),
      monthly_billing_cents: Math.round(monthlyBillingDollars * 100),
      default_minimum_worker_score: defaultMinimumWorkerScore,
      max_units_per_route: maxUnitsPerRoute,
      special_handling_notes: specialHandlingNotes || null,
    })
    .eq("id", propertyId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/admin/properties/${propertyId}`);
}