import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../src/lib/supabase/server";

type ScoreEventRecord = {
  id: string;
  event_type: string;
  score_change: number;
  reason: string | null;
  created_at: string;
};

function getScoreColor(score: number) {
  if (score >= 90) return "text-cyan-600";
  if (score >= 75) return "text-amber-600";
  if (score >= 60) return "text-slate-600";
  return "text-orange-600";
}

function formatEventType(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getWorkerTier(score: number) {
  if (score >= 90) {
    return {
      name: "Platinum",
      className: "bg-cyan-50 text-cyan-700 border-cyan-200",
      description: "Top standing with the strongest access to premium routes.",
    };
  }

  if (score >= 75) {
    return {
      name: "Gold",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      description: "Strong standing with good access to most routes.",
    };
  }

  if (score >= 60) {
    return {
      name: "Silver",
      className: "bg-slate-100 text-slate-700 border-slate-300",
      description: "Moderate standing with some route access limitations.",
    };
  }

  return {
    name: "Bronze",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    description: "Entry or recovery tier with limited route access.",
  };
}

export default async function WorkerScorePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name, display_name, worker_score, worker_status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "worker") {
    redirect("/login");
  }

  const workerName =
    profile.full_name ||
    profile.display_name ||
    user.email ||
    "Worker";

  const currentScore = Number(profile.worker_score || 0);
  const workerStatus = String(profile.worker_status || "pending").toLowerCase();
  const workerTier = getWorkerTier(currentScore);

  const { data: scoreEvents, error: scoreEventsError } = await supabase
    .from("worker_score_events")
    .select("id, event_type, score_change, reason, created_at")
    .eq("worker_id", user.id)
    .order("created_at", { ascending: false })
    .limit(25);

  const typedScoreEvents = (scoreEvents ?? []) as ScoreEventRecord[];

  const positiveEvents = typedScoreEvents.filter(
    (event) => Number(event.score_change) > 0
  ).length;

  const negativeEvents = typedScoreEvents.filter(
    (event) => Number(event.score_change) < 0
  ).length;

  const totalImpact = typedScoreEvents.reduce(
    (sum, event) => sum + Number(event.score_change || 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Worker Performance
              </p>
              <h1 className="mt-2 text-4xl font-bold">{workerName}</h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                Review your worker score, current tier, recent score activity,
                and how to improve your standing for better route access.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-3xl bg-white/10 px-6 py-5 backdrop-blur-sm">
                <p className="text-sm text-slate-300">Current Score</p>
                <p className="mt-2 text-5xl font-bold text-white">
                  {currentScore}
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${workerTier.className}`}
                  >
                    {workerTier.name} Tier
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-200 capitalize">
                  Status: {workerStatus}
                </p>
              </div>

              <Link
                href="/worker/routes"
                className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Back to Routes
              </Link>

              <Link
                href="/worker"
                className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {scoreEventsError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error: {scoreEventsError.message}
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Current Score</p>
            <p className={`mt-3 text-4xl font-bold ${getScoreColor(currentScore)}`}>
              {currentScore}
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
            <p className="text-sm text-emerald-700">Positive Events</p>
            <p className="mt-3 text-4xl font-bold text-emerald-900">
              {positiveEvents}
            </p>
          </div>

          <div className="rounded-3xl bg-rose-50 p-5 shadow-sm ring-1 ring-rose-100">
            <p className="text-sm text-rose-700">Negative Events</p>
            <p className="mt-3 text-4xl font-bold text-rose-900">
              {negativeEvents}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Current Tier</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {workerTier.name}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr,1.25fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">
              Tier Breakdown
            </h2>

            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <div className="rounded-2xl bg-cyan-50 p-4 ring-1 ring-cyan-100">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-cyan-900">Platinum Tier</p>
                  <span className="rounded-full border border-cyan-200 px-3 py-1 text-xs font-semibold text-cyan-700">
                    90–100
                  </span>
                </div>
                <p className="mt-2 text-cyan-900">
                  Highest standing. Best access to premium and higher-score routes.
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-amber-900">Gold Tier</p>
                  <span className="rounded-full border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                    75–89
                  </span>
                </div>
                <p className="mt-2 text-amber-900">
                  Strong standing. Good access to most route opportunities.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">Silver Tier</p>
                  <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700">
                    60–74
                  </span>
                </div>
                <p className="mt-2 text-slate-700">
                  Moderate standing. Route access may be more limited.
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-100">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-orange-900">Bronze Tier</p>
                  <span className="rounded-full border border-orange-200 px-3 py-1 text-xs font-semibold text-orange-700">
                    Below 60
                  </span>
                </div>
                <p className="mt-2 text-orange-900">
                  Entry or recovery tier. Route access is limited until score improves.
                </p>
              </div>
            </div>

            <h2 className="mt-8 text-2xl font-bold text-slate-900">
              How Your Score Works
            </h2>

            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="font-semibold text-emerald-900">
                  Ways to improve your score
                </p>
                <ul className="mt-2 space-y-2">
                  <li>• Complete routes on time</li>
                  <li>• Finish all assigned stops accurately</li>
                  <li>• Upload required proof photos</li>
                  <li>• Keep complaint volume low</li>
                  <li>• Maintain reliable attendance and route completion</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-rose-50 p-4">
                <p className="font-semibold text-rose-900">
                  Things that can lower your score
                </p>
                <ul className="mt-2 space-y-2">
                  <li>• Missing stops or leaving a route incomplete</li>
                  <li>• Service complaints tied to your route</li>
                  <li>• Missing required proof photos</li>
                  <li>• Unclaiming a route too close to start time</li>
                  <li>• Canceling a claimed route less than 1.5 hours before route start</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Recent Score Activity
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Latest activity that affected your worker score.
                </p>
              </div>

              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${workerTier.className}`}
              >
                {workerTier.name} Tier
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {typedScoreEvents.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                  No score activity found yet.
                </div>
              ) : (
                typedScoreEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-wide text-slate-500">
                          {formatEventType(event.event_type)}
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {event.reason || "Score updated"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div
                        className={`text-2xl font-bold ${
                          Number(event.score_change) >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {Number(event.score_change) >= 0 ? "+" : ""}
                        {event.score_change}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}