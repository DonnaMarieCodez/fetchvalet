import { createClient } from "../../../src/lib/supabase/server";
import { updatePayoutStatus } from "./payout-actions";

type PayoutRouteRecord = {
  id: string;
  route_date: string;
  status: string;
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

function getPayoutBadge(status: string | null) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "on_hold":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function formatMoney(cents: number | null) {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

function derivePayoutStatus(route: PayoutRouteRecord) {
  return route.payout_status || "pending";
}

function getWorkerName(route: PayoutRouteRecord) {
  return (
    route.profiles?.full_name ||
    route.profiles?.display_name ||
    "Unassigned"
  );
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
      properties(name),
      profiles!routes_claimed_by_fkey(full_name, display_name)
    `)
    .order("route_date", { ascending: false });

  const routes = (data ?? []) as PayoutRouteRecord[];

  const pendingRoutes = routes.filter(
    (route) => derivePayoutStatus(route) === "pending"
  );

  const paidRoutes = routes.filter(
    (route) => derivePayoutStatus(route) === "paid"
  );

  const holdRoutes = routes.filter(
    (route) => derivePayoutStatus(route) === "on_hold"
  );

  const totalPendingAmount = pendingRoutes.reduce(
    (sum, route) => sum + Number(route.payout_cents || 0),
    0
  );

  const totalPaidAmount = paidRoutes.reduce(
    (sum, route) => sum + Number(route.payout_cents || 0),
    0
  );

  const totalHoldAmount = holdRoutes.reduce(
    (sum, route) => sum + Number(route.payout_cents || 0),
    0
  );

  return (
    <>
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
          Finance Operations
        </p>
        <h1 className="mt-2 text-4xl font-bold">Payout Management</h1>
        <p className="mt-3 max-w-2xl text-slate-200">
          Review route payouts, update statuses, and keep payment activity organized.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {error.message}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-amber-50 p-5 shadow-sm ring-1 ring-amber-100">
          <p className="text-sm font-medium text-amber-700">Pending Payouts</p>
          <p className="mt-3 text-4xl font-bold text-amber-900">
            {pendingRoutes.length}
          </p>
          <p className="mt-2 text-sm text-amber-700">
            {formatMoney(totalPendingAmount)} waiting to be paid
          </p>
        </div>

        <div className="rounded-3xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
          <p className="text-sm font-medium text-emerald-700">Paid</p>
          <p className="mt-3 text-4xl font-bold text-emerald-900">
            {paidRoutes.length}
          </p>
          <p className="mt-2 text-sm text-emerald-700">
            {formatMoney(totalPaidAmount)} completed
          </p>
        </div>

        <div className="rounded-3xl bg-rose-50 p-5 shadow-sm ring-1 ring-rose-100">
          <p className="text-sm font-medium text-rose-700">On Hold</p>
          <p className="mt-3 text-4xl font-bold text-rose-900">
            {holdRoutes.length}
          </p>
          <p className="mt-2 text-sm text-rose-700">
            {formatMoney(totalHoldAmount)} delayed
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Routes</p>
          <p className="mt-3 text-4xl font-bold text-slate-900">
            {routes.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            All routes with payout records
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900">Pending Payouts</h2>
        <p className="mt-1 text-sm text-slate-500">
          Completed work that still needs payout processing.
        </p>

        <div className="mt-4 space-y-4">
          {pendingRoutes.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <p className="text-slate-600">No pending payouts right now.</p>
            </div>
          ) : (
            pendingRoutes.map((route) => (
              <div
                key={route.id}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {route.properties?.name || "Unknown Property"}
                      </h3>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getPayoutBadge(
                          derivePayoutStatus(route)
                        )}`}
                      >
                        {derivePayoutStatus(route).replace("_", " ")}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-3">
                      <p>
                        <span className="font-medium text-slate-900">Route Date:</span>{" "}
                        {route.route_date}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Route Status:</span>{" "}
                        {route.status}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Payout:</span>{" "}
                        {formatMoney(route.payout_cents)}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Worker:</span>{" "}
                        {getWorkerName(route)}
                      </p>
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-700">Current Notes</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {route.payout_notes || "No payout notes added."}
                      </p>
                    </div>
                  </div>

                  <div className="w-full max-w-md rounded-2xl border bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Update Payout
                    </p>

                    <form action={updatePayoutStatus} className="mt-4 space-y-4">
                      <input type="hidden" name="routeId" value={route.id} />

                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Payout Status
                        </label>
                        <select
                          name="payoutStatus"
                          defaultValue={derivePayoutStatus(route)}
                          className="mt-1 w-full rounded-2xl border px-3 py-2"
                          required
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Notes
                        </label>
                        <textarea
                          name="payoutNotes"
                          rows={4}
                          defaultValue={route.payout_notes || ""}
                          className="mt-1 w-full rounded-2xl border px-3 py-2"
                          placeholder="Add payout notes, processing details, or hold reasons"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Save Payout Update
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900">Paid History</h2>
        <p className="mt-1 text-sm text-slate-500">
          Routes that have already been paid out.
        </p>

        <div className="mt-4 space-y-4">
          {paidRoutes.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <p className="text-slate-600">No paid routes yet.</p>
            </div>
          ) : (
            paidRoutes.map((route) => (
              <div
                key={route.id}
                className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {route.properties?.name || "Unknown Property"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Date: {route.route_date} · Payout: {formatMoney(route.payout_cents)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Worker: {getWorkerName(route)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Paid At:{" "}
                      {route.paid_at
                        ? new Date(route.paid_at).toLocaleString()
                        : "Not recorded"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getPayoutBadge(
                      derivePayoutStatus(route)
                    )}`}
                  >
                    {derivePayoutStatus(route).replace("_", " ")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900">On Hold</h2>
        <p className="mt-1 text-sm text-slate-500">
          Routes with payout issues or items pending review.
        </p>

        <div className="mt-4 space-y-4">
          {holdRoutes.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <p className="text-slate-600">No payouts on hold right now.</p>
            </div>
          ) : (
            holdRoutes.map((route) => (
              <div
                key={route.id}
                className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {route.properties?.name || "Unknown Property"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Date: {route.route_date} · Payout: {formatMoney(route.payout_cents)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Worker: {getWorkerName(route)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {route.payout_notes || "No payout notes added."}
                    </p>
                  </div>

                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getPayoutBadge(
                      derivePayoutStatus(route)
                    )}`}
                  >
                    {derivePayoutStatus(route).replace("_", " ")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}