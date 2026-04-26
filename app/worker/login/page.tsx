import Link from "next/link";
import { loginWorker } from "../../auth/actions";

export default function WorkerLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          FetchValet Worker
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-900">
          Worker Login
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Sign in to view your status, claim routes, and track earnings.
        </p>

        <form action={loginWorker} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="worker@email.com"
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
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Log In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Need an account?{" "}
          <Link href="/signup/worker" className="font-semibold text-blue-600">
            Become a Worker
          </Link>
        </p>
      </div>
    </main>
  );
}