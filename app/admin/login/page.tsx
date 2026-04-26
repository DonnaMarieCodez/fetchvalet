import Link from "next/link";
import { loginAdmin } from "../../auth/actions";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          
          {/* LEFT SIDE */}
          <section className="space-y-6 text-white">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur">
              FetchValet Admin
            </div>

            <div>
              <h1 className="text-5xl font-bold tracking-tight">
                Admin access for
                <span className="block text-blue-500">FetchValet</span>
              </h1>

              <p className="mt-4 max-w-xl text-lg text-slate-300">
                Manage workers, properties, routes, payouts, invoices, and
                complaints from one secure dashboard.
              </p>
            </div>

            {/* ONLY safe navigation */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
              >
                Back to Homepage
              </Link>
            </div>
          </section>

          {/* RIGHT SIDE */}
          <section className="rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Admin Login
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Sign in to your dashboard
              </h2>

              <p className="mt-3 text-slate-600">
                This portal is restricted to authorized FetchValet administrators.
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
              Unauthorized access is prohibited.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}