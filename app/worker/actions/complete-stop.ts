"use server";

import { createClient } from "../../../src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function completeStop(formData: FormData) {
  const stopId = formData.get("stopId") as string;
  if (!stopId) return;

  const supabase = await createClient();

  await supabase
    .from("route_stops")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", stopId);

  revalidatePath("/worker/route");
}