import Link from "next/link";
import { loginProperty } from "../../auth/actions";

export default function PropertyLoginPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <section className="space-y-6">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              FetchValet Property Portal
            </div>

            <div>
              <h1 className="text-5xl font-bold tracking-tight text-slate-900">
                Manage valet trash
                <span className="block text-blue-600">without the hassle</span>
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-600">
                Sign in to review service schedules, proof photos, invoices, and
                property activity all in one place.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Operations</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  Track service
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Billing</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  View invoices
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Homepage
              </Link>

              <Link
                href="/property/onboarding"
                className="rounded-2xl px-5 py-3 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                New property setup
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Property Login
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Sign in to your property portal
              </h2>
              <p className="mt-3 text-slate-600">
                Use your property account email and password to monitor service
                and manage your account.
              </p>
            </div>

            <form action={loginProperty} className="mt-8 space-y-5">
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
                  placeholder="manager@property.com"
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
                Log In as Property
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-600">
              New property?{" "}
              <Link
                href="/property/onboarding"
                className="font-semibold text-blue-600 underline underline-offset-2"
              >
                Set up your property
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}