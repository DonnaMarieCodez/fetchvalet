import { createClient } from "../../../src/lib/supabase/server";
import { applyComplaintOutcome } from "./complaint-actions";

type ComplaintRecord = {
  id: string;
  created_at: string;
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

function getStatusBadge(status: string | null) {
  switch (status) {
    case "new":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "under_review":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "resolved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "closed":
      return "bg-slate-100 text-slate-700 border-slate-300";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function getOutcomeBadge(outcome: string | null) {
  switch (outcome) {
    case "substantiated":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "unsubstantiated":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "warning_issued":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "coaching":
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
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
      properties(name),
      profiles!complaints_worker_id_fkey(full_name, display_name)
    `)
    .order("created_at", { ascending: false });

  const complaints = (data ?? []) as ComplaintRecord[];

  const activeComplaints = complaints.filter(
    (complaint) =>
      complaint.status === "new" || complaint.status === "under_review"
  );

  const resolvedComplaints = complaints.filter(
    (complaint) =>
      complaint.status === "resolved" || complaint.status === "closed"
  );

  const newCount = complaints.filter((c) => c.status === "new").length;
  const reviewCount = complaints.filter((c) => c.status === "under_review").length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "resolved" || c.status === "closed"
  ).length;
  const substantiatedCount = complaints.filter(
    (c) => c.complaint_outcome === "substantiated"
  ).length;

  return (
    <>
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
          Service Quality
        </p>
        <h1 className="mt-2 text-4xl font-bold">Complaint Management</h1>
        <p className="mt-3 max-w-2xl text-slate-200">
          Review resident complaints, track outcomes, and apply worker score impacts
          with a clear audit trail.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {error.message}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-blue-50 p-5 shadow-sm ring-1 ring-blue-100">
          <p className="text-sm font-medium text-blue-700">New</p>
          <p className="mt-3 text-4xl font-bold text-blue-900">{newCount}</p>
          <p className="mt-2 text-sm text-blue-700">Needs first review</p>
        </div>

        <div className="rounded-3xl bg-amber-50 p-5 shadow-sm ring-1 ring-amber-100">
          <p className="text-sm font-medium text-amber-700">Under Review</p>
          <p className="mt-3 text-4xl font-bold text-amber-900">{reviewCount}</p>
          <p className="mt-2 text-sm text-amber-700">Open investigations</p>
        </div>

        <div className="rounded-3xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
          <p className="text-sm font-medium text-emerald-700">Resolved / Closed</p>
          <p className="mt-3 text-4xl font-bold text-emerald-900">{resolvedCount}</p>
          <p className="mt-2 text-sm text-emerald-700">Finished cases</p>
        </div>

        <div className="rounded-3xl bg-rose-50 p-5 shadow-sm ring-1 ring-rose-100">
          <p className="text-sm font-medium text-rose-700">Substantiated</p>
          <p className="mt-3 text-4xl font-bold text-rose-900">{substantiatedCount}</p>
          <p className="mt-2 text-sm text-rose-700">Confirmed service issues</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900">Open Complaints</h2>
        <p className="mt-1 text-sm text-slate-500">
          New and under-review complaints that still need action.
        </p>

        <div className="mt-4 space-y-5">
          {activeComplaints.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <p className="text-slate-600">No open complaints right now.</p>
            </div>
          ) : (
            activeComplaints.map((complaint) => {
              const workerName =
                complaint.profiles?.full_name ||
                complaint.profiles?.display_name ||
                "Not linked";

              return (
                <div
                  key={complaint.id}
                  className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold text-slate-900">
                          {complaint.properties?.name || "Unknown Property"}
                        </h3>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                            complaint.status
                          )}`}
                        >
                          {complaint.status || "unknown"}
                        </span>

                        {complaint.complaint_outcome && (
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getOutcomeBadge(
                              complaint.complaint_outcome
                            )}`}
                          >
                            {complaint.complaint_outcome.replace("_", " ")}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-3">
                        <p>
                          <span className="font-medium text-slate-900">Resident:</span>{" "}
                          {complaint.resident_name || "Not provided"}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">Unit:</span>{" "}
                          {complaint.unit_number || "Not provided"}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">Type:</span>{" "}
                          {complaint.complaint_type || "Not provided"}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">Worker:</span>{" "}
                          {workerName}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">Score Impact:</span>{" "}
                          {complaint.score_impact ?? 0}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">Received:</span>{" "}
                          {new Date(complaint.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">Complaint Details</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {complaint.details || "No details provided."}
                        </p>
                      </div>
                    </div>

                    <div className="w-full max-w-md rounded-2xl border bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Review Outcome
                      </p>

                      <form action={applyComplaintOutcome} className="mt-4 space-y-4">
                        <input type="hidden" name="complaintId" value={complaint.id} />

                        <div>
                          <label className="block text-sm font-medium text-slate-700">
                            Outcome
                          </label>
                          <select
                            name="complaintOutcome"
                            defaultValue={complaint.complaint_outcome || ""}
                            className="mt-1 w-full rounded-2xl border px-3 py-2"
                            required
                          >
                            <option value="">Select outcome</option>
                            <option value="substantiated">Substantiated</option>
                            <option value="unsubstantiated">Unsubstantiated</option>
                            <option value="warning_issued">Warning Issued</option>
                            <option value="coaching">Coaching</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700">
                            Score Impact
                          </label>
                          <input
                            name="scoreImpact"
                            type="number"
                            defaultValue={complaint.score_impact ?? 0}
                            className="mt-1 w-full rounded-2xl border px-3 py-2"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Apply Outcome
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900">Resolved History</h2>
        <p className="mt-1 text-sm text-slate-500">
          Previously handled complaints for reference and audit trail.
        </p>

        <div className="mt-4 space-y-4">
          {resolvedComplaints.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <p className="text-slate-600">No resolved complaints yet.</p>
            </div>
          ) : (
            resolvedComplaints.map((complaint) => {
              const workerName =
                complaint.profiles?.full_name ||
                complaint.profiles?.display_name ||
                "Not linked";

              return (
                <div
                  key={complaint.id}
                  className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        {complaint.properties?.name || "Unknown Property"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {complaint.complaint_type || "Complaint"} · Unit{" "}
                        {complaint.unit_number || "N/A"} · Worker: {workerName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(complaint.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                          complaint.status
                        )}`}
                      >
                        {complaint.status || "unknown"}
                      </span>

                      {complaint.complaint_outcome && (
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getOutcomeBadge(
                            complaint.complaint_outcome
                          )}`}
                        >
                          {complaint.complaint_outcome.replace("_", " ")}
                        </span>
                      )}

                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        Score {complaint.score_impact ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}