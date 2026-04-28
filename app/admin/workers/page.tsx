import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";
import {
  approveWorker,
  rejectWorker,
  suspendWorker,
  reinstateWorker,
} from "./worker-actions";

export default async function AdminWorkersPage() {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data: workers, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, status, worker_score, created_at")
    .eq("role", "worker")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <section className="rounded-3xl bg-slate-900 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
          Admin
        </p>
        <h1 className="mt-3 text-4xl font-black">Workers</h1>
        <p className="mt-2 text-slate-300">
          Review worker applications and manage worker status.
        </p>
      </section>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          Failed to load workers: {error.message}
        </div>
      )}

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        {!workers?.length ? (
          <p className="text-slate-600">No workers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">Worker</th>
                  <th className="py-3">Phone</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Score</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id} className="border-b">
                    <td className="py-4">
                      <div className="font-semibold text-slate-900">
                        {worker.full_name || "Unnamed Worker"}
                      </div>
                      <div className="text-slate-500">{worker.email}</div>
                    </td>

                    <td className="py-4 text-slate-600">
                      {worker.phone || "—"}
                    </td>

                    <td className="py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                        {worker.status || "pending"}
                      </span>
                    </td>

                    <td className="py-4 font-semibold">
                      {worker.worker_score ?? 75}
                    </td>

                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/workers/${worker.id}`}
                          className="rounded-xl border px-3 py-2 font-semibold"
                        >
                          View
                        </Link>

                        <form action={approveWorker}>
                          <input type="hidden" name="workerId" value={worker.id} />
                          <button className="rounded-xl bg-emerald-600 px-3 py-2 font-semibold text-white">
                            Approve
                          </button>
                        </form>

                        <form action={rejectWorker}>
                          <input type="hidden" name="workerId" value={worker.id} />
                          <button className="rounded-xl bg-red-600 px-3 py-2 font-semibold text-white">
                            Reject
                          </button>
                        </form>

                        {worker.status === "suspended" ? (
                          <form action={reinstateWorker}>
                            <input type="hidden" name="workerId" value={worker.id} />
                            <button className="rounded-xl bg-blue-600 px-3 py-2 font-semibold text-white">
                              Reinstate
                            </button>
                          </form>
                        ) : (
                          <form action={suspendWorker}>
                            <input type="hidden" name="workerId" value={worker.id} />
                            <button className="rounded-xl bg-slate-900 px-3 py-2 font-semibold text-white">
                              Suspend
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}