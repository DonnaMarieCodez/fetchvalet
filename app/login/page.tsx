import { loginAdmin } from "@/app/auth/actions";
import { redirect } from "next/navigation";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const error = searchParams?.error;

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Admin Login
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Sign in to FetchValet
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Authorized administrators only.
          </p>
        </div>

        {/* Form */}
        <form action={loginAdmin} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-black"
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
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-black"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-black py-3 text-white font-semibold hover:bg-slate-900 transition"
          >
            Log In
          </button>
        </form>

        {/* Errors */}
        {error === "invalid" && (
          <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            Invalid email or password.
          </div>
        )}

        {error === "unauthorized" && (
          <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            You are not authorized as an admin.
          </div>
        )}

        {error === "missing" && (
          <div className="mt-5 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-700">
            Please enter email and password.
          </div>
        )}

        {/* Back */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-blue-600 hover:underline"
          >
            Back to homepage
          </a>
        </div>
      </div>
    </main>
  );
}