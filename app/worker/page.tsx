import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../src/lib/supabase/server";
import { logout } from "../actions/logout";

export default async function WorkerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, display_name, worker_status, worker_score")
    .eq("id", user.id)
    .single();

  if (error || !profile || profile.role !== "worker") {
    redirect("/login");
  }

  const workerName =
    profile.full_name ||
    profile.display_name ||
    user.email ||
    "Worker";

  const workerStatus = String(profile.worker_status || "pending").toLowerCase();
  const workerScore = Number(profile.worker_score || 0);

  const statusMessage =
    workerStatus === "approved"
      ? "Your worker account is approved. You can access routes and begin working."
      : workerStatus === "suspended"
      ? "Your account is currently suspended. Contact admin for support."
      : "Your worker account is pending review. You will receive access once approved.";

  const statusBadgeClass =
    workerStatus === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : workerStatus === "suspended"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Worker Portal
              </p>
              <h1 className="mt-2 text-4xl font-bold">{workerName}</h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                View your status and access your assigned work.
              </p>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Account Status</h2>

          <div className="mt-4">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold capitalize ${statusBadgeClass}`}
            >
              {workerStatus}
            </span>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-700">{statusMessage}</p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Quick Access</h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/worker/routes"
              className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                workerStatus === "approved"
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
              aria-disabled={workerStatus !== "approved"}
            >
              View Routes
            </Link>

            <Link
              href="/worker/score"
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View Score ({workerScore})
            </Link>

            <Link
              href="/worker/pay"
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View Pay
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}