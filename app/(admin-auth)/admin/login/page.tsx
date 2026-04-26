import Link from "next/link";
import { loginAdmin } from "../../../auth/actions";

type Props = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
          Admin Login
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-950">
          Sign in to FetchValet
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Authorized administrators only.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            Invalid admin login. Please check your email and password.
          </div>
        )}

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
      </section>
    </main>
  );
}