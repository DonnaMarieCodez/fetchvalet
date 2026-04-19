"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../src/lib/supabase/server";

type ComplaintRecord = {
  id: string;
  worker_id: string | null;
  complaint_type: string | null;
  complaint_outcome: string | null;
  score_impact: number | null;
  status: string | null;
};

type WorkerRecord = {
  id: string;
  worker_score: number | null;
};

export async function applyComplaintOutcome(formData: FormData) {
  const complaintId = String(formData.get("complaintId") || "").trim();
  const complaintOutcome = String(formData.get("complaintOutcome") || "").trim();
  const scoreImpact = Number(formData.get("scoreImpact") || 0);

  if (!complaintId || !complaintOutcome) {
    throw new Error("Complaint ID and outcome are required.");
  }

  if (Number.isNaN(scoreImpact)) {
    throw new Error("Score impact must be a valid number.");
  }

  const supabase = await createClient();

  const { data: complaint, error: complaintError } = await supabase
    .from("complaints")
    .select("id, worker_id, complaint_type, complaint_outcome, score_impact, status")
    .eq("id", complaintId)
    .single();

  if (complaintError || !complaint) {
    throw new Error(complaintError?.message || "Complaint not found.");
  }

  const typedComplaint = complaint as ComplaintRecord;

  let nextStatus = typedComplaint.status || "new";

  if (
    complaintOutcome === "substantiated" ||
    complaintOutcome === "unsubstantiated" ||
    complaintOutcome === "warning_issued" ||
    complaintOutcome === "coaching"
  ) {
    nextStatus = "resolved";
  }

  const previousScoreImpact = Number(typedComplaint.score_impact || 0);
  const scoreDifference = scoreImpact - previousScoreImpact;

  const { error: updateComplaintError } = await supabase
    .from("complaints")
    .update({
      complaint_outcome: complaintOutcome,
      score_impact: scoreImpact,
      status: nextStatus,
    })
    .eq("id", complaintId);

  if (updateComplaintError) {
    throw new Error(updateComplaintError.message);
  }

  if (typedComplaint.worker_id && scoreDifference !== 0) {
    const { data: worker, error: workerError } = await supabase
      .from("profiles")
      .select("id, worker_score")
      .eq("id", typedComplaint.worker_id)
      .single();

    if (workerError || !worker) {
      throw new Error(workerError?.message || "Worker not found.");
    }

    const typedWorker = worker as WorkerRecord;
    const currentScore = Number(typedWorker.worker_score || 0);
    const newScore = currentScore + scoreDifference;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ worker_score: newScore })
      .eq("id", typedWorker.id);

    if (profileError) {
      throw new Error(profileError.message);
    }

    const { error: eventError } = await supabase
      .from("worker_score_events")
      .insert({
        worker_id: typedWorker.id,
        complaint_id: typedComplaint.id,
        event_type: "complaint_outcome",
        score_change: scoreDifference,
        reason: `${typedComplaint.complaint_type || "Complaint"} marked ${complaintOutcome}`,
      });

    if (eventError) {
      throw new Error(eventError.message);
    }
  }

  revalidatePath("/admin/complaints");
  revalidatePath("/admin/workers");
}