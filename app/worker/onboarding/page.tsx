import Link from "next/link";
import { signUpWorker } from "../../auth/actions";

export default function WorkerOnboardingPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            FetchValet Worker Onboarding
          </p>
          <h1 className="mt-2 text-4xl font-bold">Become a FetchValet Worker</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Create your account, tell us how to reach you, and get ready to claim
            valet trash jobs in your area.
          </p>
        </div>

        <form
          action={signUpWorker}
          className="space-y-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
        >
          <section className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Worker Information
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter your basic account details to get started.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  name="fullName"
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="Your full name"
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
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  name="phone"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="(555) 555-5555"
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
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="Create a password"
                />
              </div>
            </div>
          </section>

          <section className="space-y-5 border-t border-slate-200 pt-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Before You Apply
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Here’s what to expect after you join.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-900">Create Account</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Submit your contact information and create your worker login.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-900">Get Approved</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Your account will be reviewed before you can claim jobs.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-900">Start Earning</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Once approved, you can accept routes, upload proof, and get paid.
                </p>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-8">
            <button
              type="submit"
              className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create Worker Account
            </button>

            <Link
              href="/worker/login"
              className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}