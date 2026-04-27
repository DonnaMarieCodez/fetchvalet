"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/src/lib/supabase/admin";

const ALLOWED_STATUSES = ["approved", "rejected", "suspended", "pending"] as const;
type WorkerStatus = (typeof ALLOWED_STATUSES)[number];

function isValidStatus(value: string): value is WorkerStatus {
  return ALLOWED_STATUSES.includes(value as WorkerStatus);
}

export async function updateWorkerStatus(formData: FormData) {
  const workerId = String(formData.get("workerId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!workerId) {
    throw new Error("Missing worker id.");
  }

  if (!isValidStatus(status)) {
    throw new Error("Invalid worker status.");
  }

  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", workerId)
    .eq("role", "worker");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/workers");
  revalidatePath(`/admin/workers/${workerId}`);
}