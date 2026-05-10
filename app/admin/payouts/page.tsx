import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

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

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
          Admin Payouts
        </p>
        <h1 className="mt-3 text-4xl font-black">Payouts</h1>
        <p className="mt-3 text-slate-200">
          Review completed route payouts and worker earnings.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          Error: {error.message}
        </div>
      )}

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-black text-slate-900">Route Payouts</h2>

        <div className="mt-6 space-y-4">
          {!routes || routes.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
              No payouts found yet.
            </div>
          ) : (
            routes.map((route) => (
              <div
                key={route.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-900">
                      Route Date: {route.route_date || "Not set"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Status: {route.status || "unknown"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Worker: {route.claimed_by || "Unassigned"}
                    </p>
                  </div>

                  <p className="text-2xl font-black text-slate-900">
                    {formatMoney(route.payout_cents)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}