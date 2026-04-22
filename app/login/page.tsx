import Link from "next/link";

export default function LoginSelectorPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="w-full space-y-10">
          <div className="text-center">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              FetchValet Login
            </div>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-900">
              Choose your portal
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Sign in to the right FetchValet experience for your role.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href="/admin/login"
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Admin
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                Admin Portal
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Manage workers, routes, properties, payouts, invoices, and
                operations.
              </p>
              <div className="mt-6 text-sm font-semibold text-blue-600">
                Go to Admin Login →
              </div>
            </Link>

            <Link
              href="/worker/login"
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Worker
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                Worker Portal
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Claim routes, manage your work, improve your score, and track
                payouts.
              </p>
              <div className="mt-6 text-sm font-semibold text-blue-600">
                Go to Worker Login →
              </div>
            </Link>

            <Link
              href="/property/login"
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Property
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                Property Portal
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Review schedules, proof photos, invoices, and property service
                details.
              </p>
              <div className="mt-6 text-sm font-semibold text-blue-600">
                Go to Property Login →
              </div>
            </Link>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}