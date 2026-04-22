import Link from "next/link";
import { loginWorker } from "../../auth/actions";

export default function WorkerLoginPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <section className="space-y-6">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              FetchValet Worker Portal
            </div>

            <div>
              <h1 className="text-5xl font-bold tracking-tight text-slate-900">
                Claim routes.
                <span className="block text-blue-600">Get paid.</span>
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-600">
                Sign in to view available routes, manage assigned work, track your
                worker score, and review your payouts.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Routes</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  Claim work fast
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Performance</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  Track your score
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
                href="/signup/worker"
                className="rounded-2xl px-5 py-3 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Need an account?
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Worker Login
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Sign in to your worker portal
              </h2>
              <p className="mt-3 text-slate-600">
                Use your worker email and password to view available routes and
                manage your work.
              </p>
            </div>

            <form action={loginWorker} className="mt-8 space-y-5">
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
                  placeholder="worker@email.com"
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
                Log In as Worker
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-600">
              Need an account?{" "}
              <Link
                href="/signup/worker"
                className="font-semibold text-blue-600 underline underline-offset-2"
              >
                Sign up here
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}