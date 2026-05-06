import Link from "next/link";
import { loginAdmin } from "../../auth/actions";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
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
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="admin@fetchvalet.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white"
          >
            Log In
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm font-bold text-blue-600">
            Back to homepage
          </Link>
        </div>
      </section>
    </main>
  );
}