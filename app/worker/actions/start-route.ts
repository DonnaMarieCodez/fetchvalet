"use server";

import { createClient } from "../../../src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function startRoute(formData: FormData) {
  const routeId = formData.get("routeId") as string;

  if (!routeId) return;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("routes")
    .update({
      status: "in_progress",
      started_at: new Date().toISOString(),
    })
    .eq("id", routeId)
    .eq("claimed_by", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/worker/route");
  revalidatePath("/worker");
  revalidatePath("/admin");
}