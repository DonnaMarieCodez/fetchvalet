"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function updatePayoutStatus(formData: FormData) {
  const routeId = String(formData.get("routeId") || "").trim();
  const payoutStatus = String(formData.get("payoutStatus") || "").trim();
  const payoutNotes = String(formData.get("payoutNotes") || "").trim();

  if (!routeId || !payoutStatus) {
    throw new Error("Route and payout status are required.");
  }

  if (!["pending", "paid", "on_hold"].includes(payoutStatus)) {
    throw new Error("Invalid payout status.");
  }

  const supabase = await createAdminClient();

  const updatePayload: {
    payout_status: string;
    payout_notes: string | null;
    paid_at?: string | null;
  } = {
    payout_status: payoutStatus,
    payout_notes: payoutNotes || null,
  };

  if (payoutStatus === "paid") {
    updatePayload.paid_at = new Date().toISOString();
  } else {
    updatePayload.paid_at = null;
  }

  const { error } = await supabase
    .from("routes")
    .update(updatePayload)
    .eq("id", routeId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/payouts");
  revalidatePath("/admin");
}