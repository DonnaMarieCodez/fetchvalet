import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../src/lib/supabase/server";
import { claimRoute } from "./actions/claim-route";
import { unclaimRoute } from "./actions/unclaim-route";

type RouteRecord = {
  id: string;
  route_date: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  payout_cents: number | null;
  minimum_worker_score: number | null;
  claimed_by: string | null;
  properties: {
    id: string;
    name: string;
    city: string;
    state: string;
  } | null;
};

function formatMoney(cents: number | null) {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

function formatTime(value: string | null) {
  if (!value) return "Not set";

  const raw = String(value).trim();
  if (!raw) return "Not set";

  if (raw.includes("AM") || raw.includes("PM")) {
    return raw;
  }

  const [hourString, minuteString = "00"] = raw.split(":");
  const hour = Number(hourString);
  const minute = String(minuteString).padStart(2, "0");

  if (Number.isNaN(hour)) return raw;

  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${hour12}:${minute} ${suffix}`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "open":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "claimed":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "in_progress":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getWorkerTier(score: number) {
  if (score >= 90) {
    return {
      name: "Platinum",
      className: "bg-cyan-50 text-cyan-700 border-cyan-200",
    };
  }

  if (score >= 75) {
    return {
      name: "Gold",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  if (score >= 60) {
    return {
      name: "Silver",
      className: "bg-slate-100 text-slate-700 border-slate-300",
    };
  }

  return {
    name: "Bronze",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  };
}

export default async function WorkerRoutesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, worker_status, worker_score, full_name, display_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "worker") {
    redirect("/login");
  }

  if (profile.worker_status === "suspended") {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-3xl font-bold text-slate-900">Worker Routes</h1>
              <Link
                href="/worker"
                className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Dashboard
              </Link>
            </div>

            <p className="mt-4 text-slate-700">
              Your account is currently suspended. You cannot claim routes at this time.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const workerScore = Number(profile.worker_score || 0);
  const workerTier = getWorkerTier(workerScore);

  const [
    { data: availableRoutes, error: availableError },
    { data: myRoutes, error: myRoutesError },
  ] = await Promise.all([
    supabase
      .from("routes")
      .select(`
        id,
        route_date,
        start_time,
        end_time,
        status,
        payout_cents,
        minimum_worker_score,
        claimed_by,
        properties (
          id,
          name,
          city,
          state
        )
      `)
      .eq("status", "open")
      .is("claimed_by", null)
      .lte("minimum_worker_score", workerScore)
      .order("route_date", { ascending: true }),
    supabase
      .from("routes")
      .select(`
        id,
        route_date,
        start_time,
        end_time,
        status,
        payout_cents,
        minimum_worker_score,
        claimed_by,
        properties (
          id,
          name,
          city,
          state
        )
      `)
      .eq("claimed_by", user.id)
      .order("route_date", { ascending: false }),
  ]);

  const typedAvailableRoutes = (availableRoutes ?? []) as RouteRecord[];
  const typedMyRoutes = (myRoutes ?? []) as RouteRecord[];

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Worker Portal
              </p>
              <h1 className="mt-2 text-4xl font-bold">Available Routes</h1>
              <p className="mt-3 max-w-2xl text-lg text-slate-200">
                Claim open routes that match your worker score and manage the routes already assigned to you.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/worker/score"
                className="rounded-3xl bg-white/10 px-6 py-5 text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <p className="text-sm text-slate-300">Worker Score</p>
                <p className="mt-2 text-4xl font-bold">{workerScore}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${workerTier.className}`}
                  >
                    {workerTier.name} Tier
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  Tap to see tier details
                </p>
              </Link>

              <Link
                href="/worker"
                className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {(availableError || myRoutesError) && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error: {availableError?.message || myRoutesError?.message}
          </div>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Open Routes</h2>
            <p className="mt-2 text-sm text-slate-500">
              Routes you are eligible to claim.
            </p>

            <div className="mt-5 space-y-4">
              {typedAvailableRoutes.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                  No open routes are available for your current score right now.
                </div>
              ) : (
                typedAvailableRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="rounded-2xl border bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xl font-bold text-slate-900">
                          {route.properties?.name || "Unknown Property"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {route.properties?.city || "Unknown City"},{" "}
                          {route.properties?.state || "Unknown State"}
                        </p>
                        <p className="mt-3 text-sm text-slate-600">
                          Date: {route.route_date}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Time: {formatTime(route.start_time)} - {formatTime(route.end_time)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Minimum Score: {route.minimum_worker_score ?? 0}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-3 md:items-end">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                            route.status
                          )}`}
                        >
                          {route.status.replaceAll("_", " ")}
                        </span>

                        <p className="text-2xl font-bold text-slate-900">
                          {formatMoney(route.payout_cents)}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/worker/routes/${route.id}`}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            Open Route
                          </Link>

                          {route.status === "open" &&
                            workerScore >= (route.minimum_worker_score ?? 0) && (
                              <form action={claimRoute}>
                                <input type="hidden" name="routeId" value={route.id} />
                                <button
                                  type="submit"
                                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                  Claim Route
                                </button>
                              </form>
                            )}

                          {route.status === "open" &&
                            workerScore < (route.minimum_worker_score ?? 0) && (
                              <button
                                type="button"
                                disabled
                                className="rounded-xl bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-500"
                              >
                                Score Too Low
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">My Routes</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Routes currently assigned to you.
                </p>
              </div>

              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${workerTier.className}`}
              >
                {workerTier.name} Tier
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {typedMyRoutes.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                  You have not claimed any routes yet.
                </div>
              ) : (
                typedMyRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="rounded-2xl border bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xl font-bold text-slate-900">
                          {route.properties?.name || "Unknown Property"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {route.properties?.city || "Unknown City"},{" "}
                          {route.properties?.state || "Unknown State"}
                        </p>
                        <p className="mt-3 text-sm text-slate-600">
                          Date: {route.route_date}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Time: {formatTime(route.start_time)} - {formatTime(route.end_time)}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-3 md:items-end">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                            route.status
                          )}`}
                        >
                          {route.status.replaceAll("_", " ")}
                        </span>

                        <p className="text-2xl font-bold text-slate-900">
                          {formatMoney(route.payout_cents)}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/worker/routes/${route.id}`}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            Open Route
                          </Link>

                          {route.status !== "completed" && (
                            <form action={unclaimRoute}>
                              <input type="hidden" name="routeId" value={route.id} />
                              <button
                                type="submit"
                                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                              >
                                Unclaim Route
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}