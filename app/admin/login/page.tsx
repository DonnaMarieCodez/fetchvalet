import Link from "next/link";
import { loginAdmin } from "../../auth/actions";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <section className="space-y-6">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              FetchValet Admin
            </div>

            <div>
              <h1 className="text-5xl font-bold tracking-tight text-slate-900">
                Admin access for
                <span className="block text-blue-600">FetchValet</span>
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-600">
                Sign in to manage workers, properties, routes, payouts, invoices,
                and complaints from one dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Homepage
              </Link>

              <Link
                href="/login"
                className="rounded-2xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
              >
                Other login options
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Admin Login
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Sign in to your dashboard
              </h2>
              <p className="mt-3 text-slate-600">
                Use your admin email and password to access the FetchValet admin
                portal.
              </p>
            </div>

            <form action={loginAdmin} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                  placeholder="admin@fetchvalet.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Log In as Admin
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              This portal is for approved admin users only.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}