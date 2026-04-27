import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { updateProperty } from "../../actions/update-property";

type PropertyRecord = {
  id: string;
  name: string;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  property_manager_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  access_notes: string | null;
  service_days: string | null;
  recycling_service_days: string | null;
  pickup_start_time: string | null;
  requires_photo_proof: boolean | null;
  billing_contact_name: string | null;
  billing_contact_email: string | null;
  alternate_contact_name: string | null;
  alternate_contact_phone: string | null;
  default_route_payout_cents: number | null;
  monthly_billing_cents: number | null;
  default_minimum_worker_score: number | null;
  max_units_per_route: number | null;
  special_handling_notes: string | null;
  resident_reminders_enabled: boolean | null;
  auto_generate_routes: boolean | null;
};

const DAY_OPTIONS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select(`
      id,
      name,
      address_line_1,
      address_line_2,
      city,
      state,
      zip_code,
      property_manager_name,
      contact_phone,
      contact_email,
      access_notes,
      service_days,
      recycling_service_days,
      pickup_start_time,
      requires_photo_proof,
      billing_contact_name,
      billing_contact_email,
      alternate_contact_name,
      alternate_contact_phone,
      default_route_payout_cents,
      monthly_billing_cents,
      default_minimum_worker_score,
      max_units_per_route,
      special_handling_notes,
      resident_reminders_enabled,
      auto_generate_routes
    `)
    .eq("id", id)
    .single();

  if (error || !property) {
    notFound();
  }

  const typedProperty = property as PropertyRecord;

  const selectedServiceDays = new Set(
    (typedProperty.service_days || "")
      .split(",")
      .map((day) => day.trim())
      .filter(Boolean)
  );

  const selectedRecyclingServiceDays = new Set(
    (typedProperty.recycling_service_days || "")
      .split(",")
      .map((day) => day.trim())
      .filter(Boolean)
  );

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Property Management
              </p>
              <h1 className="mt-2 text-4xl font-bold">Edit Property</h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                Update property details, service schedules, billing defaults, and automation settings.
              </p>
            </div>

            <Link
              href={`/admin/properties/${typedProperty.id}`}
              className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to Property
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <form action={updateProperty} className="space-y-8">
            <input type="hidden" name="propertyId" value={typedProperty.id} />

            <section>
              <h2 className="text-xl font-bold text-slate-900">Basic Information</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Property Name
                  </label>
                  <input
                    name="name"
                    required
                    defaultValue={typedProperty.name}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Address Line 1
                  </label>
                  <input
                    name="addressLine1"
                    required
                    defaultValue={typedProperty.address_line_1 || ""}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Address Line 2
                  </label>
                  <input
                    name="addressLine2"
                    defaultValue={typedProperty.address_line_2 || ""}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    City
                  </label>
                  <input
                    name="city"
                    required
                    defaultValue={typedProperty.city}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    State
                  </label>
                  <input
                    name="state"
                    required
                    defaultValue={typedProperty.state}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Zip Code
                  </label>
                  <input
                    name="zipCode"
                    defaultValue={typedProperty.zip_code || ""}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Contacts</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Property Manager Name
                  </label>
                  <input
                    name="propertyManagerName"
                    defaultValue={typedProperty.property_manager_name || ""}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Property Phone
                  </label>
                  <input
                    name="contactPhone"
                    defaultValue={typedProperty.contact_phone || ""}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Property Email
                  </label>
                  <input
                    name="contactEmail"
                    type="email"
                    defaultValue={typedProperty.contact_email || ""}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Alternate Contact Name
                  </label>
                  <input
                    name="alternateContactName"
                    defaultValue={typedProperty.alternate_contact_name || ""}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Alternate Contact Phone
                  </label>
                  <input
                    name="alternateContactPhone"
                    defaultValue={typedProperty.alternate_contact_phone || ""}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Billing Contact Name
                  </label>
                  <input
                    name="billingContactName"
                    defaultValue={typedProperty.billing_contact_name || ""}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Billing Contact Email
                  </label>
                  <input
                    name="billingContactEmail"
                    type="email"
                    defaultValue={typedProperty.billing_contact_email || ""}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Operations</h2>
              <div className="mt-4 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Trash Service Days
                  </label>

                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {DAY_OPTIONS.map((day) => (
                      <label
                        key={day}
                        className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          name="serviceDays"
                          value={day}
                          defaultChecked={selectedServiceDays.has(day)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Choose every day this property receives regular valet trash service.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Recycling Service Days
                  </label>

                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {DAY_OPTIONS.map((day) => (
                      <label
                        key={day}
                        className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          name="recyclingServiceDays"
                          value={day}
                          defaultChecked={selectedRecyclingServiceDays.has(day)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Select recycling pickup days if this property uses a separate recycling schedule.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Pickup Start Time
                    </label>
                    <input
                      name="pickupStartTime"
                      defaultValue={typedProperty.pickup_start_time || ""}
                      className="mt-1 w-full rounded-2xl border px-3 py-2"
                      placeholder="e.g. 20:00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Default Route Payout ($)
                    </label>
                    <input
                      name="defaultRoutePayoutDollars"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={(
                        (typedProperty.default_route_payout_cents || 0) / 100
                      ).toFixed(2)}
                      className="mt-1 w-full rounded-2xl border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Monthly Billing Amount ($)
                    </label>
                    <input
                      name="monthlyBillingDollars"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={(
                        (typedProperty.monthly_billing_cents || 0) / 100
                      ).toFixed(2)}
                      className="mt-1 w-full rounded-2xl border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Default Minimum Worker Score
                    </label>
                    <input
                      name="defaultMinimumWorkerScore"
                      type="number"
                      min="0"
                      defaultValue={typedProperty.default_minimum_worker_score ?? 0}
                      className="mt-1 w-full rounded-2xl border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Max Units Per Route
                    </label>
                    <input
                      name="maxUnitsPerRoute"
                      type="number"
                      min="1"
                      defaultValue={typedProperty.max_units_per_route ?? 150}
                      className="mt-1 w-full rounded-2xl border px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-2xl border px-4 py-3">
                    <input
                      id="requiresPhotoProof"
                      name="requiresPhotoProof"
                      type="checkbox"
                      defaultChecked={!!typedProperty.requires_photo_proof}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Require Photo Proof
                    </span>
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border px-4 py-3">
                    <input
                      id="residentRemindersEnabled"
                      name="residentRemindersEnabled"
                      type="checkbox"
                      defaultChecked={!!typedProperty.resident_reminders_enabled}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Resident Reminders Enabled
                    </span>
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border px-4 py-3 md:col-span-2">
                    <input
                      id="autoGenerateRoutes"
                      name="autoGenerateRoutes"
                      type="checkbox"
                      defaultChecked={!!typedProperty.auto_generate_routes}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Auto Generate Routes
                    </span>
                  </label>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Notes</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Access Notes
                  </label>
                  <textarea
                    name="accessNotes"
                    rows={4}
                    defaultValue={typedProperty.access_notes || ""}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Special Handling Notes
                  </label>
                  <textarea
                    name="specialHandlingNotes"
                    rows={4}
                    defaultValue={typedProperty.special_handling_notes || ""}
                    className="mt-1 w-full rounded-2xl border px-3 py-2"
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Save Property
              </button>

              <Link
                href={`/admin/properties/${typedProperty.id}`}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}