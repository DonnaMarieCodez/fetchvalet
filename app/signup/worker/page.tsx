import { signUpWorker } from "../../auth/actions";

export default function WorkerSignupPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Worker Sign Up</h1>
        <p className="mt-2 text-slate-600">
          Create your worker account to claim routes and track earnings.
        </p>

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
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-white"
          >
            Create Worker Account
          </button>
        </form>
      </div>
    </main>
  );
}
