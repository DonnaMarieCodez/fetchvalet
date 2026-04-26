import Link from "next/link";
import { signUpWorker } from "../../auth/actions";

type Props = {
  searchParams?: {
    error?: string;
  };
};

export default function WorkerSignupPage({ searchParams }: Props) {
  const error = searchParams?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-xl rounded-2xl border bg-white p-8 shadow-sm">
        {/* Header */}
        <h1 className="text-3xl font-bold text-slate-900">
          Become a FetchValet Worker
        </h1>
        <p className="mt-2 text-slate-600">
          Start earning on your schedule. Complete a few steps to get approved.
        </p>

        {/* Error Messages */}
        {error === "already_registered" && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            This email is already registered.{" "}
            <Link href="/worker/login" className="font-semibold underline">
              Log in here
            </Link>
            .
          </div>
        )}

        {error === "signup_failed" && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Something went wrong. Please try again.
          </div>
        )}

        {/* Form */}
        <form action={signUpWorker} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              name="fullName"
              type="text"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              name="phone"
              type="text"
              className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 transition"
          >
            Continue →
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/worker/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}