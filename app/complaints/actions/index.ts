"use server";

import { createClient } from "../../../src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitComplaint(formData: FormData) {
  const propertyId = formData.get("propertyId") as string;
  const workerId = formData.get("workerId") as string;
  const residentName = formData.get("residentName") as string;
  const residentEmail = formData.get("residentEmail") as string;
  const residentPhone = formData.get("residentPhone") as string;
  const buildingName = formData.get("buildingName") as string;
  const unitNumber = formData.get("unitNumber") as string;
  const complaintType = formData.get("complaintType") as string;
  const description = formData.get("description") as string;

  if (!residentName || !complaintType || !description) {
    throw new Error("Name, complaint type, and description are required.");
  }

  const supabase = await createClient();

  const { error } = await supabase.from("complaints").insert({
    property_id: propertyId || null,
    worker_id: workerId || null,
    resident_name: residentName,
    resident_email: residentEmail || null,
    resident_phone: residentPhone || null,
    building_name: buildingName || null,
    unit_number: unitNumber || null,
    complaint_type: complaintType,
    description,
    status: "new",
    complaint_outcome: "pending",
    score_impact: 0,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/complaints");
  revalidatePath("/admin/complaints");
}

export async function updateComplaintStatus(formData: FormData) {
  const complaintId = formData.get("complaintId") as string;
  const status = formData.get("status") as string;

  if (!complaintId || !status) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("complaints")
    .update({ status })
    .eq("id", complaintId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/complaints");
}

export async function saveResolutionNotes(formData: FormData) {
  const complaintId = formData.get("complaintId") as string;
  const resolutionNotes = formData.get("resolutionNotes") as string;

  if (!complaintId) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("complaints")
    .update({ resolution_notes: resolutionNotes || null })
    .eq("id", complaintId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/complaints");
}
