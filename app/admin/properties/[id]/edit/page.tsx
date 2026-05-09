import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { updateProperty } from "../../actions/update-property";

type PageProps = {
  params: Promise<{ id: string }>;
};

const SERVICE_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function formatTime(value: string | null | undefined) {
  if (!value) return "20:00";
  return String(value).slice(0, 5);
}

function hasDay(serviceDays: string | null | undefined, day: string) {
  return String(serviceDays || "")
    .split(",")
    .map((item) => item.trim())
    .includes(day);
}

export default async function EditPropertyPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !property) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h1 className="text-2xl font-black">Property failed to load</h1>
          <p className="mt-3">Property ID: {id}</p>
          <p className="mt-3">{error?.message || "No property found."}</p>
          <Link
            href="/admin/properties"
            className="mt-6 inline-block rounded-2xl bg-red-700 px-5 py-3 font-bold text-white"
          >
            Back to Properties
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
          Edit Property
        </p>
        <h1 className="mt-3 text-4xl font-black">
          {property.name || "Unnamed Property"}
        </h1>
        <p className="mt-3 text-slate-200">
          Update property details, service schedule, pricing, and route settings.
        </p>
      </section>

      <form
        action={updateProperty}
        className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <input type="hidden" name="propertyId" value={id} />

        <section>
          <h2 className="text-2xl font-black text-slate-900">
            Property Details
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Input name="name" label="Property Name" defaultValue={property.name} required />
            <Input name="addressLine1" label="Address Line 1" defaultValue={property.address_line_1} required />
            <Input name="addressLine2" label="Address Line 2" defaultValue={property.address_line_2} />
            <Input name="city" label="City" defaultValue={property.city} required />
            <Input name="state" label="State" defaultValue={property.state} required />
            <Input name="zipCode" label="ZIP Code" defaultValue={property.zip_code} />
          </div>
        </section>

        <hr className="my-8" />

        <section>
          <h2 className="text-2xl font-black text-slate-900">
            Contact Info
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Input name="propertyManagerName" label="Manager Name" defaultValue={property.property_manager_name} />
            <Input name="contactEmail" label="Manager Email" type="email" defaultValue={property.contact_email} />
            <Input name="contactPhone" label="Manager Phone" defaultValue={property.contact_phone} />
            <Input name="billingContactName" label="Billing Contact Name" defaultValue={property.billing_contact_name} />
            <Input name="billingContactEmail" label="Billing Contact Email" type="email" defaultValue={property.billing_contact_email} />
            <Input name="alternateContactName" label="Alternate Contact Name" defaultValue={property.alternate_contact_name} />
            <Input name="alternateContactPhone" label="Alternate Contact Phone" defaultValue={property.alternate_contact_phone} />
          </div>
        </section>

        <hr className="my-8" />

        <section>
          <h2 className="text-2xl font-black text-slate-900">
            Service Setup
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Input
              name="pickupStartTime"
              label="Pickup Start Time"
              type="time"
              defaultValue={formatTime(property.pickup_start_time)}
              required
            />

            <Input
              name="maxUnitsPerRoute"
              label="Max Units Per Route"
              type="number"
              defaultValue={property.max_units_per_route ?? 150}
            />

            <Input
              name="monthlyBillingDollars"
              label="Monthly Billing ($)"
              type="number"
              step="0.01"
              defaultValue={(property.monthly_billing_cents ?? 0) / 100}
            />

            <Input
              name="defaultRoutePayoutDollars"
              label="Route Payout ($)"
              type="number"
              step="0.01"
              defaultValue={(property.default_route_payout_cents ?? 0) / 100}
            />

            <Input
              name="defaultMinimumWorkerScore"
              label="Minimum Worker Score"
              type="number"
              defaultValue={property.default_minimum_worker_score ?? 0}
            />
          </div>

          <p className="mt-6 text-sm font-medium text-slate-700">
            Service Days
          </p>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {SERVICE_DAYS.map((day) => (
              <label
                key={day}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  name="serviceDays"
                  value={day}
                  defaultChecked={hasDay(property.service_days, day)}
                />
                {day}
              </label>
            ))}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Textarea name="accessNotes" label="Access Notes" defaultValue={property.access_notes} />
            <Textarea name="specialHandlingNotes" label="Special Handling" defaultValue={property.special_handling_notes} />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <Checkbox
              name="requiresPhotoProof"
              label="Require proof photos"
              defaultChecked={Boolean(property.requires_photo_proof)}
            />

            <Checkbox
              name="residentRemindersEnabled"
              label="Resident reminders"
              defaultChecked={Boolean(property.resident_reminders_enabled)}
            />

            <Checkbox
              name="autoGenerateRoutes"
              label="Auto-generate routes"
              defaultChecked={Boolean(property.auto_generate_routes)}
            />
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3 border-t pt-8">
          <button
            type="submit"
            className="rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white"
          >
            Save Changes
          </button>

          <Link
            href={`/admin/properties/${id}`}
            className="rounded-2xl border border-slate-300 px-6 py-3 font-bold text-slate-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

function Input({
  name,
  label,
  type = "text",
  defaultValue,
  required = false,
  step,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  step?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900"
      />
    </div>
  );
}

function Textarea({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <textarea
        name={name}
        rows={4}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900"
      />
    </div>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}