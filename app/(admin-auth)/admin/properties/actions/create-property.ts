"use server";

import { createAdminClient } from "@/src/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function createProperty(formData: FormData) {
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
  const serviceDays = String(formData.get("serviceDays") || "").trim();
  const pickupStartTime = String(formData.get("pickupStartTime") || "").trim();
  const requiresPhotoProof =
    String(formData.get("requiresPhotoProof") || "") === "on";

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
  const defaultMinimumWorkerScore = Number(
    formData.get("defaultMinimumWorkerScore") || 0
  );

  const specialHandlingNotes = String(
    formData.get("specialHandlingNotes") || ""
  ).trim();

  const residentRemindersEnabled =
    String(formData.get("residentRemindersEnabled") || "") === "on";

  if (!name || !addressLine1 || !city || !state) {
    throw new Error("Name, address, city, and state are required.");
  }

  if (Number.isNaN(defaultRoutePayoutDollars)) {
    throw new Error("Default route payout must be a valid number.");
  }

  if (Number.isNaN(defaultMinimumWorkerScore)) {
    throw new Error("Default minimum worker score must be a valid number.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("properties").insert({
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
    pickup_start_time: pickupStartTime || null,
    requires_photo_proof: requiresPhotoProof,
    billing_contact_name: billingContactName || null,
    billing_contact_email: billingContactEmail || null,
    alternate_contact_name: alternateContactName || null,
    alternate_contact_phone: alternateContactPhone || null,
    default_route_payout_cents: Math.round(defaultRoutePayoutDollars * 100),
    default_minimum_worker_score: defaultMinimumWorkerScore,
    special_handling_notes: specialHandlingNotes || null,
    resident_reminders_enabled: residentRemindersEnabled,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin/properties");
}
