"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "../../../../src/lib/supabase/admin";

export async function sendWorkerPasswordReset(formData: FormData) {
  const workerId = String(formData.get("workerId") ?? "").trim();

  if (!workerId) {
    throw new Error("Missing worker id.");
  }

  const supabase = createAdminClient();

  const { data: userData, error: userError } =
    await supabase.auth.admin.getUserById(workerId);

  if (userError) {
    throw new Error(userError.message);
  }

  const email = userData.user?.email;

  if (!email) {
    throw new Error("Worker email not found in Auth.");
  }

  const redirectTo =
    process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/login`
      : undefined;

  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (resetError) {
    throw new Error(resetError.message);
  }

  revalidatePath(`/admin/workers/${workerId}`);
  redirect(`/admin/workers/${workerId}`);
}