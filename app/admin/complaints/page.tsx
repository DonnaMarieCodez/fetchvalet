import Link from "next/link";
import { createClient } from "../../../src/lib/supabase/server";

type ComplaintRecord = {
  id: string;
  created_at: string | null;
  resident_name: string | null;
  unit_number: string | null;
  complaint_type: string | null;
  details: string | null;
  status: string | null;
  complaint_outcome: string | null;
  score_impact: number | null;
  worker_id: string | null;
  properties: {
    name: string;
  } | null;
  profiles: {
    full_name: string | null;
    display_name: string | null;
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

function normalizeProfile(
  value: unknown
): { full_name: string | null; display_name: string | null } | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    const first = value[0];
    if (first && typeof first === "object") {
      return {
        full_name:
          typeof (first as { full_name?: unknown }).full_name === "string"
            ? ((first as { full_name: string }).full_name ?? null)
            : null,
        display_name:
          typeof (first as { display_name?: unknown }).display_name === "string"
            ? ((first as { display_name: string }).display_name ?? null)
            : null,
      };
    }
    return null;
  }

  if (typeof value === "object" && value !== null) {
    return {
      full_name:
        typeof (value as { full_name?: unknown }).full_name === "string"
          ? ((value as { full_name: string }).full_name ?? null)
          : null,
      display_name:
        typeof (value as { display_name?: unknown }).display_name === "string"
          ? ((value as { display_name: string }).display_name ?? null)
          : null,
    };
  }

  return null;
}

function getStatusBadge(status: string | null) {
  switch ((status || "").toLowerCase()) {
    case "resolved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "open":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "reviewed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getWorkerName(
  profile: { full_name: string | null; display_name: string | null } | null
) {
  if (!profile) return "Unassigned";
  return profile.full_name || profile.display_name || "Assigned Worker";
}

export default async function AdminComplaintsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("complaints")
    .select(`
      id,
      created_at,
      resident_name,
      unit_number,
      complaint_type,
      details,
      status,
      complaint_outcome,
      score_impact,
      worker_id,
      properties (
        name
      ),
      profiles (
        full_name,
        display_name
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
      created_at:
        typeof record.created_at === "string" ? record.created_at : null,
      resident_name:
        typeof record.resident_name === "string" ? record.resident_name : null,
      unit_number:
        typeof record.unit_number === "string" ? record.unit_number : null,
      complaint_type:
        typeof record.complaint_type === "string"
          ? record.complaint_type
          : null,
      details: typeof record.details === "string" ? record.details : null,
      status: typeof record.status === "string" ? record.status : null,
      complaint_outcome:
        typeof record.complaint_outcome === "string"
          ? record.complaint_outcome
          : null,
      score_impact:
        typeof record.score_impact === "number" ? record.score_impact : null,
      worker_id: typeof record.worker_id === "string" ? record.worker_id : null,
      properties: normalizeProperty(record.properties),
      profiles: normalizeProfile(record.profiles),
    };
  });

  const activeComplaints = complaints.filter(
    (complaint) => (complaint.status || "").toLowerCase() !== "resolved"
  );

  const resolvedComplaints = complaints.filter(
    (complaint) => (complaint.status || "").toLowerCase() === "resolved"
  );

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            Admin Complaints
          </p>
          <h1 className="mt-2 text-4xl font-bold">Complaints Overview</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Review complaint activity, assigned workers, and outcomes across all
            properties.
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                All Complaints
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Track complaint details, impacted workers, and resolution status.
              </p>
            </div>

            <Link
              href="/admin"
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>

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
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xl font-bold text-slate-900">
                        {complaint.properties?.name || "Unknown Property"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Resident: {complaint.resident_name || "Unknown"}{" "}
                        {complaint.unit_number
                          ? `• Unit ${complaint.unit_number}`
                          : ""}
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-700">
                        Type: {complaint.complaint_type || "General complaint"}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        {complaint.details || "No details provided."}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Worker: {getWorkerName(complaint.profiles)}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Score Impact:{" "}
                        {complaint.score_impact !== null
                          ? complaint.score_impact
                          : "None"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Outcome: {complaint.complaint_outcome || "Not recorded"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {complaint.created_at
                          ? new Date(complaint.created_at).toLocaleString()
                          : "No date"}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                          complaint.status
                        )}`}
                      >
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