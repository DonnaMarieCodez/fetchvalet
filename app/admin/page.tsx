import { requireAdmin } from "../../../src/lib/auth/require-admin";
import { createClient } from "../../../src/lib/supabase/server";

type RouteRecord = {
  id: string;
  route_date: string;
  status: string;
  payout_cents: number;
  properties: {
    name: string;
  } | null;
};

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

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { data: routes, error: routesError },
    { count: workerCount, error: workersError },
    { count: propertyCount, error: propertiesError },
  ] = await Promise.all([
    supabase
      .from("routes")
      .select("id, route_date, status, payout_cents, properties(name)")
      .order("route_date", { ascending: false }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "worker"),
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true }),
  ]);

  const typedRoutes = (routes ?? []) as unknown as RouteRecord[];

  const openRoutes = typedRoutes.filter((r) => r.status === "open").length;
  const activeRoutes = typedRoutes.filter(
    (r) => r.status === "claimed" || r.status === "in_progress"
  ).length;
  const completedRoutes = typedRoutes.filter(
    (r) => r.status === "completed"
  ).length;

  return (
    <>
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
          Operations Center
        </p>
        <h1 className="mt-2 text-4xl font-bold">Admin Dashboard</h1>
        <p className="mt-3 max-w-2xl text-slate-200">
          Monitor workers, properties, and route activity in real time.
        </p>
      </div>

      {(routesError || workersError || propertiesError) && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          Error:{" "}
          {routesError?.message ||
            workersError?.message ||
            propertiesError?.message}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Workers</p>
          <p className="mt-3 text-4xl font-bold">{workerCount ?? 0}</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Properties</p>
          <p className="mt-3 text-4xl font-bold">{propertyCount ?? 0}</p>
        </div>

        <div className="rounded-3xl bg-blue-50 p-5 shadow-sm ring-1 ring-blue-100">
          <p className="text-sm text-blue-700">Open</p>
          <p className="mt-3 text-4xl font-bold text-blue-900">
            {openRoutes}
          </p>
        </div>

        <div className="rounded-3xl bg-amber-50 p-5 shadow-sm ring-1 ring-amber-100">
          <p className="text-sm text-amber-700">Active</p>
          <p className="mt-3 text-4xl font-bold text-amber-900">
            {activeRoutes}
          </p>
        </div>

        <div className="rounded-3xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
          <p className="text-sm text-emerald-700">Completed</p>
          <p className="mt-3 text-4xl font-bold text-emerald-900">
            {completedRoutes}
          </p>
        </div>
      </div>

      {/* Routes */}
      <div className="mt-8 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">
          Recent Routes
        </h2>

        {typedRoutes.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-slate-600">
            No routes found.
          </div>
        ) : (
          typedRoutes.map((route) => (
            <div
              key={route.id}
              className="rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {route.properties?.name || "Unknown Property"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {route.route_date}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                    route.status
                  )}`}
                >
                  {route.status.replace("_", " ")}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600">
                Payout: ${(route.payout_cents / 100).toFixed(2)}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
}