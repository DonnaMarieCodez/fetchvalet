import { createClient } from "../supabase/server";

type WorkerProfile = {
  id: string;
  role: string | null;
  status: string | null;
  full_name: string | null;
  phone: string | null;
};

export async function getWorkerProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, status, full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return { user, profile: null };
  }

  return {
    user,
    profile: profile as WorkerProfile,
  };
}
