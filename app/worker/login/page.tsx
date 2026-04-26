"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function WorkerLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data.user) {
      setLoading(false);
      setErrorMsg("Invalid email or password. Please try again.");
      return;
    }

    const { data: worker, error: workerError } = await supabase
      .from("workers")
      .select("id, status")
      .eq("id", data.user.id)
      .maybeSingle();

    if (workerError) {
      setLoading(false);
      setErrorMsg("We could not verify your worker account. Please contact support.");
      return;
    }

    if (!worker) {
      setLoading(false);
      setErrorMsg("No worker profile was found for this login.");
      return;
    }

    if (worker.status === "pending") {
      router.push("/worker/onboarding");
      return;
    }

    if (worker.status === "suspended") {
      router.push("/worker/suspended");
      return;
    }

    if (worker.status === "approved") {
      router.push("/worker/routes");
      return;
    }

    setLoading(false);
    setErrorMsg("Your worker account status could not be verified.");
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Worker Login</h1>
          <p className="text-sm text-slate-500 mt-2">
            Sign in to access your FetchValet worker dashboard.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="worker@email.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Need a worker account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup/worker")}
            className="font-semibold text-slate-900 hover:underline"
          >
            Apply here
          </button>
        </div>
      </div>
    </main>
  );
}