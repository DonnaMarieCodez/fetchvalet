"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function uploadProofPhoto(formData: FormData) {
  const supabase = await createAdminClient();

  const propertyId = String(formData.get("propertyId") ?? "");
  const routeIdRaw = String(formData.get("routeId") ?? "");
  const serviceDateRaw = String(formData.get("serviceDate") ?? "");
  const captionRaw = String(formData.get("caption") ?? "");
  const file = formData.get("photo") as File | null;

  if (!propertyId) throw new Error("Missing property id.");
  if (!file || file.size === 0) throw new Error("Missing photo.");

  const routeId = routeIdRaw.trim() === "" ? null : routeIdRaw.trim();
  const serviceDate = serviceDateRaw.trim() === "" ? null : serviceDateRaw.trim();
  const caption = captionRaw.trim() === "" ? null : captionRaw.trim();

  const fileExt = file.name.split(".").pop() || "jpg";
  const safeName = `${propertyId}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("proof-photos")
    .upload(safeName, fileBuffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from("proof-photos")
    .getPublicUrl(safeName);

  const imageUrl = publicUrlData.publicUrl;

  const { error: insertError } = await supabase.from("proof_photos").insert({
    property_id: propertyId,
    route_id: routeId,
    image_url: imageUrl,
    service_date: serviceDate,
    caption,
    status: "pending",
    uploaded_by_user_id: userId,
    archived: false,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath("/admin/proof-photos");
  revalidatePath("/property/proof");
}