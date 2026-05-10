import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

function formatMoney(cents: number | null | undefined) {
  return `$${((cents ?? 0) / 100).toFixed(2)}`;
}

export default async function AdminAccountingPage() {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data: properties, error } = await supabase
    .from("properties")
    .select(
      "id, name, property_status, monthly_billing_cents, default_route_payout_cents"
    )
    .order("name", { ascending: true });

  const totalMonthlyBilling =
    properties?.reduce(
      (sum, property) => sum + (property.monthly_billing_cents ?? 0),
      0
    ) ?? 0;

  const totalRoutePayoutDefaults =
    properties?.reduce(
      (sum, property) => sum + (property.default_route_payout_cents ?? 0),
      0
    ) ?? 0;

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
          Admin Accounting
        </p>
        <h1 className="mt-3 text-4xl font-black">Accounting</h1>
        <p className="mt-3 text-slate-200">
          Review property billing and route payout defaults.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          Error: {error.message}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Monthly Billing Total</p>
          <p className="mt-3 text-4xl font-black">
            {formatMoney(totalMonthlyBilling)}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Route Payout Defaults</p>
          <p className="mt-3 text-4xl font-black">
            {formatMoney(totalRoutePayoutDefaults)}
          </p>
        </div>

        <Link
          href="/admin/properties"
          className="rounded-3xl bg-blue-50 p-5 shadow-sm ring-1 ring-blue-100"
        >
          <p className="text-sm text-blue-700">Manage Pricing</p>
          <p className="mt-3 text-xl font-black text-blue-900">
            Edit properties
          </p>
        </Link>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-black text-slate-900">
          Property Billing
        </h2>

        <div className="mt-6 space-y-4">
          {!properties || properties.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
              No properties found yet.
            </div>
          ) : (
            properties.map((property) => (
              <div
                key={property.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-black text-slate-900">
                      {property.name || "Unnamed Property"}
                    </p>
                    <p className="mt-1 text-sm capitalize text-slate-600">
                      Status: {property.property_status || "pending"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-slate-500">Monthly Billing</p>
                    <p className="text-xl font-black">
                      {formatMoney(property.monthly_billing_cents)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-slate-500">Route Payout</p>
                    <p className="text-xl font-black">
                      {formatMoney(property.default_route_payout_cents)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}