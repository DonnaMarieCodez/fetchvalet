"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../../src/lib/supabase/server";

export async function approveProofPhoto(formData: FormData) {
  const supabase = await createClient();
  const photoId = String(formData.get("photoId") ?? "");

  if (!photoId) throw new Error("Missing photo id.");

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;

  const { error } = await supabase
    .from("proof_photos")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by_user_id: userId,
      rejected_at: null,
      rejected_by_user_id: null,
      rejection_reason: null,
    })
    .eq("id", photoId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/proof-photos/review");
  revalidatePath("/property/proof");
}

export async function rejectProofPhoto(formData: FormData) {
  const supabase = await createClient();
  const photoId = String(formData.get("photoId") ?? "");
  const rejectionReasonRaw = String(formData.get("rejectionReason") ?? "").trim();

  if (!photoId) throw new Error("Missing photo id.");

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;

  const { error } = await supabase
    .from("proof_photos")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
      rejected_by_user_id: userId,
      rejection_reason: rejectionReasonRaw === "" ? null : rejectionReasonRaw,
    })
    .eq("id", photoId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/proof-photos/review");
}