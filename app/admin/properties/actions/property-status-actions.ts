"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/src/lib/supabase/admin";

async function updatePropertyStatus(propertyId: string, status: string) {
  if (!propertyId) {
    throw new Error("Missing property ID.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("properties")
    .update({ property_status: status })
    .eq("id", propertyId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${propertyId}`);
}

export async function activateProperty(formData: FormData) {
  await updatePropertyStatus(String(formData.get("propertyId") || ""), "active");
}

export async function suspendProperty(formData: FormData) {
  await updatePropertyStatus(
    String(formData.get("propertyId") || ""),
    "suspended"
  );
}