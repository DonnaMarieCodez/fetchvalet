"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

function dollarsToCents(value: FormDataEntryValue | null) {
  const amount = Number(value || 0);
  return Math.round(amount * 100);
}

export async function updateRoutePayout(formData: FormData) {
  await requireAdmin();

  const supabase = createAdminClient();

  const routeId = String(formData.get("routeId") || "");
  const payoutStatus = String(formData.get("payoutStatus") || "pending");
  const payoutNotes = String(formData.get("payoutNotes") || "");

  const payoutAdjustmentCents = dollarsToCents(
    formData.get("payoutAdjustment")
  );

  if (!routeId) {
    throw new Error("Route ID is required.");
  }

  const approvedAt =
    payoutStatus === "approved" || payoutStatus === "paid"
      ? new Date().toISOString()
      : null;

  const { error } = await supabase
    .from("routes")
    .update({
      payout_status: payoutStatus,
      payout_adjustment_cents: payoutAdjustmentCents,
      payout_notes: payoutNotes,
      payout_approved_at: approvedAt,
    })
    .eq("id", routeId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/payouts");
}

export async function markPayoutPaid(formData: FormData) {
  await requireAdmin();

  const supabase = createAdminClient();

  const routeId = String(formData.get("routeId") || "");

  if (!routeId) {
    throw new Error("Route ID is required.");
  }

  const { error } = await supabase
    .from("routes")
    .update({
      payout_status: "paid",
      payout_approved_at: new Date().toISOString(),
    })
    .eq("id", routeId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/payouts");
}