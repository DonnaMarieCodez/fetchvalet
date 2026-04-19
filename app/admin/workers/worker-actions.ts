"use server";

import { createClient } from "../../../src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveWorker(formData: FormData) {
  const workerId = formData.get("workerId") as string;
  if (!workerId) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ worker_status: "approved" })
    .eq("id", workerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/workers");
  revalidatePath("/worker/status");
  revalidatePath("/worker");
}

export async function rejectWorker(formData: FormData) {
  const workerId = formData.get("workerId") as string;
  if (!workerId) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ worker_status: "rejected" })
    .eq("id", workerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/workers");
}

export async function suspendWorker(formData: FormData) {
  const workerId = formData.get("workerId") as string;
  if (!workerId) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ worker_status: "suspended" })
    .eq("id", workerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/workers");
}
