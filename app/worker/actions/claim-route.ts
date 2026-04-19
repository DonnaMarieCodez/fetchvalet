"use server";

import { createClient } from "../../../src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function claimRoute(formData: FormData) {
  const routeId = String(formData.get("routeId") || "").trim();

  if (!routeId) return;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, worker_score, worker_status, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message || "Worker profile not found.");
  }

  if (profile.role !== "worker" || profile.worker_status !== "approved") {
    throw new Error("You are not eligible to claim routes.");
  }

  const { data: route, error: routeError } = await supabase
    .from("routes")
    .select("id, minimum_worker_score, status, claimed_by")
    .eq("id", routeId)
    .single();

  if (routeError || !route) {
    throw new Error(routeError?.message || "Route not found.");
  }

  if (route.status !== "open") {
    throw new Error("This route is no longer available.");
  }

  const workerScore = Number(profile.worker_score || 0);
  const requiredScore = Number(route.minimum_worker_score || 0);

  if (workerScore < requiredScore) {
    throw new Error(
      `Your score is too low to claim this route. Required: ${requiredScore}. Current: ${workerScore}.`
    );
  }

  const { data: activeRoute } = await supabase
    .from("routes")
    .select("id")
    .eq("claimed_by", user.id)
    .in("status", ["claimed", "in_progress"])
    .limit(1)
    .maybeSingle();

  if (activeRoute) {
    throw new Error("You already have an active route.");
  }

  const { error } = await supabase
    .from("routes")
    .update({
      status: "claimed",
      claimed_by: user.id,
    })
    .eq("id", routeId)
    .eq("status", "open");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/worker");
  revalidatePath("/worker/route");
  revalidatePath("/admin");
}