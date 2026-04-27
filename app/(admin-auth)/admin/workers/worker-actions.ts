"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/src/lib/supabase/admin";

async function updateWorkerStatus(workerId: string, nextStatus: string) {
  const supabase = await createAdminClient();

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
