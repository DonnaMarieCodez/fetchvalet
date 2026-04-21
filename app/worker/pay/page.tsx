import Link from "next/link";
import { createClient } from "../../../src/lib/supabase/server";

type RouteRecord = {
  id: string;
  route_date: string | null;
  payout_cents: number | null;
  payout_status: string | null;
  status: string | null;
  properties: {
    name: string;
    city: string;
    state: string;
  } | null;
};

function formatMoney(cents: number | null | undefined) {
  return `$${((cents ?? 0) / 100).toFixed(2)}`;
}

function normalizeProperty(
  value: unknown
): { name: string; city: string; state: string } | null {
  const normalizeOne = (
    obj: unknown
  ): { name: string; city: string; state: string } | null => {
    if (!obj || typeof obj !== "object") return null;

    const record = obj as Record<string, unknown>;

    return {
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

function derivePayoutStatus(route: RouteRecord) {
  if (route.payout_status) return route.payout_status;
  if ((route.status || "").toLowerCase() === "completed") return "pending";
  return "not_ready";
}

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
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
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Worker Pay</h1>
          <p className="mt-3 text-slate-600">You must be logged in to view pay.</p>
        </div>
      </main>
    );
  }

  const { data: routes, error } = await supabase
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

  if (error) {
    throw new Error(error.message);
  }

  const typedRoutes: RouteRecord[] = (routes ?? []).map((row) => {
    const record = row as Record<string, unknown>;

    return {
      id: String(record.id ?? ""),
      route_date:
        typeof record.route_date === "string" ? record.route_date : null,
      payout_cents:
        typeof record.payout_cents === "number" ? record.payout_cents : 0,
      payout_status:
        typeof record.payout_status === "string" ? record.payout_status : null,
      status: typeof record.status === "string" ? record.status : null,
      properties: normalizeProperty(record.properties),
    };
  });

  const totalEarned = typedRoutes
    .filter((route) => (route.status || "").toLowerCase() === "completed")
    .reduce((sum, route) => sum + Number(route.payout_cents || 0), 0);

  const totalPending = typedRoutes
    .filter((route) => derivePayoutStatus(route) === "pending")
    .reduce((sum, route) => sum + Number(route.payout_cents || 0), 0);

  const totalPaid = typedRoutes
    .filter((route) => derivePayoutStatus(route) === "paid")
    .reduce((sum, route) => sum + Number(route.payout_cents || 0), 0);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            Worker Portal
          </p>
          <h1 className="mt-2 text-4xl font-bold">My Pay</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Review completed route payouts, pending earnings, and payment history.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Total Earned</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              {formatMoney(totalEarned)}
            </p>
          </div>

          <div className="rounded-3xl bg-amber-50 p-6 shadow-sm ring-1 ring-amber-100">
            <p className="text-sm text-amber-700">Pending</p>
            <p className="mt-3 text-4xl font-bold text-amber-900">
              {formatMoney(totalPending)}
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-50 p-6 shadow-sm ring-1 ring-emerald-100">
            <p className="text-sm text-emerald-700">Paid</p>
            <p className="mt-3 text-4xl font-bold text-emerald-900">
              {formatMoney(totalPaid)}
            </p>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Route Payouts</h2>
              <p className="mt-2 text-sm text-slate-500">
                Completed and claimed route earnings.
              </p>
            </div>

            <Link
              href="/worker"
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {typedRoutes.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                No route payouts found yet.
              </div>
            ) : (
              typedRoutes.map((route) => {
                const payoutStatus = derivePayoutStatus(route);

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
                        <p className="mt-1 text-sm text-slate-500">
                          {route.properties?.city || "Unknown City"},{" "}
                          {route.properties?.state || "Unknown State"}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          Route Date: {route.route_date || "Not set"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Route Status: {route.status || "unknown"}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-3 md:items-end">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                            payoutStatus
                          )}`}
                        >
                          {payoutStatus.replaceAll("_", " ")}
                        </span>

                        <p className="text-2xl font-bold text-slate-900">
                          {formatMoney(route.payout_cents)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}