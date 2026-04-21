import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/server";

type RouteRecord = {
  id: string;
  route_date: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string | null;
  payout_cents: number | null;
  minimum_worker_score: number | null;
  claimed_by: string | null;
  late_notified: boolean | null;
  properties: {
    id: string;
    name: string;
    city: string;
    state: string;
    address_line_1: string | null;
    requires_photo_proof: boolean | null;
  } | null;
};

function formatMoney(cents: number | null | undefined) {
  return `$${((cents ?? 0) / 100).toFixed(2)}`;
}

function formatTime(value: string | null) {
  if (!value) return "Not set";

  const raw = String(value).trim();
  if (!raw) return "Not set";
  if (raw.includes("AM") || raw.includes("PM")) return raw;

  const [hourString, minuteString = "00"] = raw.split(":");
  const hour = Number(hourString);
  const minute = String(minuteString).padStart(2, "0");

  if (Number.isNaN(hour)) return raw;

  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${hour12}:${minute} ${suffix}`;
}

function normalizeProperty(
  value: unknown
): {
  id: string;
  name: string;
  city: string;
  state: string;
  address_line_1: string | null;
  requires_photo_proof: boolean | null;
} | null {
  const normalizeOne = (
    obj: unknown
  ): {
    id: string;
    name: string;
    city: string;
    state: string;
    address_line_1: string | null;
    requires_photo_proof: boolean | null;
  } | null => {
    if (!obj || typeof obj !== "object") return null;

    const record = obj as Record<string, unknown>;

    return {
      id: typeof record.id === "string" ? record.id : "",
      name: typeof record.name === "string" ? record.name : "Unknown Property",
      city: typeof record.city === "string" ? record.city : "Unknown City",
      state: typeof record.state === "string" ? record.state : "Unknown State",
      address_line_1:
        typeof record.address_line_1 === "string"
          ? record.address_line_1
          : null,
      requires_photo_proof:
        typeof record.requires_photo_proof === "boolean"
          ? record.requires_photo_proof
          : null,
    };
  };

  if (Array.isArray(value)) {
    return normalizeOne(value[0]);
  }

  return normalizeOne(value);
}

function getStatusBadge(status: string | null) {
  switch ((status || "").toLowerCase()) {
    case "open":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "claimed":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "in_progress":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export default async function WorkerRouteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: route, error } = await supabase
    .from("routes")
    .select(`
      id,
      route_date,
      start_time,
      end_time,
      status,
      payout_cents,
      minimum_worker_score,
      claimed_by,
      late_notified,
      properties (
        id,
        name,
        city,
        state,
        address_line_1,
        requires_photo_proof
      )
    `)
    .eq("id", id)
    .single();

  if (error || !route) {
    notFound();
  }

  const record = route as Record<string, unknown>;

  const typedRoute: RouteRecord = {
    id: String(record.id ?? ""),
    route_date:
      typeof record.route_date === "string" ? record.route_date : null,
    start_time:
      typeof record.start_time === "string" ? record.start_time : null,
    end_time: typeof record.end_time === "string" ? record.end_time : null,
    status: typeof record.status === "string" ? record.status : null,
    payout_cents:
      typeof record.payout_cents === "number" ? record.payout_cents : 0,
    minimum_worker_score:
      typeof record.minimum_worker_score === "number"
        ? record.minimum_worker_score
        : 0,
    claimed_by:
      typeof record.claimed_by === "string" ? record.claimed_by : null,
    late_notified:
      typeof record.late_notified === "boolean" ? record.late_notified : null,
    properties: normalizeProperty(record.properties),
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            Worker Portal
          </p>
          <h1 className="mt-2 text-4xl font-bold">Route Detail</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Review route timing, payout, and property requirements before service.
          </p>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900">
                {typedRoute.properties?.name || "Unknown Property"}
              </p>
              <p className="mt-2 text-slate-500">
                {typedRoute.properties?.address_line_1 || "Address not set"}
              </p>
              <p className="text-slate-500">
                {typedRoute.properties?.city || "Unknown City"},{" "}
                {typedRoute.properties?.state || "Unknown State"}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                  typedRoute.status
                )}`}
              >
                {(typedRoute.status || "unknown").replaceAll("_", " ")}
              </span>

              <p className="text-3xl font-bold text-slate-900">
                {formatMoney(typedRoute.payout_cents)}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Route Date</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {typedRoute.route_date || "Not set"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Route Time</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {formatTime(typedRoute.start_time)} - {formatTime(typedRoute.end_time)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Minimum Worker Score</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {typedRoute.minimum_worker_score ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Photo Proof Required</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {typedRoute.properties?.requires_photo_proof ? "Yes" : "No"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Claimed Status</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {typedRoute.claimed_by ? "Claimed" : "Open"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Late Notice Sent</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {typedRoute.late_notified ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/worker/routes"
              className="inline-flex rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Routes
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}