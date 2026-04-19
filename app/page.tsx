import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-100">
      <section className="mx-auto max-w-7xl px-8 py-12">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-10 text-white shadow-lg">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
              Valet Trash Operations Platform
            </p>
            <h1 className="mt-3 text-5xl font-bold leading-tight">
              FetchValet
            </h1>
            <p className="mt-4 text-lg text-slate-200">
              Manage workers, properties, payouts, complaints, and service routes
              from one streamlined platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
              >
                Go to Admin
              </Link>

              <Link
                href="/worker"
                className="rounded-2xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Go to Worker Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Link
            href="/admin"
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                  Admin
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Operations Hub
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Manage workers, properties, routes, complaints, approvals,
                  and payouts from one control center.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                Open
              </div>
            </div>
          </Link>

          <Link
            href="/worker"
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                  Worker
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Route Center
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Claim routes, complete stops, upload proof, report delays,
                  and track pay.
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                Open
              </div>
            </div>
          </Link>

          <Link
            href="/property"
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                  Property
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Property Portal
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Review service activity, invoices, and property-specific
                  operations details.
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                Open
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Worker Operations</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              Route claims, proof, and scoring
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Designed to support route completion, accountability, and payout tracking.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Property Setup</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              Buildings, units, and service details
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Configure operational data cleanly so route generation becomes easier.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Admin Visibility</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              Dashboard, approvals, complaints, payouts
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Keep oversight centralized with one consistent operations view.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}