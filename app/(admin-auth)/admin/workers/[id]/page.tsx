import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { sendWorkerPasswordReset } from "../actions/send-password-reset";
import { updateWorkerStatus } from "../actions/update-worker-status";

type WorkerRecord = {
  id: string;
  role: string | null;
  status: string | null;
  full_name: string | null;
  phone: string | null;
};

function getStatusClasses(status: string | null) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "approved":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "suspended":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case "rejected":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-slate-50 text-slate-600 ring-slate-200";
  }
}

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const supabase = await createAdminClient ();

  const { data: worker, error } = await supabase
    .from("profiles")
    .select("id, role, status, full_name, phone")
    .eq("id", id)
    .eq("role", "worker")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!worker) {
    notFound();
  }

  const typedWorker = worker as WorkerRecord;

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 to-slate-700 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Workforce Management
              </p>
              <h1 className="mt-2 text-4xl font-bold">
                {typedWorker.full_name || "Worker Profile"}
              </h1>
              <p className="mt-3 text-slate-200">
                Review worker details and manage approval status.
              </p>
            </div>

            <Link
              href="/admin/workers"
              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              Back to Workers
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Worker Details</h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-500">Full Name</p>
                <p className="mt-1 font-medium text-slate-900">
                  {typedWorker.full_name || "Not set"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-500">Worker ID</p>
                <p className="mt-1 break-all font-medium text-slate-900">
                  {typedWorker.id}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-500">Role</p>
                <p className="mt-1 font-medium capitalize text-slate-900">
                  {typedWorker.role || "Not set"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-500">Phone Number</p>
                <p className="mt-1 font-medium text-slate-900">
                  {typedWorker.phone || "Not set"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Approval Status</h2>

            <div className="mt-5">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClasses(
                  typedWorker.status
                )}`}
              >
                {typedWorker.status || "unknown"}
              </span>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>

            <div className="mt-4 flex flex-wrap gap-3">
              <form action={updateWorkerStatus}>
                <input type="hidden" name="workerId" value={typedWorker.id} />
                <input type="hidden" name="status" value="approved" />
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Approve
                </button>
              </form>

              <form action={updateWorkerStatus}>
                <input type="hidden" name="workerId" value={typedWorker.id} />
                <input type="hidden" name="status" value="suspended" />
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Suspend
                </button>
              </form>

              <form action={updateWorkerStatus}>
                <input type="hidden" name="workerId" value={typedWorker.id} />
                <input type="hidden" name="status" value="rejected" />
                <button
                  type="submit"
                  className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  Reject
                </button>
              </form>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Password Reset</h2>
            <p className="mt-2 text-sm text-slate-600">
              Send a password reset email if the worker needs help accessing their account.
            </p>

            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <form action={sendWorkerPasswordReset}>
                <input type="hidden" name="workerId" value={typedWorker.id} />
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Send Password Reset
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}