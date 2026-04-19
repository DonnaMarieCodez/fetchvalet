import { createClient } from "../../src/lib/supabase/server";

type ComplaintRecord = {
  id: string;
  status: string | null;
  issue_type: string | null;
  description: string | null;
  created_at: string | null;
  property_id: string | null;
  properties: {
    name: string;
  } | null;
};

function normalizeProperty(value: unknown): { name: string } | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    const first = value[0];
    if (
      first &&
      typeof first === "object" &&
      "name" in first &&
      typeof (first as { name?: unknown }).name === "string"
    ) {
      return { name: (first as { name: string }).name };
    }
    return null;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as { name?: unknown }).name === "string"
  ) {
    return { name: (value as { name: string }).name };
  }

  return null;
}

export default async function ComplaintsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("complaints")
    .select(`
      id,
      status,
      issue_type,
      description,
      created_at,
      property_id,
      properties (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const complaints: ComplaintRecord[] = (data ?? []).map((row) => {
    const record = row as Record<string, unknown>;

    return {
      id: String(record.id ?? ""),
      status: typeof record.status === "string" ? record.status : null,
      issue_type:
        typeof record.issue_type === "string" ? record.issue_type : null,
      description:
        typeof record.description === "string" ? record.description : null,
      created_at:
        typeof record.created_at === "string" ? record.created_at : null,
      property_id:
        typeof record.property_id === "string" ? record.property_id : null,
      properties: normalizeProperty(record.properties),
    };
  });

  const activeComplaints = complaints.filter(
    (complaint) => complaint.status !== "resolved"
  );

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === "resolved"
  );

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            Complaints
          </p>
          <h1 className="mt-2 text-4xl font-bold">Complaints Overview</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Review active and resolved complaints across properties.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Total Complaints</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              {complaints.length}
            </p>
          </div>

          <div className="rounded-3xl bg-amber-50 p-6 shadow-sm ring-1 ring-amber-100">
            <p className="text-sm text-amber-700">Active</p>
            <p className="mt-3 text-4xl font-bold text-amber-900">
              {activeComplaints.length}
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-50 p-6 shadow-sm ring-1 ring-emerald-100">
            <p className="text-sm text-emerald-700">Resolved</p>
            <p className="mt-3 text-4xl font-bold text-emerald-900">
              {resolvedComplaints.length}
            </p>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">All Complaints</h2>

          <div className="mt-5 space-y-4">
            {complaints.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                No complaints found.
              </div>
            ) : (
              complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="rounded-2xl border bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xl font-bold text-slate-900">
                        {complaint.properties?.name || "Unknown Property"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {complaint.issue_type || "General complaint"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {complaint.description || "No description provided."}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {complaint.created_at
                          ? new Date(complaint.created_at).toLocaleString()
                          : "No date"}
                      </p>
                    </div>

                    <div>
                      <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                        {complaint.status || "open"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}