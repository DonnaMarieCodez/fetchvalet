import Link from "next/link";
import { requireAdmin } from "../../../src/lib/auth/require-admin";
import { createClient } from "../../../src/lib/supabase/server";

type PropertyRecord = {
  id: string;
  name: string;
  city: string;
  state: string;
};

export default async function PropertiesPage() {
  const supabase = await createClient();

  const { data: properties, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  const typedProperties = (properties ?? []) as PropertyRecord[];

  return (
    <>
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
              Property Management
            </p>
            <h1 className="mt-2 text-4xl font-bold">Properties</h1>
            <p className="mt-3 max-w-2xl text-slate-200">
              View and manage all properties in the system, then drill into each
              location to add buildings and units.
            </p>
          </div>

          <Link
            href="/admin/properties/new"
            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
          >
            Add Property
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {error.message}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Total Properties</p>
          <p className="mt-3 text-4xl font-bold text-slate-900">
            {typedProperties.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Active locations in your portfolio
          </p>
        </div>

        <div className="rounded-3xl bg-blue-50 p-5 shadow-sm ring-1 ring-blue-100">
          <p className="text-sm text-blue-700">Quick Setup</p>
          <p className="mt-3 text-lg font-bold text-blue-900">
            Add buildings and units
          </p>
          <p className="mt-2 text-sm text-blue-700">
            Click into any property to continue setup
          </p>
        </div>

        <div className="rounded-3xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
          <p className="text-sm text-emerald-700">Next Step</p>
          <p className="mt-3 text-lg font-bold text-emerald-900">
            Generate routes later
          </p>
          <p className="mt-2 text-sm text-emerald-700">
            Once units are built out, route creation gets easier
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">All Properties</h2>
          <p className="text-sm text-slate-500">
            Click a property to manage buildings and units
          </p>
        </div>

        <div className="mt-4 space-y-4">
          {typedProperties.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <p className="text-slate-600">No properties found yet.</p>
            </div>
          ) : (
            typedProperties.map((property) => (
              <Link
                key={property.id}
                href={`/admin/properties/${property.id}`}
                className="block rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xl font-bold text-slate-900">
                      {property.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {property.city}, {property.state}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                    Open Property
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}
