import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createClient } from "@/src/lib/supabase/server";
import { createRoute } from "./actions/create-route";
import { deleteRoute } from "./actions/route-actions";
import DeleteRouteButton from "./DeleteRouteButton";
import AutoGenerateForm from "./AutoGenerateForm";

type PropertyRecord = {
  id: string;
  name: string;
};

type RouteRecord = {
  id: string;
  route_date: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string | null;
  payout_cents: number | null;
  minimum_worker_score: number | null;
  properties: {
    name: string;
  } | null;
};

function formatMoney(cents: number | null) {
  return `$${((cents || 0) / 100).toFixed(2)}`;
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

function normalizeProperty(value: unknown): { name: string } | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    const first = value[0];
    if (
      first &&
      typeof first === "object" &&
      "name" in first &&
      typeof (first as { name?: unknown }).name === "string"
    ) {
      return { name: (first as { name: string }).name };
    }
    return null;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as { name?: unknown }).name === "string"
  ) {
    return { name: (value as { name: string }).name };
  }

  return null;
}

export default async function AdminRoutesPage() {
  const supabase = await createClient();

  const [
    { data: properties, error: propertiesError },
    { data: routes, error: routesError },
  ] = await Promise.all([
    supabase
      .from("properties")
      .select("id, name")
      .eq("property_status", "active")
      .order("name", { ascending: true }),
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
        properties (
          name
        )
      `)
      .order("route_date", { ascending: false }),
  ]);

  const typedProperties: PropertyRecord[] = (properties ?? []).map((row) => {
    const record = row as Record<string, unknown>;

    return {
      id: String(record.id ?? ""),
      name: typeof record.name === "string" ? record.name : "Unknown Property",
    };
  });

  const typedRoutes: RouteRecord[] = (routes ?? []).map((row) => {
    const record = row as Record<string, unknown>;

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
      properties: normalizeProperty(record.properties),
    };
  });

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            Route Operations
          </p>
          <h1 className="mt-2 text-4xl font-bold">Route Generator</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Generate routes manually, auto-generate scheduled routes, and manage
            existing routes.
          </p>
        </div>

        {(propertiesError || routesError) && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error: {propertiesError?.message || routesError?.message}
          </div>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Create Route</h2>
            <p className="mt-2 text-sm text-slate-500">
              Select a property and generate one or more split routes from all
              active units.
            </p>

            <form action={createRoute} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Property
                </label>
                <select
                  name="propertyId"
                  required
                  defaultValue=""
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                >
                  <option value="">Select a property</option>
                  {typedProperties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Route Date
                </label>
                <input
                  name="routeDate"
                  type="date"
                  required
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Start Time
                  </label>
                  <input
                    name="startTime"
                    type="time"
                    required
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    End Time
                  </label>
                  <input
                    name="endTime"
                    type="time"
                    required
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Payout ($)
                  </label>
                  <input
                    name="payoutDollars"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Minimum Worker Score
                  </label>
                  <input
                    name="minimumWorkerScore"
                    type="number"
                    min="0"
                    defaultValue={0}
                    required
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Generate Route
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Auto Generate</h2>
            <p className="mt-2 text-sm text-slate-500">
              Generate scheduled routes for active properties with auto-generate
              enabled.
            </p>

            <AutoGenerateForm />

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Auto-generation only runs for active properties with matching
              service days and no existing route for the target date.
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Recent Routes</h2>
          <p className="mt-2 text-sm text-slate-500">
            Manage generated routes and delete routes if needed.
          </p>

          <div className="mt-5 space-y-4">
            {typedRoutes.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                No routes found yet.
              </div>
            ) : (
              typedRoutes.map((route) => (
                <div
                  key={route.id}
                  className="rounded-2xl border bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xl font-bold text-slate-900">
                        {route.properties?.name || "Unknown Property"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
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
                        {(route.status || "unknown").replaceAll("_", " ")}
                      </span>

                      <p className="text-2xl font-bold text-slate-900">
                        {formatMoney(route.payout_cents)}
                      </p>

                      <form action={deleteRoute}>
                        <input type="hidden" name="routeId" value={route.id} />
                        <DeleteRouteButton />
                      </form>
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