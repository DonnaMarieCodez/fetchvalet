import { createClient } from "../supabase/server";

export async function getPropertyProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, property_id")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { user, profile: null };
  }

  return { user, profile };
}