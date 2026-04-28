import Link from "next/link";
import { loginAdmin } from "@/app/auth/actions";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">
          Admin Login
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-950">
          Sign in to FetchValet
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Authorized administrators only.
        </p>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error === "missing"
              ? "Please enter your email and password."
              : error === "unauthorized"
                ? "This account is not approved for admin access."
                : "Invalid email or password."}
          </div>
        )}

        <form action={loginAdmin} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl border px-4 py-3"
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
              className="mt-2 w-full rounded-xl border px-4 py-3"
              placeholder="Enter password"
            />
          </div>

          <button className="w-full rounded-xl bg-black py-3 font-semibold text-white">
            Log In
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-sm font-semibold text-blue-600"
        >
          Back to homepage
        </Link>
      </section>
    </main>
  );
}