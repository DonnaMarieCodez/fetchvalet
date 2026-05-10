import { createAdminClient } from "@/src/lib/supabase/admin";
import { createRoute } from "./actions/create-route";
import { deleteRoute } from "./actions/route-actions";
import DeleteRouteButton from "./DeleteRouteButton";
import AutoGenerateForm from "./AutoGenerateForm";

function formatMoney(cents: number | null) {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

function formatTime(value: string | null) {
  if (!value) return "Not set";

  const [hourString, minuteString = "00"] = value.split(":");

  const hour = Number(hourString);

  if (Number.isNaN(hour)) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${hour12}:${minuteString} ${suffix}`;
}

export default async function AdminRoutesPage() {
  const supabase = createAdminClient();

  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select("id, name")
    .eq("property_status", "active")
    .order("name");

  const { data: routes, error: routesError } = await supabase
    .from("routes")
    .select("*")
    .order("route_date", { ascending: false });

  const propertyMap = new Map(
    (properties || []).map((property) => [property.id, property.name])
  );

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
            Route Operations
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Route Generator
          </h1>

          <p className="mt-3 text-slate-200">
            Generate routes manually, auto-generate scheduled routes,
            and manage existing routes.
          </p>
        </section>

        {(propertiesError || routesError) && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error: {propertiesError?.message || routesError?.message}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-2">
          {/* CREATE ROUTE */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-slate-900">
              Create Route
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select a property and generate one or more split routes
              from all active units.
            </p>

            <form action={createRoute} className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Property
                </label>

                <select
                  name="propertyId"
                  required
                  defaultValue=""
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                >
                  <option value="">Select a property</option>

                  {(properties || []).map((property) => (
                    <option
                      key={property.id}
                      value={property.id}
                    >
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Route Date
                </label>

                <input
                  name="routeDate"
                  type="date"
                  required
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  name="startTime"
                  label="Start Time"
                  type="time"
                />

                <Input
                  name="endTime"
                  label="End Time"
                  type="time"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  name="payoutDollars"
                  label="Payout ($)"
                  type="number"
                  step="0.01"
                />

                <Input
                  name="minimumWorkerScore"
                  label="Minimum Worker Score"
                  type="number"
                  defaultValue={0}
                />
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white"
              >
                Generate Route
              </button>
            </form>
          </div>

          {/* AUTO GENERATE */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-slate-900">
              Auto Generate
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Generate scheduled routes for active properties with
              auto-generate enabled.
            </p>

            <div className="mt-5">
              <AutoGenerateForm />
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Auto-generation only runs for active properties with
              matching service days and no existing route for the
              target date.
            </div>
          </div>
        </section>

        {/* RECENT ROUTES */}
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-slate-900">
            Recent Routes
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Manage generated routes and delete routes if needed.
          </p>

          <div className="mt-5 space-y-4">
            {!routes || routes.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                No routes found yet.
              </div>
            ) : (
              routes.map((route) => (
                <div
                  key={route.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xl font-black text-slate-900">
                        {propertyMap.get(route.property_id) ||
                          "Unknown Property"}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        Date: {route.route_date || "Not set"}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Time: {formatTime(route.start_time)} -{" "}
                        {formatTime(route.end_time)}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Minimum Score:{" "}
                        {route.minimum_worker_score ?? 0}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <p className="text-2xl font-black text-slate-900">
                        {formatMoney(route.payout_cents)}
                      </p>

                      <form action={deleteRoute}>
                        <input
                          type="hidden"
                          name="routeId"
                          value={route.id}
                        />

                        <DeleteRouteButton />
                      </form>
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

function Input({
  name,
  label,
  type,
  step,
  defaultValue,
}: {
  name: string;
  label: string;
  type: string;
  step?: string;
  defaultValue?: string | number;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        required
        className="mt-1 w-full rounded-2xl border px-3 py-2"
      />
    </div>
  );
}