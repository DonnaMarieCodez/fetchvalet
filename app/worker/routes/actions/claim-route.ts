"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../../src/lib/supabase/server";

export async function claimRoute(formData: FormData) {
  const routeId = String(formData.get("routeId") || "").trim();

  if (!routeId) {
    throw new Error("Route ID is required.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to claim a route.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, worker_status, worker_score")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message || "Worker profile not found.");
  }

  if (profile.role !== "worker") {
    throw new Error("Only workers can claim routes.");
  }

  if (profile.worker_status === "suspended") {
    throw new Error("Suspended workers cannot claim routes.");
  }

  const { data: route, error: routeError } = await supabase
    .from("routes")
    .select("id, status, claimed_by, minimum_worker_score")
    .eq("id", routeId)
    .single();

  if (routeError || !route) {
    throw new Error(routeError?.message || "Route not found.");
  }

  if (route.status !== "open") {
    throw new Error("This route is no longer open.");
  }

  if (route.claimed_by) {
    throw new Error("This route has already been claimed.");
  }

  if (Number(profile.worker_score || 0) < Number(route.minimum_worker_score || 0)) {
    throw new Error("Your worker score is too low for this route.");
  }

  const { error: updateError } = await supabase
    .from("routes")
    .update({
      claimed_by: user.id,
      status: "claimed",
    })
    .eq("id", routeId)
    .is("claimed_by", null)
    .eq("status", "open");

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/worker/routes");
  revalidatePath(`/worker/routes/${routeId}`);
}