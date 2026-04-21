import Link from "next/link";
import { createClient } from "../../../src/lib/supabase/server";
import { claimRoute } from "./actions/claim-route";
import { unclaimRoute } from "./actions/unclaim-route";

type RouteRecord = {
  id: string;
  route_date: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string | null;
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

type ProfileRecord = {
  id: string;
  full_name: string | null;
  status: string | null;
  worker_score: number | null;
};

function formatMoney(cents: number | null | undefined) {
  return `$${((cents ?? 0) / 100).toFixed(2)}`;
}

function formatTime(value: string | null) {
  if (!value) return "Not set";

  const raw = String(value).trim();
  if (!raw) return "Not set";
  if (raw.includes("AM") || raw.includes("PM")) return raw;

  const [hourString, minuteString = "00"] = raw.split(":");
  const hour = Number(hourString);
  const minute = String(minuteString).padStart(2, "0");

  if (Number.isNaN(hour)) return raw;

  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${hour12}:${minute} ${suffix}`;
}

function normalizeProperty(
  value: unknown
): { id: string; name: string; city: string; state: string } | null {
  const normalizeOne = (
    obj: unknown
  ): { id: string; name: string; city: string; state: string } | null => {
    if (!obj || typeof obj !== "object") return null;

    const record = obj as Record<string, unknown>;

    return {
      id: typeof record.id === "string" ? record.id : "",
      name: typeof record.name === "string" ? record.name : "Unknown Property",
      city: typeof record.city === "string" ? record.city : "Unknown City",
      state: typeof record.state === "string" ? record.state : "Unknown State",
    };
  };

  if (Array.isArray(value)) {
    return normalizeOne(value[0]);
  }

  return normalizeOne(value);
}

function normalizeRoute(row: unknown): RouteRecord {
  const record = (row ?? {}) as Record<string, unknown>;

  return {
    id: String(record.id ?? ""),
    route_date:
      typeof record.route_date === "string" ? record.route_date : null,
    start_time:
      typeof record.start_time === "string" ? record.start_time : null,
    end_time: typeof record.end_time === "string" ? record.end_time : null,
    status: typeof record.status === "string" ? record.status : null,
    payout_cents:
      typeof record.payout_cents === "number" ? record.payout_cents : 0,
    minimum_worker_score:
      typeof record.minimum_worker_score === "number"
        ? record.minimum_worker_score
        : 0,
    claimed_by:
      typeof record.claimed_by === "string" ? record.claimed_by : null,
    properties: normalizeProperty(record.properties),
  };
}

function normalizeProfile(row: unknown): ProfileRecord {
  const record = (row ?? {}) as Record<string, unknown>;

  return {
    id: String(record.id ?? ""),
    full_name:
      typeof record.full_name === "string" ? record.full_name : null,
    status: typeof record.status === "string" ? record.status : null,
    worker_score:
      typeof record.worker_score === "number" ? record.worker_score : 0,
  };
}

function getWorkerTier(score: number) {
  if (score >= 95) return "Elite";
  if (score >= 85) return "Preferred";
  if (score >= 70) return "Standard";
  return "Probation";
}

function getStatusBadge(status: string | null) {
  switch ((status || "").toLowerCase()) {
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

function canUnclaimWithoutPenalty(route: RouteRecord) {
  if (!route.route_date || !route.start_time) return true;

  const start = new Date(`${route.route_date}T${route.start_time}`);
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours >= 1.5;
}

export default async function WorkerRoutesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Available Routes</h1>
          <p className="mt-3 text-slate-600">You must be logged in to view routes.</p>
        </div>
      </main>
    );
  }

  const [{ data: profileData, error: profileError }, { data: availableRoutes, error: availableError }, { data: myRoutes, error: myRoutesError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, status, worker_score")
        .eq("id", user.id)
        .single(),

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
        .is("claimed_by", null)
        .eq("status", "open")
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
        .order("route_date", { ascending: true }),
    ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (availableError) {
    throw new Error(availableError.message);
  }

  if (myRoutesError) {
    throw new Error(myRoutesError.message);
  }

  const profile = normalizeProfile(profileData);
  const workerScore = profile.worker_score ?? 0;
  const workerTier = getWorkerTier(workerScore);

  const typedAvailableRoutes: RouteRecord[] = (availableRoutes ?? [])
    .map(normalizeRoute)
    .filter((route) => (route.minimum_worker_score ?? 0) <= workerScore);

  const typedMyRoutes: RouteRecord[] = (myRoutes ?? []).map(normalizeRoute);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Worker Portal
              </p>
              <h1 className="mt-2 text-4xl font-bold">Available Routes</h1>
              <p className="mt-3 text-slate-200">
                Claim open routes that match your worker score and manage the routes
                already assigned to you.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/worker/score"
                className="rounded-3xl bg-white/10 px-7 py-5 text-left ring-1 ring-white/10 transition hover:bg-white/15"
              >
                <p className="text-sm text-slate-200">Worker Score</p>
                <p className="mt-2 text-5xl font-bold text-white">{workerScore}</p>
                <p className="mt-2 text-sm text-slate-200">
                  {workerTier} • Tap to see how to improve
                </p>
              </Link>

              <Link
                href="/worker"
                className="rounded-3xl border border-white/25 px-7 py-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {String(profile.status || "").toLowerCase() !== "approved" ? (
          <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Application Received</h2>
            <p className="mt-3 text-slate-600">
              Your worker account has been created and is currently pending approval.
            </p>
            <Link
              href="/worker"
              className="mt-5 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to Dashboard
            </Link>
          </section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
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
                          <p className="mt-1 text-slate-500">
                            {route.properties?.city || "Unknown City"},{" "}
                            {route.properties?.state || "Unknown State"}
                          </p>
                          <p className="mt-3 text-sm text-slate-600">
                            Date: {route.route_date || "Not set"}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Time: {formatTime(route.start_time)} -{" "}
                            {formatTime(route.end_time)}
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
                            {route.status || "open"}
                          </span>

                          <p className="text-2xl font-bold text-slate-900">
                            {formatMoney(route.payout_cents)}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/worker/routes/${route.id}`}
                              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              Open Route
                            </Link>

                            <form action={claimRoute}>
                              <input type="hidden" name="routeId" value={route.id} />
                              <button
                                type="submit"
                                className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                              >
                                Claim Route
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">My Routes</h2>
              <p className="mt-2 text-sm text-slate-500">
                Routes currently assigned to you.
              </p>

              <div className="mt-5 space-y-4">
                {typedMyRoutes.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                    You have not claimed any routes yet.
                  </div>
                ) : (
                  typedMyRoutes.map((route) => {
                    const noPenalty = canUnclaimWithoutPenalty(route);

                    return (
                      <div
                        key={route.id}
                        className="rounded-2xl border bg-slate-50 p-5"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-xl font-bold text-slate-900">
                              {route.properties?.name || "Unknown Property"}
                            </p>
                            <p className="mt-1 text-slate-500">
                              {route.properties?.city || "Unknown City"},{" "}
                              {route.properties?.state || "Unknown State"}
                            </p>
                            <p className="mt-3 text-sm text-slate-600">
                              Date: {route.route_date || "Not set"}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              Time: {formatTime(route.start_time)} -{" "}
                              {formatTime(route.end_time)}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              Minimum Score: {route.minimum_worker_score ?? 0}
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                              {noPenalty
                                ? "You can unclaim this route without a score penalty."
                                : "Unclaiming now may lower your score because the route starts in less than 1.5 hours."}
                            </p>
                          </div>

                          <div className="flex flex-col items-start gap-3 md:items-end">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                                route.status
                              )}`}
                            >
                              {(route.status || "claimed").replaceAll("_", " ")}
                            </span>

                            <p className="text-2xl font-bold text-slate-900">
                              {formatMoney(route.payout_cents)}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/worker/routes/${route.id}`}
                                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                              >
                                Open Route
                              </Link>

                              <form action={unclaimRoute}>
                                <input type="hidden" name="routeId" value={route.id} />
                                <button
                                  type="submit"
                                  className="rounded-2xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                                >
                                  Unclaim Route
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}