import Link from "next/link";
import { createClient } from "../../../src/lib/supabase/server";

type WorkerRecord = {
  id: string;
  role: string | null;
  status: string | null;
  full_name: string | null;
  property_id: string | null;
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

export default async function WorkersPage() {
  const supabase = await createClient();

  const { data: workers, error } = await supabase
    .from("profiles")
    .select("id, role, status, full_name, property_id")
    .eq("role", "worker")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const typedWorkers = (workers ?? []) as WorkerRecord[];

  const pendingCount = typedWorkers.filter(
    (worker) => worker.status === "pending"
  ).length;

  const approvedCount = typedWorkers.filter(
    (worker) => worker.status === "approved"
  ).length;

  const suspendedCount = typedWorkers.filter(
    (worker) => worker.status === "suspended"
  ).length;

  const rejectedCount = typedWorkers.filter(
    (worker) => worker.status === "rejected"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 to-slate-700 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            Workforce Management
          </p>
          <h1 className="mt-2 text-4xl font-bold">Worker Approval</h1>
          <p className="mt-3 text-slate-200">
            Review worker accounts, approve new applicants, and manage access.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-amber-50 p-5 shadow-sm ring-1 ring-amber-100">
            <p className="text-sm text-amber-700">Pending</p>
            <p className="mt-3 text-4xl font-bold text-amber-900">
              {pendingCount}
            </p>
            <p className="mt-2 text-sm text-amber-700">Awaiting review</p>
          </div>

          <div className="rounded-3xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
            <p className="text-sm text-emerald-700">Approved</p>
            <p className="mt-3 text-4xl font-bold text-emerald-900">
              {approvedCount}
            </p>
            <p className="mt-2 text-sm text-emerald-700">Active workers</p>
          </div>

          <div className="rounded-3xl bg-slate-100 p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-700">Suspended</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              {suspendedCount}
            </p>
            <p className="mt-2 text-sm text-slate-700">Temporarily blocked</p>
          </div>

          <div className="rounded-3xl bg-rose-50 p-5 shadow-sm ring-1 ring-rose-100">
            <p className="text-sm text-rose-700">Rejected</p>
            <p className="mt-3 text-4xl font-bold text-rose-900">
              {rejectedCount}
            </p>
            <p className="mt-2 text-sm text-rose-700">Not approved</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          {typedWorkers.length === 0 ? (
            <p className="text-slate-600">No workers found.</p>
          ) : (
            <div className="space-y-4">
              {typedWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {worker.full_name || "Unnamed worker"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Worker ID: {worker.id}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Property ID: {worker.property_id || "Not assigned"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClasses(
                        worker.status
                      )}`}
                    >
                      {worker.status || "unknown"}
                    </span>

                    <Link
                      href={`/admin/workers/${worker.id}`}
                      className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}