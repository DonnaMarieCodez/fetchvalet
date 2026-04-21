import Link from "next/link";
import { getWorkerProfile } from "../../../src/lib/auth/get-worker-profile";

export default async function WorkerStatusPage() {
  const { profile } = await getWorkerProfile();

  const status = profile?.status || "pending";

  let title = "Application Received";
  let message =
    "Your worker account has been created and is currently pending approval.";

  if (status === "approved") {
    title = "Account Approved";
    message =
      "Your worker account is approved. You can now access routes and begin working.";
  }

  if (status === "rejected") {
    title = "Application Update";
    message =
      "Your worker application was not approved. Please contact support for more information.";
  }

  if (status === "suspended") {
    title = "Account Suspended";
    message =
      "Your worker account is currently suspended. You cannot access routes at this time.";
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-4xl font-bold text-slate-900">{title}</h1>
          <p className="mt-4 text-lg text-slate-600">{message}</p>

          <div className="mt-8">
            <Link
              href="/worker"
              className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}