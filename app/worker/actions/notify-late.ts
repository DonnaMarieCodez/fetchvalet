"use server";

import { createClient } from "../../../src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function notifyLate(formData: FormData) {
  const routeId = String(formData.get("routeId") || "").trim();
  const minutes = Number(formData.get("minutes"));

  if (!routeId || Number.isNaN(minutes)) {
    throw new Error("Invalid late notification.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: route, error } = await supabase
    .from("routes")
    .select("id, claimed_by, start_time, status")
    .eq("id", routeId)
    .eq("claimed_by", user.id)
    .single();

  if (error || !route) {
    throw new Error("Route not found.");
  }

  // Prevent abuse (only before start or early)
  const now = new Date();
  const scheduled = new Date(`1970-01-01T${route.start_time}`);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const scheduledMinutes =
    scheduled.getHours() * 60 + scheduled.getMinutes();

  if (nowMinutes > scheduledMinutes + 30) {
    throw new Error("Too late to submit late notice.");
  }

  const { error: updateError } = await supabase
    .from("routes")
    .update({
      late_notified: true,
      late_minutes: minutes,
      late_notified_at: new Date().toISOString(),
    })
    .eq("id", routeId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/worker/route");
}
