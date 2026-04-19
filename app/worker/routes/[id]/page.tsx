import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/server";

type RouteRecord = {
  id: string;
  route_date: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  payout_cents: number | null;
  minimum_worker_score: number | null;
  claimed_by: string | null;
  late_notified: boolean | null;
  properties: {
    id: string;
    name: string;
    city: string;
    state: string;
    address_line_1: string | null;
    requires_photo_proof: boolean | null;
  } | null;
};

type StopRecord = {
  id: string;
  stop_order: number | null;
  status: string;
  unit_id: string | null;
  units: {
    id: string;
    unit_number: string;
    floor: string | null;
    buildings: {
      id: string;
      name: string;
    } | null;
  } | null;
};

function formatMoney(cents: number | null) {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

function getRouteBadge(status: string) {
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

function getStopBadge(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "no_trash_out":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export default async function WorkerRouteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: routeId } = await params;

  if (!routeId) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Route Detail</h1>
          <p className="mt-4 text-slate-600">Missing route id.</p>
          <Link
            href="/worker/routes"
            className="mt-6 inline-block rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Routes
          </Link>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, worker_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "worker") {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Route Detail</h1>
          <p className="mt-4 text-slate-600">Worker profile not found or invalid.</p>
          <p className="mt-2 text-sm text-slate-500">
            {profileError?.message || "No worker profile returned."}
          </p>
        </div>
      </main>
    );
  }

  const { data: route, error: routeError } = await supabase
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
      late_notified,
      properties (
        id,
        name,
        city,
        state,
        address_line_1,
        requires_photo_proof
      )
    `)
    .eq("id", routeId)
    .maybeSingle();

  if (routeError || !route) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Route Detail</h1>
          <p className="mt-4 text-slate-600">This route could not be found.</p>
          <p className="mt-2 text-sm text-slate-500">Route ID: {routeId}</p>
          <p className="mt-1 text-sm text-slate-500">
            {routeError?.message || "No route row returned."}
          </p>
          <Link
            href="/worker/routes"
            className="mt-6 inline-block rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Routes
          </Link>
        </div>
      </main>
    );
  }

  const typedRoute = route as RouteRecord;

  if (
    typedRoute.claimed_by !== null &&
    typedRoute.claimed_by !== user.id &&
    typedRoute.status !== "open"
  ) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Route Detail</h1>
          <p className="mt-4 text-slate-600">You do not have access to this route.</p>
          <p className="mt-2 text-sm text-slate-500">Route ID: {routeId}</p>
        </div>
      </main>
    );
  }

  const { data: stops, error: stopsError } = await supabase
    .from("route_stops")
    .select(`
      id,
      stop_order,
      status,
      unit_id,
      units (
        id,
        unit_number,
        floor,
        buildings (
          id,
          name
        )
      )
    `)
    .eq("route_id", routeId)
    .order("stop_order", { ascending: true });

  const typedStops = (stops ?? []) as StopRecord[];

  const completedStops = typedStops.filter(
    (stop) => stop.status === "completed" || stop.status === "no_trash_out"
  ).length;

  const pendingStops = typedStops.filter((stop) => stop.status === "pending").length;

  const groupedStops = typedStops.reduce<Record<string, StopRecord[]>>((acc, stop) => {
    const buildingName = stop.units?.buildings?.name || "Unknown Building";
    if (!acc[buildingName]) acc[buildingName] = [];
    acc[buildingName].push(stop);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Worker Route
              </p>
              <h1 className="mt-2 text-4xl font-bold">
                {typedRoute.properties?.name || "Unknown Property"}
              </h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                {typedRoute.properties?.address_line_1 || "Address not set"} ·{" "}
                {typedRoute.properties?.city || "Unknown City"},{" "}
                {typedRoute.properties?.state || "Unknown State"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold capitalize ${getRouteBadge(
                  typedRoute.status
                )}`}
              >
                {typedRoute.status.replace("_", " ")}
              </span>

              <Link
                href="/worker/routes"
                className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Back to Routes
              </Link>
            </div>
          </div>
        </div>

        {stopsError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error loading stops: {stopsError.message}
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Route Payout</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              {formatMoney(typedRoute.payout_cents)}
            </p>
          </div>

          <div className="rounded-3xl bg-blue-50 p-5 shadow-sm ring-1 ring-blue-100">
            <p className="text-sm text-blue-700">Total Stops</p>
            <p className="mt-3 text-4xl font-bold text-blue-900">
              {typedStops.length}
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
            <p className="text-sm text-emerald-700">Completed</p>
            <p className="mt-3 text-4xl font-bold text-emerald-900">
              {completedStops}
            </p>
          </div>

          <div className="rounded-3xl bg-amber-50 p-5 shadow-sm ring-1 ring-amber-100">
            <p className="text-sm text-amber-700">Pending</p>
            <p className="mt-3 text-4xl font-bold text-amber-900">
              {pendingStops}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr,1.4fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Route Summary</h2>

            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>Service Date</span>
                <span className="font-semibold text-slate-900">{typedRoute.route_date}</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>Start Time</span>
                <span className="font-semibold text-slate-900">
                  {typedRoute.start_time || "Not set"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>End Time</span>
                <span className="font-semibold text-slate-900">
                  {typedRoute.end_time || "Not set"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>Minimum Worker Score</span>
                <span className="font-semibold text-slate-900">
                  {typedRoute.minimum_worker_score ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>Photo Proof</span>
                <span className="font-semibold text-slate-900">
                  {typedRoute.properties?.requires_photo_proof ? "Required" : "Optional"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>Late Notice Sent</span>
                <span className="font-semibold text-slate-900">
                  {typedRoute.late_notified ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Stops by Building</h2>

            <div className="mt-5 space-y-6">
              {typedStops.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                  No stops were found for this route.
                </div>
              ) : (
                Object.entries(groupedStops).map(([buildingName, buildingStops]) => (
                  <div key={buildingName} className="rounded-2xl border bg-slate-50 p-5">
                    <h3 className="text-xl font-bold text-slate-900">{buildingName}</h3>

                    <div className="mt-4 space-y-3">
                      {buildingStops.map((stop) => (
                        <div
                          key={stop.id}
                          className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <p className="text-lg font-semibold text-slate-900">
                              Unit {stop.units?.unit_number || "Unknown"}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Floor {stop.units?.floor || "Not set"} · Stop #{stop.stop_order ?? 0}
                            </p>
                          </div>

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStopBadge(
                              stop.status
                            )}`}
                          >
                            {stop.status.replaceAll("_", " ")}
                          </span>
                        </div>
                      ))}
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