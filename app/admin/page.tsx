import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

type RouteRecord = {
  id: string;
  route_date: string | null;
  status: string | null;
  payout_cents: number | null;
  properties: {
    name: string | null;
  } | null;
};

function getStatusBadge(status: string | null) {
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
  await requireAdmin();

  const supabase = createAdminClient();

  const [
    routesResult,
    workersResult,
    propertiesResult,
    openRoutesResult,
    activeRoutesResult,
    completedRoutesResult,
  ] = await Promise.all([
    supabase
      .from("routes")
      .select("id, route_date, status, payout_cents, properties(name)")
      .order("route_date", { ascending: false })
      .limit(8),

    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "worker"),

    supabase
      .from("properties")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("routes")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),

    supabase
      .from("routes")
      .select("*", { count: "exact", head: true })
      .in("status", ["claimed", "in_progress"]),

    supabase
      .from("routes")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
  ]);

  const routes = (routesResult.data ?? []) as unknown as RouteRecord[];

  const error =
    routesResult.error ||
    workersResult.error ||
    propertiesResult.error ||
    openRoutesResult.error ||
    activeRoutesResult.error ||
    completedRoutesResult.error;

  return (
    <main className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
          Operations Center
        </p>
        <h1 className="mt-2 text-4xl font-black">Admin Dashboard</h1>
        <p className="mt-3 max-w-2xl text-slate-200">
          Monitor workers, properties, and route activity in real time.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {error.message}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Link
          href="/admin/workers"
          className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <p className="text-sm text-slate-500">Workers</p>
          <p className="mt-3 text-4xl font-black">
            {workersResult.count ?? 0}
          </p>
        </Link>

        <Link
          href="/admin/properties"
          className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <p className="text-sm text-slate-500">Properties</p>
          <p className="mt-3 text-4xl font-black">
            {propertiesResult.count ?? 0}
          </p>
        </Link>

        <Link
          href="/admin/routes"
          className="rounded-3xl bg-blue-50 p-5 shadow-sm ring-1 ring-blue-100"
        >
          <p className="text-sm text-blue-700">Open Routes</p>
          <p className="mt-3 text-4xl font-black text-blue-900">
            {openRoutesResult.count ?? 0}
          </p>
        </Link>

        <Link
          href="/admin/routes"
          className="rounded-3xl bg-amber-50 p-5 shadow-sm ring-1 ring-amber-100"
        >
          <p className="text-sm text-amber-700">Active Routes</p>
          <p className="mt-3 text-4xl font-black text-amber-900">
            {activeRoutesResult.count ?? 0}
          </p>
        </Link>

        <Link
          href="/admin/routes"
          className="rounded-3xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100"
        >
          <p className="text-sm text-emerald-700">Completed</p>
          <p className="mt-3 text-4xl font-black text-emerald-900">
            {completedRoutesResult.count ?? 0}
          </p>
        </Link>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">Recent Routes</h2>

          <Link
            href="/admin/routes"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            View all routes
          </Link>
        </div>

        {routes.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
            No routes found.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {routes.map((route) => (
              <div
                key={route.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-bold text-slate-900">
                      {route.properties?.name || "Unknown Property"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {route.route_date || "No date assigned"}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                      route.status
                    )}`}
                  >
                    {(route.status || "unknown").replace("_", " ")}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  Payout: ${((route.payout_cents ?? 0) / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}