import Link from "next/link";
import { getWorkerProfile } from "../../../src/lib/auth/get-worker-profile";

export default async function WorkerStatusPage() {
  const { profile } = await getWorkerProfile();

  const status = profile?.worker_status || "pending";

  let title = "Application Received";
  let message =
    "Your worker account has been created and is currently pending approval.";

  if (status === "approved") {
    title = "Account Approved";
    message = "Your worker account has been approved. You can now access routes.";
  }

  if (status === "rejected") {
    title = "Application Rejected";
    message = "Your worker account was not approved. Contact admin for more information.";
  }

  if (status === "suspended") {
    title = "Account Suspended";
    message = "Your worker account is currently suspended. Contact admin for assistance.";
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-3 text-slate-600">{message}</p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="inline-block rounded-xl bg-slate-900 px-4 py-2 text-white"
          >
            Go to Login
          </Link>

          {status === "approved" && (
            <Link
              href="/worker"
              className="inline-block rounded-xl border px-4 py-2"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}