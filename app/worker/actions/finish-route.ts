"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../src/lib/supabase/server";

type RouteStopBuildingRow = {
  units: {
    buildings: {
      name: string;
    } | null;
  } | null;
};

type ProofRow = {
  building_name: string;
};

type LateNoticeRouteRow = {
  id: string;
};

export async function finishRoute(formData: FormData) {
  const routeId = String(formData.get("routeId") || "").trim();

  if (!routeId) {
    throw new Error("Missing route ID.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: route, error: routeError } = await supabase
    .from("routes")
    .select(
      "id, claimed_by, start_time, started_at, status, late_notified, late_notified_at"
    )
    .eq("id", routeId)
    .eq("claimed_by", user.id)
    .single();

  if (routeError || !route) {
    throw new Error(routeError?.message || "Route not found.");
  }

  if (route.status === "completed") {
    revalidatePath("/worker/route");
    revalidatePath("/worker");
    revalidatePath("/worker/pay");
    revalidatePath("/admin");
    revalidatePath("/admin/workers");
    return;
  }

  const { data: pendingStops, error: pendingError } = await supabase
    .from("route_stops")
    .select("id")
    .eq("route_id", routeId)
    .eq("status", "pending");

  if (pendingError) {
    throw new Error(pendingError.message);
  }

  if (pendingStops && pendingStops.length > 0) {
    throw new Error(
      "You still have pending stops. Complete all stops before finishing the route."
    );
  }

  const { data: allStops, error: allStopsError } = await supabase
    .from("route_stops")
    .select(`
      units (
        buildings (
          name
        )
      )
    `)
    .eq("route_id", routeId);

  if (allStopsError) {
    throw new Error(allStopsError.message);
  }

  const typedStops = (allStops ?? []) as unknown as RouteStopBuildingRow[];

  const routeBuildings = Array.from(
    new Set(
      typedStops
        .map((stop) => stop.units?.buildings?.name)
        .filter((name): name is string => Boolean(name))
    )
  );

  const { data: proofs, error: proofsError } = await supabase
    .from("building_proofs")
    .select("building_name")
    .eq("route_id", routeId);

  if (proofsError) {
    throw new Error(proofsError.message);
  }

  const typedProofs = (proofs ?? []) as ProofRow[];
  const proofBuildings = new Set(
    typedProofs.map((proof) => proof.building_name)
  );

  const missingProofs = routeBuildings.filter(
    (buildingName) => !proofBuildings.has(buildingName)
  );

  if (missingProofs.length > 0) {
    throw new Error(
      `Upload photo proof for all buildings before finishing the route. Missing: ${missingProofs.join(", ")}`
    );
  }

  const { error: completeError } = await supabase
    .from("routes")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", routeId)
    .eq("claimed_by", user.id);

  if (completeError) {
    throw new Error(completeError.message);
  }

  if (route.claimed_by && route.start_time && route.started_at) {
    const scheduled = new Date(`1970-01-01T${route.start_time}`);
    const actual = new Date(route.started_at);

    const lateMinutes =
      actual.getHours() * 60 +
      actual.getMinutes() -
      (scheduled.getHours() * 60 + scheduled.getMinutes());

    let scoreChange = 0;
    let reason = "";

    if (route.late_notified) {
      if (lateMinutes <= 30) {
        scoreChange = 0;
        reason = "Late but notified";
      } else {
        scoreChange = -2;
        reason = "Late (notified)";
      }
    } else {
      if (lateMinutes <= 15) {
        scoreChange = 1;
        reason = "On time";
      } else if (lateMinutes <= 30) {
        scoreChange = -2;
        reason = "Late";
      } else {
        scoreChange = -5;
        reason = "Very late";
      }
    }

    // Monthly late-notice pattern penalty
    let monthlyLatePenalty = 0;
    let monthlyLateReason = "";

    if (route.late_notified && route.late_notified_at) {
      const lateNoticeDate = new Date(route.late_notified_at);
      const year = lateNoticeDate.getUTCFullYear();
      const month = lateNoticeDate.getUTCMonth();

      const monthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0));
      const nextMonthStart = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));

      const { data: monthlyLateRoutes, error: monthlyLateError } = await supabase
        .from("routes")
        .select("id")
        .eq("claimed_by", route.claimed_by)
        .eq("late_notified", true)
        .gte("late_notified_at", monthStart.toISOString())
        .lt("late_notified_at", nextMonthStart.toISOString());

      if (monthlyLateError) {
        throw new Error(monthlyLateError.message);
      }

      const typedMonthlyLateRoutes =
        (monthlyLateRoutes ?? []) as LateNoticeRouteRow[];
      const monthlyLateCount = typedMonthlyLateRoutes.length;

      if (monthlyLateCount > 8) {
        monthlyLatePenalty = -4;
        monthlyLateReason = "More than 8 running-late notices this month";
      } else if (monthlyLateCount > 5) {
        monthlyLatePenalty = -2;
        monthlyLateReason = "More than 5 running-late notices this month";
      }
    }

    const totalScoreChange = scoreChange + monthlyLatePenalty;

    const { data: worker, error: workerError } = await supabase
      .from("profiles")
      .select("id, worker_score")
      .eq("id", route.claimed_by)
      .single();

    if (workerError || !worker) {
      throw new Error(workerError?.message || "Worker not found.");
    }

    const currentScore = Number(worker.worker_score || 0);
    const newScore = currentScore + totalScoreChange;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ worker_score: newScore })
      .eq("id", worker.id);

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (scoreChange !== 0) {
      const { error: eventError } = await supabase
        .from("worker_score_events")
        .insert({
          worker_id: worker.id,
          event_type: "reliability",
          score_change: scoreChange,
          reason,
        });

      if (eventError) {
        throw new Error(eventError.message);
      }
    }

    if (monthlyLatePenalty !== 0) {
      const { error: monthlyPenaltyError } = await supabase
        .from("worker_score_events")
        .insert({
          worker_id: worker.id,
          event_type: "late_notice_pattern",
          score_change: monthlyLatePenalty,
          reason: monthlyLateReason,
        });

      if (monthlyPenaltyError) {
        throw new Error(monthlyPenaltyError.message);
      }
    }
  }

  revalidatePath("/worker/route");
  revalidatePath("/worker");
  revalidatePath("/worker/pay");
  revalidatePath("/admin");
  revalidatePath("/admin/workers");
}