import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { updateProperty } from "../actions/update-property";
import {
  createBuilding,
  createUnits,
} from "../actions/building-unit-actions";

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

type Building = {
  id: string;
  name: string;
};

type Unit = {
  id: string;
  unit_number: string;
  floor: string | null;
  building_id: string;
  active: boolean | null;
};

export default async function PropertySetupPage({ searchParams }: PageProps) {
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
    return <ErrorBox message={error?.message || "Property not found."} />;
  }

  const { data: buildings } = await supabase
    .from("buildings")
    .select("id, name")
    .eq("property_id", id)
    .order("name", { ascending: true });

  const typedBuildings = (buildings ?? []) as Building[];
  const buildingIds = typedBuildings.map((building) => building.id);

  let units: Unit[] = [];

  if (buildingIds.length > 0) {
    const { data: unitData } = await supabase
      .from("units")
      .select("id, unit_number, floor, building_id, active")
      .in("building_id", buildingIds)
      .order("unit_number", { ascending: true });

    units = (unitData ?? []) as Unit[];
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
          Property Setup
        </p>
        <h1 className="mt-3 text-4xl font-black">
          {property.name || "Unnamed Property"}
        </h1>
        <p className="mt-3 text-slate-200">
          Add buildings and units so routes can be generated correctly.
        </p>
      </section>

      <form
        action={updateProperty}
        className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <input type="hidden" name="propertyId" value={id} />

        <h2 className="text-2xl font-black text-slate-900">
          Property Details
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Input name="units" label="Property Name" defaultValue={property.name} required />
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
        </div>

        <div className="mt-8 flex gap-3 border-t pt-8">
          <button className="rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white">
            Save Property
          </button>

          <Link
            href="/admin/properties"
            className="rounded-2xl border border-slate-300 px-6 py-3 font-bold text-slate-700"
          >
            Back
          </Link>
        </div>
      </form>

      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-black text-slate-900">
          Buildings & Units
        </h2>

        <form action={createBuilding} className="mt-6 flex flex-col gap-3 md:flex-row">
          <input type="hidden" name="propertyId" value={id} />
          <input
            name="buildingName"
            placeholder="Building name, ex: Building A"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3"
            required
          />
          <button className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white">
            Add Building
          </button>
        </form>

        <div className="mt-8 space-y-5">
          {typedBuildings.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">
              No buildings added yet.
            </p>
          ) : (
            typedBuildings.map((building) => {
              const buildingUnits = units.filter(
                (unit) => unit.building_id === building.id
              );

              return (
                <div
                  key={building.id}
                  className="rounded-3xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        {building.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {buildingUnits.length} units
                      </p>
                    </div>

                    <form action={createUnits} className="flex flex-col gap-2 md:flex-row">
                      <input type="hidden" name="propertyId" value={id} />
                      <input type="hidden" name="buildingId" value={building.id} />

                      <input
                        name="unitNumber"
                        placeholder="Unit #"
                        className="rounded-xl border border-slate-300 px-3 py-2"
                        required
                      />

                      <input
                        name="floor"
                        placeholder="Floor"
                        className="rounded-xl border border-slate-300 px-3 py-2"
                      />

                      <button className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white">
                        Add Unit
                      </button>
                    </form>
                  </div>

                  <div className="mt-4 grid gap-2 md:grid-cols-4">
                    {buildingUnits.length === 0 ? (
                      <p className="text-sm text-slate-500">No units yet.</p>
                    ) : (
                      buildingUnits.map((unit) => (
                        <div
                          key={unit.id}
                          className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                        >
                          Unit {unit.unit_number}
                          {unit.floor ? ` • Floor ${unit.floor}` : ""}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
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
        <h1 className="text-2xl font-black">Property setup failed to load</h1>
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