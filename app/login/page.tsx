import Link from "next/link";
import { loginWorker } from "../auth/actions";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Worker Login</h1>
        <p className="mt-2 text-slate-600">
          Sign in to claim routes and manage your work.
        </p>

        <form action={loginWorker} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
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
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-white"
          >
            Log In
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Need an account?{" "}
          <Link href="/signup/worker" className="text-blue-600 underline">
            Sign up here
          </Link>
        </p>
      </div>
    </main>
  );
}
