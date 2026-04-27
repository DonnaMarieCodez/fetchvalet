"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PropertyRecord = {
  id: string;
  default_route_payout_cents: number | null;
  default_minimum_worker_score: number | null;
  max_units_per_route: number | null;
};

type BuildingRecord = {
  id: string;
};

type UnitRecord = {
  id: string;
  building_id: string;
};

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function createRoute(formData: FormData) {
  const propertyId = String(formData.get("propertyId") || "").trim();
  const routeDate = String(formData.get("routeDate") || "").trim();
  const startTime = String(formData.get("startTime") || "").trim();
  const endTime = String(formData.get("endTime") || "").trim();
  const payoutDollars = Number(formData.get("payoutDollars") || 0);
  const minimumWorkerScore = Number(formData.get("minimumWorkerScore") || 0);

  if (!propertyId || !routeDate || !startTime || !endTime) {
    throw new Error("Property, date, start time, and end time are required.");
  }

  const supabase = createAdminClient();

  await generateRoutesForProperty({
    supabase,
    propertyId,
    routeDate,
    startTime,
    endTime,
    payoutCentsOverride: Math.round(payoutDollars * 100),
    minimumWorkerScoreOverride: minimumWorkerScore,
  });

  redirect("/admin/routes");
}

export async function generateRoutesForProperty({
  supabase,
  propertyId,
  routeDate,
  startTime,
  endTime,
  payoutCentsOverride,
  minimumWorkerScoreOverride,
}: {
  supabase: Awaited<ReturnType<typeof createAdminClient>>;
  propertyId: string;
  routeDate: string;
  startTime: string;
  endTime: string;
  payoutCentsOverride?: number;
  minimumWorkerScoreOverride?: number;
}) {
  const { data: existingRoutes, error: existingRoutesError } = await supabase
    .from("routes")
    .select("id")
    .eq("property_id", propertyId)
    .eq("route_date", routeDate);

  if (existingRoutesError) {
    throw new Error(existingRoutesError.message);
  }

  if ((existingRoutes ?? []).length > 0) {
    return;
  }

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select(
      "id, default_route_payout_cents, default_minimum_worker_score, max_units_per_route"
    )
    .eq("id", propertyId)
    .single();

  if (propertyError || !property) {
    throw new Error(propertyError?.message || "Property not found.");
  }

  const typedProperty = property as PropertyRecord;

  const { data: buildings, error: buildingsError } = await supabase
    .from("buildings")
    .select("id")
    .eq("property_id", propertyId);

  if (buildingsError) {
    throw new Error(buildingsError.message);
  }

  const typedBuildings = (buildings ?? []) as BuildingRecord[];
  const buildingIds = typedBuildings.map((b) => b.id);

  if (buildingIds.length === 0) {
    throw new Error("This property has no buildings.");
  }

  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("id, building_id")
    .in("building_id", buildingIds)
    .eq("active", true);

  if (unitsError) {
    throw new Error(unitsError.message);
  }

  const typedUnits = (units ?? []) as UnitRecord[];

  if (typedUnits.length === 0) {
    throw new Error("This property has no active units.");
  }

  const maxUnitsPerRoute = Math.max(
    1,
    Number(typedProperty.max_units_per_route || 150)
  );

  const chunks = chunkArray(typedUnits, maxUnitsPerRoute);

  const totalPayoutCents =
    typeof payoutCentsOverride === "number" && payoutCentsOverride > 0
      ? payoutCentsOverride
      : Number(typedProperty.default_route_payout_cents || 0);

  const payoutPerUnit =
    typedUnits.length > 0 ? Math.round(totalPayoutCents / typedUnits.length) : 0;

  const minimumWorkerScore =
    typeof minimumWorkerScoreOverride === "number"
      ? minimumWorkerScoreOverride
      : Number(typedProperty.default_minimum_worker_score || 0);

  for (const chunk of chunks) {
    const chunkPayoutCents = payoutPerUnit * chunk.length;

    const { data: route, error: routeError } = await supabase
      .from("routes")
      .insert({
        property_id: propertyId,
        route_date: routeDate,
        start_time: startTime,
        end_time: endTime,
        payout_cents: chunkPayoutCents,
        minimum_worker_score: minimumWorkerScore,
        status: "open",
        payout_status: "pending",
      })
      .select("id")
      .single();

    if (routeError || !route) {
      throw new Error(routeError?.message || "Failed to create route.");
    }

    const stopRows = chunk.map((unit, index) => ({
      route_id: route.id,
      unit_id: unit.id,
      stop_order: index + 1,
      status: "pending",
    }));

    const { error: stopError } = await supabase
      .from("route_stops")
      .insert(stopRows);

    if (stopError) {
      throw new Error(stopError.message);
    }
  }
}