import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

import {
  updateRoutePayout,
  markPayoutPaid,
} from "./actions";

function formatMoney(cents: number | null | undefined) {
  return `$${((cents ?? 0) / 100).toFixed(2)}`;
}

export default async function AdminPayoutsPage() {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data: routes, error } = await supabase
    .from("routes")
    .select("*")
    .order("route_date", { ascending: false });

  const workerIds = Array.from(
    new Set(
      (routes ?? [])
        .map((route) => route.claimed_by)
        .filter(Boolean)
    )
  );

  let workerMap = new Map<string, string>();

  if (workerIds.length > 0) {
    const { data: workers } = await supabase
      .from("profiles")
      .select("id, full_name, display_name")
      .in("id", workerIds);

    workerMap = new Map(
      (workers ?? []).map((worker) => [
        worker.id,
        worker.display_name ||
          worker.full_name ||
          "Unnamed Worker",
      ])
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      {/* HEADER */}
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
          Admin Payouts
        </p>

        <h1 className="mt-3 text-4xl font-black">
          Payouts
        </h1>

        <p className="mt-3 text-slate-200">
          Review, approve, edit, and pay workers.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          Error: {error.message}
        </div>
      )}

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-black text-slate-900">
          Worker Payouts
        </h2>

        <div className="mt-6 space-y-5">
          {!routes || routes.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
              No payouts found yet.
            </div>
          ) : (
            routes.map((route) => {
              const totalPayout =
                (route.payout_cents ?? 0) +
                (route.payout_adjustment_cents ?? 0);

              return (
                <div
                  key={route.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    {/* LEFT */}
                    <div>
                      <p className="text-xl font-black text-slate-900">
                        Route Date: {route.route_date}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        Worker:{" "}
                        {route.claimed_by
                          ? workerMap.get(route.claimed_by) ||
                            "Unknown Worker"
                          : "Unassigned"}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Status:{" "}
                        <span className="capitalize">
                          {route.status || "open"}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Payout Status:{" "}
                        <span className="capitalize font-bold">
                          {route.payout_status || "pending"}
                        </span>
                      </p>

                      <p className="mt-4 text-4xl font-black text-slate-900">
                        {formatMoney(totalPayout)}
                      </p>
                    </div>

                    {/* RIGHT */}
                    <div className="w-full max-w-md">
                      <form
                        action={updateRoutePayout}
                        className="space-y-4"
                      >
                        <input
                          type="hidden"
                          name="routeId"
                          value={route.id}
                        />

                        <div>
                          <label className="text-sm font-medium text-slate-700">
                            Adjustment ($)
                          </label>

                          <input
                            type="number"
                            step="0.01"
                            name="payoutAdjustment"
                            defaultValue={
                              (route.payout_adjustment_cents ??
                                0) / 100
                            }
                            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700">
                            Payout Status
                          </label>

                          <select
                            name="payoutStatus"
                            defaultValue={
                              route.payout_status || "pending"
                            }
                            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                          >
                            <option value="pending">
                              Pending
                            </option>

                            <option value="approved">
                              Approved
                            </option>

                            <option value="paid">
                              Paid
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700">
                            Notes
                          </label>

                          <textarea
                            name="payoutNotes"
                            defaultValue={
                              route.payout_notes || ""
                            }
                            rows={3}
                            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                          />
                        </div>

                        <button className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white">
                          Save Changes
                        </button>
                      </form>

                      <form
                        action={markPayoutPaid}
                        className="mt-3"
                      >
                        <input
                          type="hidden"
                          name="routeId"
                          value={route.id}
                        />

                        <button className="w-full rounded-2xl bg-green-600 px-5 py-3 font-bold text-white">
                          Mark Paid
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}