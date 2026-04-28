import Link from "next/link";
import { loginProperty } from "@/app/auth/actions";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function PropertyLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">
          Property Login
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-950">
          Sign in to your property portal
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Manage service, invoices, proof photos, and property details.
        </p>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error === "missing"
              ? "Please enter your email and password."
              : error === "unauthorized"
                ? "This account is not a property account."
                : "Invalid email or password."}
          </div>
        )}

        <form action={loginProperty} className="mt-8 space-y-5">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-xl border px-4 py-3"
          />

          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-xl border px-4 py-3"
          />

          <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white">
            Log In
          </button>
        </form>

        <Link
          href="/property/onboarding"
          className="mt-6 block text-center text-sm font-semibold text-blue-600"
        >
          Request service
        </Link>
      </section>
    </main>
  );
}