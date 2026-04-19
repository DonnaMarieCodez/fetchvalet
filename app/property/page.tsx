import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../src/lib/supabase/server";
import { getPropertyProfile } from "../../src/lib/auth/get-property-profile";
import { logoutProperty } from "./login/actions";

type PropertyRecord = {
  id: string;
  name: string;
  city: string;
  state: string;
  address_line_1: string | null;
  property_manager_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  service_days: string | null;
  recycling_service_days: string | null;
  pickup_start_time: string | null;
  requires_photo_proof: boolean | null;
};

type RouteRecord = {
  id: string;
  route_date: string;
  status: string;
};

type ComplaintRecord = {
  id: string;
  status: string | null;
  created_at: string;
};

function getRouteStatusBadge(status: string) {
  switch (status) {
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

function formatServiceDays(value: string | null) {
  if (!value) return "Not set";

  return value
    .split(",")
    .map((day) => day.trim())
    .filter(Boolean)
    .join(", ");
}

export default async function PropertyPage() {
  const { user, profile } = await getPropertyProfile();

  if (!user) {
    redirect("/property/login");
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Property Login Debug</h1>
          <p className="mt-4 text-slate-700">
            You are logged in, but no profile row was found.
          </p>
          <p className="mt-2 text-sm text-slate-500">User ID: {user.id}</p>
        </div>
      </main>
    );
  }

  if (profile.role !== "property") {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Property Login Debug</h1>
          <p className="mt-4 text-slate-700">
            Your profile role is not set to <code>property</code>.
          </p>
          <p className="mt-2 text-sm text-slate-500">User ID: {user.id}</p>
          <p className="mt-1 text-sm text-slate-500">Role: {String(profile.role)}</p>
        </div>
      </main>
    );
  }

  if (!profile.property_id) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Property Login Debug</h1>
          <p className="mt-4 text-slate-700">
            Your profile is not linked to a property yet.
          </p>
          <p className="mt-2 text-sm text-slate-500">User ID: {user.id}</p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select(`
      id,
      name,
      city,
      state,
      address_line_1,
      property_manager_name,
      contact_phone,
      contact_email,
      service_days,
      recycling_service_days,
      pickup_start_time,
      requires_photo_proof
    `)
    .eq("id", profile.property_id)
    .single();

  if (propertyError || !property) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Property Login Debug</h1>
          <p className="mt-4 text-slate-700">Property lookup failed.</p>
          <p className="mt-2 text-sm text-slate-500">
            Property ID on profile: {String(profile.property_id)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Error: {propertyError?.message || "Unknown error"}
          </p>
        </div>
      </main>
    );
  }

  const typedProperty = property as PropertyRecord;

  const [{ data: routes }, { data: complaints }] = await Promise.all([
    supabase
      .from("routes")
      .select("id, route_date, status")
      .eq("property_id", typedProperty.id)
      .order("route_date", { ascending: false })
      .limit(5),
    supabase
      .from("complaints")
      .select("id, status, created_at")
      .eq("property_id", typedProperty.id)
      .order("created_at", { ascending: false }),
  ]);

  const typedRoutes = (routes ?? []) as RouteRecord[];
  const typedComplaints = (complaints ?? []) as ComplaintRecord[];

  const openComplaints = typedComplaints.filter(
    (complaint) =>
      complaint.status === "new" || complaint.status === "under_review"
  ).length;

  const completedRoutes = typedRoutes.filter(
    (route) => route.status === "completed"
  ).length;

  const activeRoutes = typedRoutes.filter(
    (route) => route.status === "claimed" || route.status === "in_progress"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Property Portal
              </p>
              <h1 className="mt-2 text-4xl font-bold">{typedProperty.name}</h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                {typedProperty.address_line_1 || "Address not set"} ·{" "}
                {typedProperty.city}, {typedProperty.state}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-slate-300">Service Schedule</p>
                <p className="mt-2 text-lg font-bold text-white">
                  {formatServiceDays(typedProperty.service_days)}
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  Start time: {typedProperty.pickup_start_time || "Not set"}
                </p>
              </div>

              <Link
                href="/property/invoices"
                className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Invoices
              </Link>

              <Link
                href="/property/proof"
                className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Proof Photos
              </Link>

              <form action={logoutProperty}>
                <button
                  type="submit"
                  className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Log Out
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Recent Routes</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              {typedRoutes.length}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Most recent service records
            </p>
          </div>

          <div className="rounded-3xl bg-blue-50 p-5 shadow-sm ring-1 ring-blue-100">
            <p className="text-sm text-blue-700">Active Routes</p>
            <p className="mt-3 text-4xl font-bold text-blue-900">
              {activeRoutes}
            </p>
            <p className="mt-2 text-sm text-blue-700">
              Claimed or in progress
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
            <p className="text-sm text-emerald-700">Completed Routes</p>
            <p className="mt-3 text-4xl font-bold text-emerald-900">
              {completedRoutes}
            </p>
            <p className="mt-2 text-sm text-emerald-700">
              Completed recent service
            </p>
          </div>

          <div className="rounded-3xl bg-rose-50 p-5 shadow-sm ring-1 ring-rose-100">
            <p className="text-sm text-rose-700">Open Complaints</p>
            <p className="mt-3 text-4xl font-bold text-rose-900">
              {openComplaints}
            </p>
            <p className="mt-2 text-sm text-rose-700">
              New or under review
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr,0.9fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Recent Service Activity</h2>
            <p className="mt-2 text-sm text-slate-500">
              Latest routes for this property.
            </p>

            <div className="mt-5 space-y-4">
              {typedRoutes.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                  No routes found for this property yet.
                </div>
              ) : (
                typedRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="rounded-2xl border bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          Service Date: {route.route_date}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Service completed by assigned worker
                        </p>
                      </div>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getRouteStatusBadge(
                          route.status
                        )}`}
                      >
                        {route.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Property Contacts</h2>

              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div>
                  <p className="text-slate-500">Property Manager</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {typedProperty.property_manager_name || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Phone</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {typedProperty.contact_phone || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {typedProperty.contact_email || "Not set"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Service Settings</h2>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-slate-500">Trash Service Days</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {formatServiceDays(typedProperty.service_days)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-slate-500">Recycling Service Days</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {formatServiceDays(typedProperty.recycling_service_days)}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Pickup Start</span>
                  <span className="font-medium text-slate-900">
                    {typedProperty.pickup_start_time || "Not set"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Photo Proof</span>
                  <span className="font-medium text-slate-900">
                    {typedProperty.requires_photo_proof ? "Required" : "Optional"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Service Quality</span>
                  <span className="font-medium text-slate-900">
                    {openComplaints === 0 ? "Good Standing" : "Needs Attention"}
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}