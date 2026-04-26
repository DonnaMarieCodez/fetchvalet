"use server";

import { createClient } from "../../../src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addBuilding(formData: FormData) {
  const supabase = await createClient();

  const propertyId = String(formData.get("propertyId"));
  const name = String(formData.get("name"));

  await supabase.from("buildings").insert({
    property_id: propertyId,
    name,
  });

  revalidatePath(`/admin/properties/${propertyId}`);
}

export async function addUnit(formData: FormData) {
  const supabase = await createClient();

  const buildingId = String(formData.get("buildingId"));
  const unitNumber = String(formData.get("unitNumber"));

  await supabase.from("units").insert({
    building_id: buildingId,
    unit_number: unitNumber,
    active: true,
  });

  revalidatePath("/admin/properties");
}

export async function generateUnits(formData: FormData) {
  const supabase = await createClient();

  const buildingId = String(formData.get("buildingId"));
  const start = Number(formData.get("start"));
  const end = Number(formData.get("end"));

  const units = [];

  for (let i = start; i <= end; i++) {
    units.push({
      building_id: buildingId,
      unit_number: String(i),
      active: true,
    });
  }

  await supabase.from("units").insert(units);

  revalidatePath("/admin/properties");
}