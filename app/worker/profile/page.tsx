import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkerProfile } from "../../../src/lib/auth/get-worker-profile";

export default async function WorkerProfilePage() {
  const { user, profile } = await getWorkerProfile();

  if (!user) {
    redirect("/login");
  }

  if (!profile || profile.role !== "worker") {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="mt-1 font-medium text-slate-900">
                {profile.full_name || "Not set"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">Status</p>
              <p className="mt-1 font-medium capitalize text-slate-900">
                {profile.status || "unknown"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">Phone</p>
              <p className="mt-1 font-medium text-slate-900">
                {profile.phone || "Not set"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/worker"
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}