import { signUpWorker } from "../../auth/actions";

export default function WorkerSignupPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Become a FetchValet Worker
          </h1>
          <p className="mt-2 text-slate-600">
            Start earning on your schedule. Complete a few steps to get approved.
          </p>

          {/* Step indicator */}
          <div className="mt-4 text-sm text-blue-600 font-medium">
            Step 1 of 3 — Create your account
          </div>
        </div>

        <form action={signUpWorker} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              name="fullName"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>
            <input
              name="phone"
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

          <button className="w-full rounded-xl bg-blue-600 py-3 text-white font-medium">
            Continue →
          </button>
        </form>
      </div>
    </main>
  );
}