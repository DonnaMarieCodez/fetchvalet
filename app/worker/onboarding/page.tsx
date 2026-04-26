import Link from "next/link";
import { createClient } from "../../../src/lib/supabase/server";

export default async function WorkerOnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            Worker Onboarding
          </h1>
          <p className="mt-3 text-slate-600">
            Please log in to continue your worker setup.
          </p>

          <Link
            href="/worker/login"
            className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Go to Worker Login
          </Link>
        </div>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      full_name,
      email,
      phone,
      role,
      status,
      worker_score,
      stripe_account_id,
      stripe_payouts_enabled,
      stripe_onboarding_complete
    `)
    .eq("id", user.id)
    .single();

  const workerStatus = String(profile?.status || "pending").toLowerCase();
  const payoutReady = Boolean(profile?.stripe_payouts_enabled);
  const stripeStarted = Boolean(profile?.stripe_account_id);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl bg-gradient-to-r from-slate-950 to-slate-800 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">
            FetchValet Worker Onboarding
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}.
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            Complete your worker setup so you can get approved, claim routes,
            upload proof photos, and receive payouts.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/worker/status"
              className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              View Status
            </Link>

            <Link
              href="/"
              className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Back Home
            </Link>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Application</p>
            <p className="mt-3 text-3xl font-black capitalize text-slate-900">
              {workerStatus}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Worker Score</p>
            <p className="mt-3 text-3xl font-black text-blue-600">
              {profile?.worker_score ?? 75}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Payout Setup</p>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {payoutReady ? "Ready" : stripeStarted ? "Started" : "Needed"}
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-slate-900">
            Complete Your Setup
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    1. Create your worker account
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Your basic account has been created.
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                  Complete
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    2. Set up payouts
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Connect Stripe so FetchValet can send your earnings.
                  </p>
                </div>

                <Link
                  href="/worker/payouts/setup"
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {payoutReady ? "View Payout Setup" : "Set Up Payouts"}
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    3. Wait for approval
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Admin will review your account before you can claim routes.
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    workerStatus === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : workerStatus === "rejected"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {workerStatus === "approved"
                    ? "Approved"
                    : workerStatus === "rejected"
                      ? "Rejected"
                      : "Pending Review"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-slate-950 p-8 text-white shadow-sm">
          <h2 className="text-2xl font-black">What happens next?</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="font-bold">Claim Routes</p>
              <p className="mt-2 text-sm text-slate-300">
                Once approved, you’ll be able to claim available routes.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="font-bold">Complete Jobs</p>
              <p className="mt-2 text-sm text-slate-300">
                Finish routes, upload proof photos, and keep your score strong.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="font-bold">Get Paid</p>
              <p className="mt-2 text-sm text-slate-300">
                Earnings are tracked in your worker pay dashboard.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}