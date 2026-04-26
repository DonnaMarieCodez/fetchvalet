import Link from "next/link";
import { loginAdmin } from "../../auth/actions";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
          Admin Login
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-900">
          Sign in to FetchValet
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Authorized administrators only.
        </p>

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
              placeholder="admin@fetchvalet.com"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
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
              placeholder="Enter your password"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Log In
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-sm font-semibold text-blue-600 hover:underline"
        >
          Back to homepage
        </Link>
      </div>
    </main>
  );
}