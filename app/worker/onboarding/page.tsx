import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../src/lib/supabase/server";

export default async function WorkerOnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/worker/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, status")
    .eq("id", user.id)
    .single();

  const status = String(profile?.status || "").toLowerCase();

  if (status === "approved") {
    redirect("/worker/routes");
  }

  if (status === "suspended") {
    redirect("/worker/suspended");
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
          Pending Approval
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Application Received
        </h1>

        <p className="mt-4 text-slate-600">
          {profile?.full_name ? `${profile.full_name}, y` : "Y"}our worker
          account has been created and is waiting for admin approval.
        </p>

        <p className="mt-3 text-sm text-slate-500">
          Once approved, your route access will unlock automatically.
        </p>

        <Link
          href="/worker/login"
          className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}