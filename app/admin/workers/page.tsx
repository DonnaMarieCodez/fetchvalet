import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createClient } from "@/src/lib/supabase/server";
import {
  approveWorker,
  rejectWorker,
  suspendWorker,
} from "./worker-actions";

type WorkerRecord = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  worker_score: number | null;
  created_at: string | null;
};

function normalizeWorker(row: unknown): WorkerRecord {
  const record = (row ?? {}) as Record<string, unknown>;

  return {
    id: String(record.id ?? ""),
    full_name:
      typeof record.full_name === "string" ? record.full_name : null,
    email: typeof record.email === "string" ? record.email : null,
    phone: typeof record.phone === "string" ? record.phone : null,
    status: typeof record.status === "string" ? record.status : "pending",
    worker_score:
      typeof record.worker_score === "number" ? record.worker_score : 0,
    created_at:
      typeof record.created_at === "string" ? record.created_at : null,
  };
}

function getStatusBadge(status: string | null) {
  switch ((status || "").toLowerCase()) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "rejected":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "suspended":
      return "bg-slate-100 text-slate-700 border-slate-300";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getTier(score: number) {
  if (score >= 95) return "Elite";
  if (score >= 85) return "Preferred";
  if (score >= 70) return "Standard";
  return "Probation";
}

export default async function AdminWorkersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Workers</h1>
          <p className="mt-3 text-slate-600">You must be logged in.</p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, status, worker_score, created_at, role")
    .eq("role", "worker")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
              Admin
            </p>
            <h1 className="mt-2 text-4xl font-bold">Workers</h1>
            <p className="mt-3 max-w-2xl text-slate-200">
              Review worker applications and manage worker status.
            </p>
          </div>

          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            Failed to load workers: {error.message}
          </div>
        </div>
      </main>
    );
  }

  const workers = (data ?? []).map(normalizeWorker);

  const totalWorkers = workers.length;
  const pendingWorkers = workers.filter(
    (worker) => (worker.status || "").toLowerCase() === "pending"
  ).length;
  const approvedWorkers = workers.filter(
    (worker) => (worker.status || "").toLowerCase() === "approved"
  ).length;
  const suspendedWorkers = workers.filter(
    (worker) => (worker.status || "").toLowerCase() === "suspended"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                FetchValet Admin
              </p>
              <h1 className="mt-2 text-4xl font-bold">Workers</h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                View workers, approve pending workers, reject applications, and
                suspend active workers.
              </p>
            </div>

            <Link
              href="/admin"
              className="inline-flex rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Total Workers</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              {totalWorkers}
            </p>
          </div>

          <div className="rounded-3xl bg-amber-50 p-6 shadow-sm ring-1 ring-amber-100">
            <p className="text-sm text-amber-700">Pending</p>
            <p className="mt-3 text-4xl font-bold text-amber-900">
              {pendingWorkers}
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-50 p-6 shadow-sm ring-1 ring-emerald-100">
            <p className="text-sm text-emerald-700">Approved</p>
            <p className="mt-3 text-4xl font-bold text-emerald-900">
              {approvedWorkers}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Suspended</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              {suspendedWorkers}
            </p>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Worker List</h2>
            <p className="mt-2 text-sm text-slate-500">
              Open a worker profile or manage account status here.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {workers.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                No workers found.
              </div>
            ) : (
              workers.map((worker) => {
                const score = worker.worker_score ?? 0;
                const status = (worker.status || "pending").toLowerCase();

                return (
                  <div
                    key={worker.id}
                    className="rounded-2xl border bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/workers/${worker.id}`}
                          className="text-xl font-bold text-slate-900 hover:underline"
                        >
                          {worker.full_name || "Unnamed Worker"}
                        </Link>

                        <p className="mt-1 text-sm text-slate-500">
                          {worker.email || "No email on file"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {worker.phone || "No phone on file"}
                        </p>

                        <p className="mt-3 text-sm text-slate-600">
                          Joined:{" "}
                          {worker.created_at
                            ? new Date(worker.created_at).toLocaleDateString()
                            : "Not set"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-4 xl:items-end">
                        <div className="flex flex-col gap-3 xl:items-end">
                          <span
                            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                              worker.status
                            )}`}
                          >
                            {worker.status || "pending"}
                          </span>

                          <div className="xl:text-right">
                            <p className="text-sm text-slate-500">Worker Score</p>
                            <p className="text-3xl font-bold text-slate-900">
                              {score}
                            </p>
                            <p className="text-sm text-slate-500">
                              Tier: {getTier(score)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/workers/${worker.id}`}
                            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            View Worker
                          </Link>

                          {status === "pending" && (
                            <>
                              <form action={approveWorker}>
                                <input
                                  type="hidden"
                                  name="workerId"
                                  value={worker.id}
                                />
                                <button
                                  type="submit"
                                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                  Approve
                                </button>
                              </form>

                              <form action={rejectWorker}>
                                <input
                                  type="hidden"
                                  name="workerId"
                                  value={worker.id}
                                />
                                <button
                                  type="submit"
                                  className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                                >
                                  Reject
                                </button>
                              </form>
                            </>
                          )}

                          {status === "approved" && (
                            <form action={suspendWorker}>
                              <input
                                type="hidden"
                                name="workerId"
                                value={worker.id}
                              />
                              <button
                                type="submit"
                                className="rounded-2xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                              >
                                Suspend
                              </button>
                            </form>
                          )}

                          {status === "suspended" && (
                            <form action={approveWorker}>
                              <input
                                type="hidden"
                                name="workerId"
                                value={worker.id}
                              />
                              <button
                                type="submit"
                                className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                              >
                                Re-Approve
                              </button>
                            </form>
                          )}

                          {status === "rejected" && (
                            <form action={approveWorker}>
                              <input
                                type="hidden"
                                name="workerId"
                                value={worker.id}
                              />
                              <button
                                type="submit"
                                className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}