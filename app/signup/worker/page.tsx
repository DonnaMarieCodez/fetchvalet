import Link from "next/link";
import { signUpWorker } from "../../auth/actions";

type WorkerSignupPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function WorkerSignupPage({
  searchParams,
}: WorkerSignupPageProps) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-xl rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          Become a FetchValet Worker
        </h1>

        <p className="mt-2 text-slate-600">
          Start earning on your schedule. Complete your account to begin worker
          onboarding.
        </p>

        {error === "already_registered" && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            This email is already registered.{" "}
            <Link href="/worker/login" className="font-semibold underline">
              Log in here
            </Link>{" "}
            to continue.
          </div>
        )}

        {error === "signup_failed" && (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            Something went wrong while creating your account. Please try again.
          </div>
        )}

        <form action={signUpWorker} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              name="fullName"
              type="text"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

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
              Phone
            </label>
            <input
              name="phone"
              type="text"
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
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
          >
            Continue
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/worker/login" className="font-semibold text-blue-600 underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}