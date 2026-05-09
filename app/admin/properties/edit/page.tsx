import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { updateProperty } from "../actions/update-property";

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function EditPropertyPage({ searchParams }: PageProps) {
  await requireAdmin();

  const { id } = await searchParams;

  if (!id) {
    return <ErrorBox message="Missing property ID." />;
  }

  const supabase = createAdminClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !property) {
    return (
      <ErrorBox
        message={error?.message || "No property was found for this ID."}
      />
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
      </section>

      <form
        action={updateProperty}
        className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <input type="hidden" name="propertyId" value={id} />

        <div className="grid gap-5 md:grid-cols-2">
          <Input name="name" label="Property Name" defaultValue={property.name} required />
          <Input name="addressLine1" label="Address Line 1" defaultValue={property.address_line_1} required />
          <Input name="city" label="City" defaultValue={property.city} required />
          <Input name="state" label="State" defaultValue={property.state} required />
          <Input name="zipCode" label="ZIP Code" defaultValue={property.zip_code} />

          <Input
            name="pickupStartTime"
            label="Pickup Start Time"
            type="time"
            defaultValue={String(property.pickup_start_time || "20:00").slice(0, 5)}
            required
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

          <Input
            name="maxUnitsPerRoute"
            label="Max Units Per Route"
            type="number"
            defaultValue={property.max_units_per_route ?? 150}
          />
        </div>

        <div className="mt-8 flex gap-3 border-t pt-8">
          <button className="rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white">
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
        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
      />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        <h1 className="text-2xl font-black">Edit property failed to load</h1>
        <p className="mt-3">{message}</p>
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