"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../src/lib/supabase/client";

export default function WorkerSignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setErrorMsg("");

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          role: "worker",
        },
      },
    });

    if (error || !data.user) {
      setLoading(false);
      setErrorMsg(error?.message || "Unable to create worker account.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: cleanEmail,
      role: "worker",
      status: "waitlist",
      worker_score: 75,
      background_check_status: "not_started",
      stripe_onboarding_status: "not_started",
      worker_onboarding_completed: false,
    });

    if (profileError) {
      setLoading(false);
      setErrorMsg(profileError.message);
      return;
    }

    router.push("/worker/status");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
          Worker Waitlist
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-900">
          Apply to work with FetchValet
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Submit your basic information first. If approved, you’ll complete
          onboarding, background check consent, and payout setup.
        </p>

        {errorMsg && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          />

          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          />

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          />

          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create password"
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Join Waitlist"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/worker/login")}
          className="mt-5 w-full text-sm font-semibold text-slate-700 hover:underline"
        >
          Already applied? Login
        </button>
      </div>
    </main>
  );
}