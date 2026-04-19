import Link from "next/link";
import { loginProperty } from "./actions";

export default function PropertyLoginPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-10 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
              Property Portal
            </p>
            <h1 className="mt-3 text-5xl font-bold">FetchValet</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-200">
              Secure access for property managers to review service activity,
              invoices, complaints, and account details.
            </p>

            <div className="mt-8 space-y-3 text-sm text-slate-200">
              <p>• View service history</p>
              <p>• Review invoice activity</p>
              <p>• Track complaint and service quality status</p>
            </div>

            <div className="mt-8">
              <Link
                href="/"
                className="rounded-2xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Back to Home
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-3xl font-bold text-slate-900">Property Login</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in with your property account credentials.
            </p>

            <form action={loginProperty} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-2xl border px-3 py-3"
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
                  className="mt-1 w-full rounded-2xl border px-3 py-3"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}