"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../src/lib/supabase/server";

async function updateWorkerStatus(workerId: string, nextStatus: string) {
  const supabase = await createClient();

  if (!workerId) {
    throw new Error("Worker ID is required.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ status: nextStatus })
    .eq("id", workerId)
    .eq("role", "worker");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/workers");
  revalidatePath(`/admin/workers/${workerId}`);
}

export async function approveWorker(formData: FormData) {
  const workerId = String(formData.get("workerId") || "");
  await updateWorkerStatus(workerId, "approved");
}

export async function rejectWorker(formData: FormData) {
  const workerId = String(formData.get("workerId") || "");
  await updateWorkerStatus(workerId, "rejected");
}

export async function suspendWorker(formData: FormData) {
  const workerId = String(formData.get("workerId") || "");
  await updateWorkerStatus(workerId, "suspended");
}
