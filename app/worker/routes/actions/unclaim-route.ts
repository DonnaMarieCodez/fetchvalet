"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../../src/lib/supabase/server";

function combineRouteDateAndTime(routeDate: string, startTime: string | null) {
  if (!startTime) return null;

  const raw = String(startTime).trim();

  if (!raw) return null;

  if (raw.includes("AM") || raw.includes("PM")) {
    const [timePart, meridiem] = raw.split(" ");
    const [hourString, minuteString = "00"] = timePart.split(":");
    let hour = Number(hourString);
    const minute = Number(minuteString);

    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

    const upperMeridiem = meridiem.toUpperCase();

    if (upperMeridiem === "PM" && hour !== 12) hour += 12;
    if (upperMeridiem === "AM" && hour === 12) hour = 0;

    const dt = new Date(`${routeDate}T00:00:00`);
    dt.setHours(hour, minute, 0, 0);
    return dt;
  }

  const [hourString, minuteString = "00"] = raw.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  const dt = new Date(`${routeDate}T00:00:00`);
  dt.setHours(hour, minute, 0, 0);
  return dt;
}

export async function unclaimRoute(formData: FormData) {
  const routeId = String(formData.get("routeId") || "").trim();

  if (!routeId) {
    throw new Error("Route ID is required.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, worker_score")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message || "Worker profile not found.");
  }

  if (profile.role !== "worker") {
    throw new Error("Only workers can unclaim routes.");
  }

  const { data: route, error: routeError } = await supabase
    .from("routes")
    .select("id, route_date, start_time, status, claimed_by")
    .eq("id", routeId)
    .single();

  if (routeError || !route) {
    throw new Error(routeError?.message || "Route not found.");
  }

  if (route.claimed_by !== user.id) {
    throw new Error("You can only unclaim your own routes.");
  }

  if (!["claimed", "in_progress"].includes(String(route.status))) {
    throw new Error("Only claimed or in-progress routes can be unclaimed.");
  }

  const routeStart = combineRouteDateAndTime(route.route_date, route.start_time);
  const now = new Date();

  let penalty = 0;
  let penaltyReason: string | null = null;

  if (routeStart) {
    const diffMs = routeStart.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    if (diffMinutes < 90) {
      penalty = -10;
      penaltyReason =
        "Route canceled less than 1.5 hours before start time.";
    }
  }

  const { error: updateRouteError } = await supabase
    .from("routes")
    .update({
      claimed_by: null,
      status: "open",
    })
    .eq("id", routeId)
    .eq("claimed_by", user.id);

  if (updateRouteError) {
    throw new Error(updateRouteError.message);
  }

  if (penalty !== 0) {
    const currentScore = Number(profile.worker_score || 0);
    const newScore = Math.max(0, currentScore + penalty);

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({
        worker_score: newScore,
      })
      .eq("id", user.id);

    if (updateProfileError) {
      throw new Error(updateProfileError.message);
    }

    const { error: eventError } = await supabase
      .from("worker_score_events")
      .insert({
        worker_id: user.id,
        event_type: "route_unclaim_penalty",
        score_change: penalty,
        reason: penaltyReason,
      });

    if (eventError) {
      throw new Error(eventError.message);
    }
  }

  revalidatePath("/worker/routes");
  revalidatePath(`/worker/routes/${routeId}`);
  revalidatePath("/worker/score");
}