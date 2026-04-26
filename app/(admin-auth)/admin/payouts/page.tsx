import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createClient } from "@/src/lib/supabase/server";
import { releaseWorkerPayout } from "./actions";

type PayoutRoute = {
  id: string;
  route_date: string | null;
  status: string | null;
  worker_payout_cents: number | null;
  worker_payout_status: string | null;
  stripe_transfer_id: string | null;
  properties: { name: string | null } | { name: string | null }[] | null;
  profiles:
    | {
        full_name: string | null;
        stripe_account_id: string | null;
        stripe_payouts_enabled: boolean | null;
      }
    | {
        full_name: string | null;
        stripe_account_id: string | null;
        stripe_payouts_enabled: boolean | null;
      }[]
    | null;
};

function formatMoney(cents: number | null) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents || 0) / 100);
}

function getOne<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export default async function AdminPayoutsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("routes")
    .select(`
      id,
      route_date,
      status,
      worker_payout_cents,
      worker_payout_status,
      stripe_transfer_id,
      properties (
        name
      ),
      profiles!routes_claimed_by_fkey (
        full_name,
        stripe_account_id,
        stripe_payouts_enabled
      )
    `)
    .not("claimed_by", "is", null)
    .order("route_date", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-rose-50 p-8 text-rose-700">
          Failed to load payouts: {error.message}
        </div>
      </main>
    );
  }

  const routes = (data ?? []) as PayoutRoute[];

  const payableRoutes = routes.filter(
    (route) =>
      route.status === "completed" &&
      route.worker_payout_status !== "paid" &&
      !route.stripe_transfer_id
  );

  const paidRoutes = routes.filter(
    (route) => route.worker_payout_status === "paid" || route.stripe_transfer_id
  );

  const pendingAmount = payableRoutes.reduce(
    (sum, route) => sum + Number(route.worker_payout_cents || 0),
    0
  );

  const paidAmount = paidRoutes.reduce(
    (sum, route) => sum + Number(route.worker_payout_cents || 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                FetchValet Admin
              </p>
              <h1 className="mt-2 text-4xl font-bold">Worker Payouts</h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                Release payments to workers after completed routes.
              </p>
            </div>

            <Link
              href="/admin"
              className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Payable Routes</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              {payableRoutes.length}
            </p>
          </div>

          <div className="rounded-3xl bg-amber-50 p-6 shadow-sm ring-1 ring-amber-100">
            <p className="text-sm text-amber-700">Pending Payouts</p>
            <p className="mt-3 text-4xl font-bold text-amber-900">
              {formatMoney(pendingAmount)}
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-50 p-6 shadow-sm ring-1 ring-emerald-100">
            <p className="text-sm text-emerald-700">Paid</p>
            <p className="mt-3 text-4xl font-bold text-emerald-900">
              {formatMoney(paidAmount)}
            </p>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            Ready to Pay
          </h2>

          <div className="mt-6 space-y-4">
            {payableRoutes.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                No completed routes are ready for payout.
              </div>
            ) : (
              payableRoutes.map((route) => {
                const property = getOne(route.properties);
                const worker = getOne(route.profiles);
                const stripeReady = Boolean(
                  worker?.stripe_account_id && worker?.stripe_payouts_enabled
                );

                return (
                  <div
                    key={route.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xl font-bold text-slate-900">
                          {property?.name || "Unnamed Property"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Worker: {worker?.full_name || "Unknown Worker"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Route date: {route.route_date || "Not set"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Stripe: {stripeReady ? "Ready" : "Not ready"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 md:items-end">
                        <p className="text-3xl font-bold text-slate-900">
                          {formatMoney(route.worker_payout_cents)}
                        </p>

                        <form action={releaseWorkerPayout}>
                          <input type="hidden" name="routeId" value={route.id} />
                          <button
                            type="submit"
                            disabled={!stripeReady}
                            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            Release Payout
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

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            Paid Routes
          </h2>

          <div className="mt-6 space-y-4">
            {paidRoutes.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                No routes have been paid yet.
              </div>
            ) : (
              paidRoutes.map((route) => {
                const property = getOne(route.properties);
                const worker = getOne(route.profiles);

                return (
                  <div
                    key={route.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          {property?.name || "Unnamed Property"}
                        </p>
                        <p className="text-sm text-slate-500">
                          Worker: {worker?.full_name || "Unknown Worker"}
                        </p>
                        <p className="text-sm text-slate-500">
                          Transfer: {route.stripe_transfer_id || "Recorded"}
                        </p>
                      </div>

                      <p className="text-2xl font-bold text-emerald-700">
                        {formatMoney(route.worker_payout_cents)}
                      </p>
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