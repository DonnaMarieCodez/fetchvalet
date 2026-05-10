import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

type Complaint = {
  id: string;
  property_id: string | null;
  worker_id: string | null;
  resident_name: string | null;
  resident_email: string | null;
  resident_phone: string | null;
  building_name: string | null;
  unit_number: string | null;
  complaint_type: string | null;
  description: string | null;
  status: string | null;
  created_at: string | null;
};

export default async function AdminComplaintsPage() {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data: complaints, error: complaintsError } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: properties } = await supabase
    .from("properties")
    .select("id, name");

  const { data: workers } = await supabase
    .from("profiles")
    .select("id, full_name, display_name")
    .eq("role", "worker");

  const propertyMap = new Map(
    (properties ?? []).map((property) => [property.id, property.name])
  );

  const workerMap = new Map(
    (workers ?? []).map((worker) => [
      worker.id,
      worker.display_name || worker.full_name || "Unnamed Worker",
    ])
  );

  const complaintList = (complaints ?? []) as Complaint[];

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
          Complaint Management
        </p>

        <h1 className="mt-3 text-4xl font-black">Complaints</h1>

        <p className="mt-3 text-slate-200">
          Review resident complaints, property issues, and worker-related service concerns.
        </p>
      </section>

      {complaintsError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          Error: {complaintsError.message}
        </div>
      )}

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-black text-slate-900">
          Recent Complaints
        </h2>

        <div className="mt-6 space-y-4">
          {complaintList.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
              No complaints found yet.
            </div>
          ) : (
            complaintList.map((complaint) => (
              <div
                key={complaint.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-black text-slate-900">
                      {complaint.complaint_type?.replaceAll("_", " ") || "Complaint"}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Property:{" "}
                      {complaint.property_id
                        ? propertyMap.get(complaint.property_id) || "Unknown Property"
                        : "Not assigned"}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Worker:{" "}
                      {complaint.worker_id
                        ? workerMap.get(complaint.worker_id) || "Unknown Worker"
                        : "Not assigned"}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Resident: {complaint.resident_name || "Not provided"}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Building/Unit: {complaint.building_name || "N/A"}{" "}
                      {complaint.unit_number ? `• Unit ${complaint.unit_number}` : ""}
                    </p>

                    <p className="mt-3 text-sm text-slate-800">
                      {complaint.description || "No description provided."}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold capitalize text-slate-700">
                    {complaint.status || "open"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}