"use server";

import { createClient } from "../../../src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function completeBuilding(formData: FormData) {
  const routeId = formData.get("routeId") as string;
  const buildingName = formData.get("buildingName") as string;

  if (!routeId || !buildingName) return;

  const supabase = await createClient();

  const { data: stops, error: fetchError } = await supabase
    .from("route_stops")
    .select(`
      id,
      units (
        buildings (
          name
        )
      )
    `)
    .eq("route_id", routeId)
    .eq("status", "pending");

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const stopIds =
    stops
      ?.filter(
        (stop) =>
          (stop.units as any)?.buildings?.name === buildingName
      )
      .map((stop) => stop.id) ?? [];

  if (stopIds.length > 0) {
    const { error: updateError } = await supabase
      .from("route_stops")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .in("id", stopIds);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  const { data: remainingStops, error: remainingError } = await supabase
    .from("route_stops")
    .select("id")
    .eq("route_id", routeId)
    .eq("status", "pending");

  if (remainingError) {
    throw new Error(remainingError.message);
  }

  if (!remainingStops || remainingStops.length === 0) {
    const { error: routeError } = await supabase
      .from("routes")
      .update({ status: "completed" })
      .eq("id", routeId);

    if (routeError) {
      throw new Error(routeError.message);
    }
  }

  revalidatePath("/worker/route");
  revalidatePath("/worker");
  revalidatePath("/admin");
}
