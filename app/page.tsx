import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-2xl font-bold text-slate-900">FetchValet</p>
            <p className="text-sm text-slate-500">
              Smart valet trash operations platform
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/login"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Admin Login
            </Link>
            <Link
              href="/property/login"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Property Login
            </Link>
            <Link
              href="/login"
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Worker Login
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              Modern valet trash management
            </div>

            <div>
              <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                Simplify valet trash
                <span className="block text-blue-600">for every property</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                FetchValet helps property managers, workers, and admins stay in
                sync with smarter route scheduling, worker accountability, proof
                photos, payouts, invoicing, and daily operations.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/property/login"
                className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Property Portal
              </Link>

              <Link
                href="/signup/worker"
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Worker Sign Up
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Route Automation
              </p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">
                Smarter daily route generation
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Generate routes based on property schedules, service days, and
                active operations.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Worker Management
              </p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">
                Approvals, scores, and accountability
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Track worker performance, route claims, suspensions, and score
                improvement over time.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Proof & Compliance
              </p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">
                Required proof photos
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Keep service transparent with proof photo uploads and a reviewable
                admin gallery.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Billing & Payouts
              </p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">
                Invoices and worker pay
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Manage monthly property billing, invoice records, and worker
                payout tracking in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-[2rem] bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-10 text-white shadow-xl">
          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                For Properties
              </p>
              <h3 className="mt-3 text-2xl font-bold">
                Stay on top of service
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Monitor schedules, invoices, proof photos, and property-level
                service operations.
              </p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                For Workers
              </p>
              <h3 className="mt-3 text-2xl font-bold">Claim and complete routes</h3>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                View available routes, manage your worker score, and track your
                payout status.
              </p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                For Admins
              </p>
              <h3 className="mt-3 text-2xl font-bold">Run operations from one dashboard</h3>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Manage workers, approvals, properties, routes, complaints,
                payouts, and accounting.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/admin/login"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Admin Login
            </Link>
            <Link
              href="/property/login"
              className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Property Login
            </Link>
            <Link
              href="/signup/worker"
              className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Become a Worker
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}