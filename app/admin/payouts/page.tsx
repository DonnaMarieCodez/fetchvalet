import { createClient } from "../../../src/lib/supabase/server";

type PayoutRouteRecord = {
  id: string;
  route_date: string | null;
  status: string | null;
  payout_cents: number | null;
  payout_status: string | null;
  payout_notes: string | null;
  paid_at: string | null;
  claimed_by: string | null;
  properties: {
    name: string;
  } | null;
  profiles: {
    full_name: string | null;
    display_name: string | null;
  } | null;
};

function formatMoney(cents: number | null | undefined) {
  return `$${((cents ?? 0) / 100).toFixed(2)}`;
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

function normalizeProfile(
  value: unknown
): { full_name: string | null; display_name: string | null } | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    const first = value[0];

    if (first && typeof first === "object") {
      return {
        full_name:
          typeof (first as { full_name?: unknown }).full_name === "string"
            ? ((first as { full_name: string }).full_name ?? null)
            : null,
        display_name:
          typeof (first as { display_name?: unknown }).display_name === "string"
            ? ((first as { display_name: string }).display_name ?? null)
            : null,
      };
    }

    return null;
  }

  if (typeof value === "object" && value !== null) {
    return {
      full_name:
        typeof (value as { full_name?: unknown }).full_name === "string"
          ? ((value as { full_name: string }).full_name ?? null)
          : null,
      display_name:
        typeof (value as { display_name?: unknown }).display_name === "string"
          ? ((value as { display_name: string }).display_name ?? null)
          : null,
    };
  }

  return null;
}

function getWorkerName(
  profile: { full_name: string | null; display_name: string | null } | null
) {
  if (!profile) return "Unclaimed";
  return profile.full_name || profile.display_name || "Assigned Worker";
}

function derivePayoutStatus(route: PayoutRouteRecord) {
  if (route.payout_status) return route.payout_status;
  if (route.paid_at) return "paid";
  if ((route.status || "").toLowerCase() === "completed") return "pending";
  return "not_ready";
}

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "not_ready":
      return "bg-slate-50 text-slate-700 border-slate-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

export default async function AdminPayoutsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("routes")
    .select(`
      id,
      route_date,
      status,
      payout_cents,
      payout_status,
      payout_notes,
      paid_at,
      claimed_by,
      properties (
        name
      ),
      profiles:claimed_by (
        full_name,
        display_name
      )
    `)
    .order("route_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const routes: PayoutRouteRecord[] = (data ?? []).map((row) => {
    const record = row as Record<string, unknown>;

    return {
      id: String(record.id ?? ""),
      route_date:
        typeof record.route_date === "string" ? record.route_date : null,
      status: typeof record.status === "string" ? record.status : null,
      payout_cents:
        typeof record.payout_cents === "number" ? record.payout_cents : 0,
      payout_status:
        typeof record.payout_status === "string" ? record.payout_status : null,
      payout_notes:
        typeof record.payout_notes === "string" ? record.payout_notes : null,
      paid_at: typeof record.paid_at === "string" ? record.paid_at : null,
      claimed_by:
        typeof record.claimed_by === "string" ? record.claimed_by : null,
      properties: normalizeProperty(record.properties),
      profiles: normalizeProfile(record.profiles),
    };
  });

  const pendingRoutes = routes.filter(
    (route) => derivePayoutStatus(route) === "pending"
  );

  const paidRoutes = routes.filter(
    (route) => derivePayoutStatus(route) === "paid"
  );

  const totalPending = pendingRoutes.reduce(
    (sum, route) => sum + Number(route.payout_cents || 0),
    0
  );

  const totalPaid = paidRoutes.reduce(
    (sum, route) => sum + Number(route.payout_cents || 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            Payouts
          </p>
          <h1 className="mt-2 text-4xl font-bold">Worker Payouts</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Review route payouts, pending balances, and payment history.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Pending Payouts</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              {formatMoney(totalPending)}
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-50 p-6 shadow-sm ring-1 ring-emerald-100">
            <p className="text-sm text-emerald-700">Paid Out</p>
            <p className="mt-3 text-4xl font-bold text-emerald-900">
              {formatMoney(totalPaid)}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Routes Tracked</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              {routes.length}
            </p>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">All Route Payouts</h2>

          <div className="mt-5 space-y-4">
            {routes.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                No route payouts found.
              </div>
            ) : (
              routes.map((route) => {
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
                          Worker: {getWorkerName(route.profiles)}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          Route Date: {route.route_date || "Not set"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Route Status: {route.status || "unknown"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Paid At: {route.paid_at || "Not paid"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Notes: {route.payout_notes || "None"}
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