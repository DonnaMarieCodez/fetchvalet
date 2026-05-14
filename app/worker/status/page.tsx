import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export default async function WorkerStatusPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/worker/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, status, worker_onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/worker/login");
  }

  const status = profile.status || "waitlist";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
          Worker Status
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-900">
          Hi, {profile.full_name || "Worker"}
        </h1>

        <p className="mt-3 text-slate-600">
          Your current application status is:
        </p>

        <div className="mt-5 rounded-2xl bg-slate-100 p-5 text-2xl font-black capitalize text-slate-900">
          {status}
        </div>

        {status === "waitlist" && (
          <p className="mt-5 text-sm text-slate-600">
            You’re on the waitlist. An admin will review your application.
          </p>
        )}

        {status === "onboarding" && (
          <Link
            href="/worker/onboarding"
            className="mt-6 inline-block rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white"
          >
            Complete Onboarding
          </Link>
        )}

        {status === "active" && (
          <Link
            href="/worker/routes"
            className="mt-6 inline-block rounded-2xl bg-green-600 px-5 py-3 font-bold text-white"
          >
            View Routes
          </Link>
        )}

        {status === "suspended" && (
          <p className="mt-5 text-sm text-red-600">
            Your worker account is suspended. Contact FetchValet support.
          </p>
        )}
      </section>
    </main>
  );
}