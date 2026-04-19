"use server";

import { createClient } from "../../../src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadBuildingProof(formData: FormData) {
  const routeId = formData.get("routeId") as string;
  const buildingName = formData.get("buildingName") as string;
  const file = formData.get("photo") as File | null;

  if (!routeId || !buildingName || !file || file.size === 0) {
    throw new Error("Missing route, building, or photo.");
  }

  const supabase = await createClient();

  const fileExt = file.name.split(".").pop() || "jpg";
  const safeBuilding = buildingName.toLowerCase().replace(/\s+/g, "-");
  const filePath = `route-${routeId}/${safeBuilding}-${Date.now()}.${fileExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("proof-photos")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from("proof-photos")
    .getPublicUrl(filePath);

  const imageUrl = publicUrlData.publicUrl;

  const { error: insertError } = await supabase
    .from("building_proofs")
    .insert({
      route_id: routeId,
      building_name: buildingName,
      image_url: imageUrl,
      proof_type: "building_photo",
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath("/worker/route");
  revalidatePath("/admin");
}
