"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/src/lib/supabase/admin";

function propertySetupPath(propertyId: string) {
  return `/admin/properties/edit?id=${propertyId}`;
}

async function refreshPropertyCounts(propertyId: string) {
  const supabase = createAdminClient();

  const { count: buildingCount } = await supabase
    .from("buildings")
    .select("*", { count: "exact", head: true })
    .eq("property_id", propertyId);

  const { data: buildings } = await supabase
    .from("buildings")
    .select("id")
    .eq("property_id", propertyId);

  const buildingIds = (buildings ?? []).map((building) => building.id);

  let unitCount = 0;

  if (buildingIds.length > 0) {
    const { count } = await supabase
      .from("units")
      .select("*", { count: "exact", head: true })
      .in("building_id", buildingIds);

    unitCount = count ?? 0;
  }

  await supabase
    .from("properties")
    .update({
      number_of_buildings: buildingCount ?? 0,
      number_of_units: unitCount,
    })
    .eq("id", propertyId);
}

async function refresh(propertyId: string) {
  await refreshPropertyCounts(propertyId);
  revalidatePath("/admin/properties");
  revalidatePath("/admin/properties/edit");
  revalidatePath(propertySetupPath(propertyId));
}

export async function createBuilding(formData: FormData) {
  const supabase = createAdminClient();

  const propertyId = String(formData.get("propertyId") || "").trim();

  // accepts either name or buildingName so it will not crash
  const name = String(
    formData.get("name") || formData.get("buildingName") || ""
  ).trim();

  if (!propertyId || !name) {
    throw new Error("Property and building name are required.");
  }

  const { error } = await supabase.from("buildings").insert({
    property_id: propertyId,
    name,
  });

  if (error) {
    throw new Error(error.message);
  }

  await refresh(propertyId);
}

export async function updateBuilding(formData: FormData) {
  const supabase = createAdminClient();

  const propertyId = String(formData.get("propertyId") || "").trim();
  const buildingId = String(formData.get("buildingId") || "").trim();
  const name = String(formData.get("name") || "").trim();

  if (!propertyId || !buildingId || !name) {
    throw new Error("Property, building, and name are required.");
  }

  const { error } = await supabase
    .from("buildings")
    .update({ name })
    .eq("id", buildingId);

  if (error) {
    throw new Error(error.message);
  }

  await refresh(propertyId);
}

export async function deleteBuilding(formData: FormData) {
  const supabase = createAdminClient();

  const propertyId = String(formData.get("propertyId") || "").trim();
  const buildingId = String(formData.get("buildingId") || "").trim();

  if (!propertyId || !buildingId) {
    throw new Error("Property and building are required.");
  }

  const { error: unitDeleteError } = await supabase
    .from("units")
    .delete()
    .eq("building_id", buildingId);

  if (unitDeleteError) {
    throw new Error(unitDeleteError.message);
  }

  const { error: buildingDeleteError } = await supabase
    .from("buildings")
    .delete()
    .eq("id", buildingId);

  if (buildingDeleteError) {
    throw new Error(buildingDeleteError.message);
  }

  await refresh(propertyId);
}

export async function createUnits(formData: FormData) {
  const supabase = createAdminClient();

  const propertyId = String(formData.get("propertyId") || "").trim();
  const buildingId = String(formData.get("buildingId") || "").trim();
  const unitsRaw = String(formData.get("units") || "").trim();
  const floor = String(formData.get("floor") || "").trim();

  if (!propertyId || !buildingId || !unitsRaw) {
    throw new Error("Property, building, and units are required.");
  }

  const units = unitsRaw
    .split(",")
    .map((unit) => unit.trim())
    .filter(Boolean)
    .map((unit) => ({
      building_id: buildingId,
      unit_number: unit,
      floor: floor || null,
      active: true,
    }));

  if (units.length === 0) {
    throw new Error("No valid units provided.");
  }

  const { error } = await supabase.from("units").insert(units);

  if (error) {
    throw new Error(error.message);
  }

  await refresh(propertyId);
}

export async function generateUnits(formData: FormData) {
  const supabase = createAdminClient();

  const propertyId = String(formData.get("propertyId") || "").trim();
  const buildingId = String(formData.get("buildingId") || "").trim();
  const startFloor = Number(formData.get("startFloor") || 1);
  const floorCount = Number(formData.get("floorCount") || 0);
  const unitsPerFloor = Number(formData.get("unitsPerFloor") || 0);

  if (!propertyId || !buildingId) {
    throw new Error("Property and building are required.");
  }

  if (
    Number.isNaN(startFloor) ||
    Number.isNaN(floorCount) ||
    Number.isNaN(unitsPerFloor) ||
    floorCount <= 0 ||
    unitsPerFloor <= 0
  ) {
    throw new Error("Enter valid floor and unit counts.");
  }

  const unitsToInsert: {
    building_id: string;
    unit_number: string;
    floor: string;
    active: boolean;
  }[] = [];

  for (let floorOffset = 0; floorOffset < floorCount; floorOffset++) {
    const floorNumber = startFloor + floorOffset;

    for (let unitIndex = 1; unitIndex <= unitsPerFloor; unitIndex++) {
      const paddedUnit = String(unitIndex).padStart(2, "0");
      const unitNumber = `${floorNumber}${paddedUnit}`;

      unitsToInsert.push({
        building_id: buildingId,
        unit_number: unitNumber,
        floor: String(floorNumber),
        active: true,
      });
    }
  }

  const { error } = await supabase.from("units").insert(unitsToInsert);

  if (error) {
    throw new Error(error.message);
  }

  await refresh(propertyId);
}

export async function deleteUnit(formData: FormData) {
  const supabase = createAdminClient();

  const propertyId = String(formData.get("propertyId") || "").trim();
  const unitId = String(formData.get("unitId") || "").trim();

  if (!propertyId || !unitId) {
    throw new Error("Property and unit are required.");
  }

  const { error } = await supabase.from("units").delete().eq("id", unitId);

  if (error) {
    throw new Error(error.message);
  }

  await refresh(propertyId);
}

export async function updatePropertyStatus(formData: FormData) {
  const supabase = createAdminClient();

  const propertyId = String(formData.get("propertyId") || "").trim();
  const propertyStatus = String(formData.get("propertyStatus") || "").trim();

  if (!propertyId || !propertyStatus) {
    throw new Error("Property and status are required.");
  }

  if (!["active", "suspended"].includes(propertyStatus)) {
    throw new Error("Invalid property status.");
  }

  const { error } = await supabase
    .from("properties")
    .update({ property_status: propertyStatus })
    .eq("id", propertyId);

  if (error) {
    throw new Error(error.message);
  }

  await refresh(propertyId);
}