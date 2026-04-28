import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/src/lib/supabase/admin";
import {
  createBuilding,
  createUnits,
  generateUnits,
  updateBuilding,
  deleteUnit,
  deleteBuilding,
  updatePropertyStatus,
} from "../actions/building-unit-actions";
import ConfirmDeleteUnitButton from "./ConfirmDeleteUnitButton";
import ConfirmDeleteBuildingButton from "./ConfirmDeleteBuildingButton";

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
  pickup_start_time: string | null;
  requires_photo_proof: boolean | null;
  billing_contact_name: string | null;
  billing_contact_email: string | null;
  monthly_billing_cents: number | null;
  alternate_contact_name: string | null;
  alternate_contact_phone: string | null;
  default_route_payout_cents: number | null;
  default_minimum_worker_score: number | null;
  special_handling_notes: string | null;
  resident_reminders_enabled: boolean | null;
  property_status: string | null;
};

type BuildingRecord = {
  id: string;
  name: string;
  property_id: string;
};

type UnitRecord = {
  id: string;
  unit_number: string;
  floor: string | null;
  building_id: string;
  active: boolean | null;
};

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-slate-900">{value || "Not set"}</p>
    </div>
  );
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: property, error: propertyError } = await supabase
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
      pickup_start_time,
      requires_photo_proof,
      billing_contact_name,
      billing_contact_email,
      monthly_billing_cents,
      alternate_contact_name,
      alternate_contact_phone,
      default_route_payout_cents,
      default_minimum_worker_score,
      special_handling_notes,
      resident_reminders_enabled,
      property_status
    `)
    .eq("id", id)
    .single();

  if (propertyError || !property) {
    notFound();
  }

  const { data: buildings } = await supabase
    .from("buildings")
    .select("id, name, property_id")
    .eq("property_id", id)
    .order("name", { ascending: true });

  const buildingIds = (buildings ?? []).map((building) => building.id);

  let units: UnitRecord[] = [];
  if (buildingIds.length > 0) {
    const { data: unitData } = await supabase
      .from("units")
      .select("id, unit_number, floor, building_id, active")
      .in("building_id", buildingIds)
      .order("unit_number", { ascending: true });

    units = (unitData ?? []) as UnitRecord[];
  }

  const typedProperty = property as PropertyRecord;
  const typedBuildings = (buildings ?? []) as BuildingRecord[];
  const totalUnits = units.length;
  const propertyStatus = typedProperty.property_status || "active";

  return (
    <>
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
              Property Setup
            </p>
            <h1 className="mt-2 text-4xl font-bold">{typedProperty.name}</h1>
            <p className="mt-3 max-w-2xl text-slate-200">
              {typedProperty.address_line_1 || "No address entered"}
              {typedProperty.address_line_2 ? `, ${typedProperty.address_line_2}` : ""}
              <br />
              {typedProperty.city}, {typedProperty.state}
              {typedProperty.zip_code ? ` ${typedProperty.zip_code}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/properties/${typedProperty.id}/edit`}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              Edit Property
            </Link>

            <Link
              href="/admin/properties"
              className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to Properties
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Property Status</p>
            <p className="mt-1 text-lg font-bold capitalize text-slate-900">
              {propertyStatus}
            </p>
          </div>

          <form action={updatePropertyStatus} className="flex flex-wrap gap-3">
            <input type="hidden" name="propertyId" value={typedProperty.id} />

            {propertyStatus !== "active" && (
              <button
                type="submit"
                name="propertyStatus"
                value="active"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-white"
              >
                Activate Property
              </button>
            )}

            {propertyStatus !== "suspended" && (
              <button
                type="submit"
                name="propertyStatus"
                value="suspended"
                className="rounded-xl bg-amber-600 px-4 py-2 text-white"
              >
                Suspend Property
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Buildings</p>
          <p className="mt-3 text-4xl font-bold text-slate-900">
            {typedBuildings.length}
          </p>
        </div>

        <div className="rounded-3xl bg-blue-50 p-5 shadow-sm ring-1 ring-blue-100">
          <p className="text-sm text-blue-700">Units</p>
          <p className="mt-3 text-4xl font-bold text-blue-900">{totalUnits}</p>
        </div>

        <div className="rounded-3xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
          <p className="text-sm text-emerald-700">Photo Proof</p>
          <p className="mt-3 text-lg font-bold text-emerald-900">
            {typedProperty.requires_photo_proof ? "Required" : "Optional"}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Property Details</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Detail label="Manager" value={typedProperty.property_manager_name} />
          <Detail label="Phone" value={typedProperty.contact_phone} />
          <Detail label="Email" value={typedProperty.contact_email} />
          <Detail label="Service Days" value={typedProperty.service_days} />
          <Detail label="Pickup Time" value={typedProperty.pickup_start_time} />
          <Detail
            label="Route Payout"
            value={`$${((typedProperty.default_route_payout_cents || 0) / 100).toFixed(2)}`}
          />
          <Detail
            label="Min Worker Score"
            value={typedProperty.default_minimum_worker_score}
          />
          <Detail
            label="Alternate Contact"
            value={
              typedProperty.alternate_contact_name
                ? `${typedProperty.alternate_contact_name}${
                    typedProperty.alternate_contact_phone
                      ? ` · ${typedProperty.alternate_contact_phone}`
                      : ""
                  }`
                : null
            }
          />
          <Detail
            label="Billing Contact"
            value={
              typedProperty.billing_contact_name
                ? `${typedProperty.billing_contact_name}${
                    typedProperty.billing_contact_email
                      ? ` · ${typedProperty.billing_contact_email}`
                      : ""
                  }`
                : null
            }
          />
          <Detail
  label="Monthly Billing"
  value={`$${((typedProperty.monthly_billing_cents || 0) / 100).toFixed(2)}`}
/>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-slate-500">Access Notes</p>
          <p className="mt-1 text-slate-900">
            {typedProperty.access_notes || "None"}
          </p>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-slate-500">Special Handling</p>
          <p className="mt-1 text-slate-900">
            {typedProperty.special_handling_notes || "None"}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Add Building</h2>

          <form action={createBuilding} className="mt-4 space-y-3">
            <input type="hidden" name="propertyId" value={typedProperty.id} />

            <input
              name="name"
              placeholder="Building Name"
              required
              className="w-full rounded-xl border px-3 py-2"
            />

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-white"
            >
              Add Building
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Add Units</h2>

          <form action={createUnits} className="mt-4 space-y-3">
            <input type="hidden" name="propertyId" value={typedProperty.id} />

            <select
              name="buildingId"
              required
              defaultValue=""
              className="w-full rounded-xl border px-3 py-2"
            >
              <option value="">Select Building</option>
              {typedBuildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>

            <input
              name="units"
              placeholder="101,102,103"
              required
              className="w-full rounded-xl border px-3 py-2"
            />

            <input
              name="floor"
              placeholder="Floor (optional)"
              className="w-full rounded-xl border px-3 py-2"
            />

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-white"
            >
              Add Units
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Smart Unit Generator</h2>
        <p className="mt-2 text-sm text-slate-500">
          Generate all units for a building at once by floor count and units per floor.
        </p>

        <form action={generateUnits} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input type="hidden" name="propertyId" value={typedProperty.id} />

          <select
            name="buildingId"
            required
            defaultValue=""
            className="rounded-xl border px-3 py-2"
          >
            <option value="">Select Building</option>
            {typedBuildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>

          <input
            name="startFloor"
            type="number"
            min="1"
            defaultValue="1"
            placeholder="Start Floor"
            required
            className="rounded-xl border px-3 py-2"
          />

          <input
            name="floorCount"
            type="number"
            min="1"
            placeholder="Number of Floors"
            required
            className="rounded-xl border px-3 py-2"
          />

          <input
            name="unitsPerFloor"
            type="number"
            min="1"
            placeholder="Units Per Floor"
            required
            className="rounded-xl border px-3 py-2"
          />

          <button
            type="submit"
            className="md:col-span-2 xl:col-span-4 rounded-xl bg-emerald-600 px-4 py-2 text-white"
          >
            Generate All Units
          </button>
        </form>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Buildings & Units</h2>
          <p className="text-sm text-slate-500">
            Rename buildings, delete buildings, and remove units here
          </p>
        </div>

        {typedBuildings.length === 0 ? (
          <p className="mt-4 text-slate-500">No buildings added yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {typedBuildings.map((building) => {
              const buildingUnits = units.filter(
                (unit) => unit.building_id === building.id
              );

              return (
                <div
                  key={building.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        {building.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {buildingUnits.length} units
                      </p>
                    </div>

                    <div className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
                      <form
                        action={updateBuilding}
                        className="flex flex-1 gap-2"
                      >
                        <input
                          type="hidden"
                          name="propertyId"
                          value={typedProperty.id}
                        />
                        <input
                          type="hidden"
                          name="buildingId"
                          value={building.id}
                        />

                        <input
                          name="name"
                          defaultValue={building.name}
                          required
                          className="flex-1 rounded-xl border bg-white px-3 py-2"
                        />

                        <button
                          type="submit"
                          className="rounded-xl bg-slate-900 px-4 py-2 text-white"
                        >
                          Save
                        </button>
                      </form>

                      <form action={deleteBuilding}>
                        <input
                          type="hidden"
                          name="propertyId"
                          value={typedProperty.id}
                        />
                        <input
                          type="hidden"
                          name="buildingId"
                          value={building.id}
                        />

                        <ConfirmDeleteBuildingButton />
                      </form>
                    </div>
                  </div>

                  {buildingUnits.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {buildingUnits.map((unit) => (
                        <div
                          key={unit.id}
                          className="flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm text-slate-700"
                        >
                          <span>
                            {unit.unit_number}
                            {unit.floor ? ` · Floor ${unit.floor}` : ""}
                          </span>

                          <form action={deleteUnit}>
                            <input
                              type="hidden"
                              name="propertyId"
                              value={typedProperty.id}
                            />
                            <input type="hidden" name="unitId" value={unit.id} />

                            <ConfirmDeleteUnitButton />
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}