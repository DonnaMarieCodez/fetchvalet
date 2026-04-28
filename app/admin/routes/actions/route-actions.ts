"use server";

import { createAdminClient } from "@/src/lib/supabase/admin";
import { generateRoutesForProperty } from "./create-route";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type AutoPropertyRecord = {
  id: string;
  name: string;
  service_days: string | null;
  pickup_start_time: string | null;
  auto_generate_routes: boolean | null;
  property_status: string | null;
};

type AutoGenerateState = {
  status: "idle" | "success" | "error";
  message: string;
};

function matchesServiceDay(serviceDays: string | null, dayName: string) {
  if (!serviceDays) return false;

  return serviceDays
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)
    .includes(dayName.toLowerCase());
}

function getTargetRouteDate() {
  const now = new Date();
  const cutoffHour = 12;
  const target = new Date(now);

  if (now.getHours() >= cutoffHour) {
    target.setDate(target.getDate() + 1);
  }

  return target;
}

export async function autoGenerateRoutesForToday(
  _prevState: AutoGenerateState,
  _formData: FormData
): Promise<AutoGenerateState> {
  try {
    const supabase = await createAdminClient();

    const targetDate = getTargetRouteDate();
    const routeDate = targetDate.toISOString().slice(0, 10);
    const dayName = DAY_NAMES[targetDate.getDay()];

    const { data: properties, error } = await supabase
      .from("properties")
      .select(
        "id, name, service_days, pickup_start_time, auto_generate_routes, property_status"
      )
      .eq("property_status", "active")
      .eq("auto_generate_routes", true);

    if (error) {
      return {
        status: "error",
        message: error.message,
      };
    }

    const typedProperties = (properties ?? []) as AutoPropertyRecord[];

    if (typedProperties.length === 0) {
      return {
        status: "error",
        message:
          "No active properties have auto-generate routes enabled.",
      };
    }

    let matchedCount = 0;
    let createdCount = 0;
    const skipped: string[] = [];

    for (const property of typedProperties) {
      if (!matchesServiceDay(property.service_days, dayName)) {
        skipped.push(`${property.name}: service day does not match ${dayName}`);
        continue;
      }

      matchedCount += 1;

      const { data: existingRoutes, error: existingRoutesError } = await supabase
        .from("routes")
        .select("id")
        .eq("property_id", property.id)
        .eq("route_date", routeDate);

      if (existingRoutesError) {
        skipped.push(`${property.name}: ${existingRoutesError.message}`);
        continue;
      }

      if ((existingRoutes ?? []).length > 0) {
        skipped.push(`${property.name}: routes already exist for ${routeDate}`);
        continue;
      }

      try {
        await generateRoutesForProperty({
          supabase,
          propertyId: property.id,
          routeDate,
          startTime: property.pickup_start_time || "20:00",
          endTime: "22:00",
        });

        createdCount += 1;
      } catch (routeError) {
        skipped.push(
          `${property.name}: ${
            routeError instanceof Error ? routeError.message : "Unknown error"
          }`
        );
      }
    }

    const skippedText =
      skipped.length > 0 ? ` Skipped: ${skipped.join(" | ")}` : "";

    return {
      status: "success",
      message: `Generated routes for ${createdCount} propert${
        createdCount === 1 ? "y" : "ies"
      } on ${routeDate}. Matched ${matchedCount} service schedule${
        matchedCount === 1 ? "" : "s"
      }.${skippedText}`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Auto-generate failed.",
    };
  }
}

export async function deleteRoute(formData: FormData) {
  const routeId = String(formData.get("routeId") || "").trim();

  if (!routeId) {
    throw new Error("Route ID is required.");
  }

  const supabase = await createAdminClient();

  const { error: stopDeleteError } = await supabase
    .from("route_stops")
    .delete()
    .eq("route_id", routeId);

  if (stopDeleteError) {
    throw new Error(stopDeleteError.message);
  }

  const { error: proofDeleteError } = await supabase
    .from("building_proofs")
    .delete()
    .eq("route_id", routeId);

  if (proofDeleteError) {
    throw new Error(proofDeleteError.message);
  }

  const { error: routeDeleteError } = await supabase
    .from("routes")
    .delete()
    .eq("id", routeId);

  if (routeDeleteError) {
    throw new Error(routeDeleteError.message);
  }
}