"use server";

import { createClient } from "../../../src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function noTrashOut(formData: FormData) {
  const stopId = formData.get("stopId") as string;
  if (!stopId) return;

  const supabase = await createClient();

  await supabase
    .from("route_stops")
    .update({
      status: "no_trash_out",
      completed_at: new Date().toISOString(),
    })
    .eq("id", stopId);

  revalidatePath("/worker/route");
}