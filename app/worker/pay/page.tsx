import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../src/lib/supabase/server";
import { logout } from "../../actions/logout";

type RouteRecord = {
  id: string;
  route_date: string;
  payout_cents: number | null;
  payout_status: string | null;
  status: string;
  properties: {
    name: string;
    city: string;
    state: string;
  } | null;
};

function formatMoney(cents: number | null) {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

function getPayoutBadge(status: string | null) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "processing":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "on_hold":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export default async function WorkerPayPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name, display_name, worker_status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "worker") {
    redirect("/login");
  }

  const workerName =
    profile.full_name ||
    profile.display_name ||
    user.email ||
    "Worker";

  const workerStatus = String(profile.worker_status || "pending").toLowerCase();

  const { data: routes, error: routesError } = await supabase
    .from("routes")
    .select(`
      id,
      route_date,
      payout_cents,
      payout_status,
      status,
      properties (
        name,
        city,
        state
      )
    `)
    .eq("claimed_by", user.id)
    .order("route_date", { ascending: false });

  const typedRoutes = (routes ?? []) as RouteRecord[];

  const totalEarned = typedRoutes
    .filter((route) => route.status === "completed")
    .reduce((sum, route) => sum + Number(route.payout_cents || 0), 0);

  const totalPaid = typedRoutes
    .filter((route) => route.payout_status === "paid")
    .reduce((sum, route) => sum + Number(route.payout_cents || 0), 0);

  const totalPending = typedRoutes
    .filter((route) => route.status === "completed" && route.payout_status !== "paid")
    .reduce((sum, route) => sum + Number(route.payout_cents || 0), 0);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Worker Pay
              </p>
              <h1 className="mt-2 text-4xl font-bold">{workerName}</h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                Review your completed route earnings, paid amounts, and pending payouts.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/worker"
                className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Back to Dashboard
              </Link>

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
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Account Status</h2>
              <p className="mt-2 text-sm text-slate-500">
                Your current worker approval status.
              </p>
            </div>

            <span
              className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold capitalize ${
                workerStatus === "approved"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : workerStatus === "suspended"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {workerStatus}
            </span>
          </div>
        </section>

        {routesError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error: {routesError.message}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Total Earned</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              {formatMoney(totalEarned)}
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
            <p className="text-sm text-emerald-700">Paid Out</p>
            <p className="mt-3 text-4xl font-bold text-emerald-900">
              {formatMoney(totalPaid)}
            </p>
          </div>

          <div className="rounded-3xl bg-amber-50 p-5 shadow-sm ring-1 ring-amber-100">
            <p className="text-sm text-amber-700">Pending</p>
            <p className="mt-3 text-4xl font-bold text-amber-900">
              {formatMoney(totalPending)}
            </p>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Route Earnings</h2>
          <p className="mt-2 text-sm text-slate-500">
            Completed and assigned route payout history.
          </p>

          <div className="mt-5 space-y-4">
            {typedRoutes.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                No route payout history found yet.
              </div>
            ) : (
              typedRoutes.map((route) => (
                <div
                  key={route.id}
                  className="rounded-2xl border bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xl font-bold text-slate-900">
                        {route.properties?.name || "Unknown Property"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {route.properties?.city || "Unknown City"},{" "}
                        {route.properties?.state || "Unknown State"}
                      </p>
                      <p className="mt-3 text-sm text-slate-600">
                        Service Date: {route.route_date}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Route Status: {route.status}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getPayoutBadge(
                          route.payout_status
                        )}`}
                      >
                        {route.payout_status || "pending"}
                      </span>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatMoney(route.payout_cents)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}