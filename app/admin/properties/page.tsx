import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function AdminPropertiesPage() {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data: properties, error } = await supabase
    .from("properties")
    .select(
      "id, name, address_line_1, city, state, property_status, number_of_units, number_of_buildings, created_at"
    )
    .order("created_at", { ascending: false });

  const propertyList = properties ?? [];

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
              Property Management
            </p>
            <h1 className="mt-3 text-4xl font-black">Properties</h1>
            <p className="mt-3 max-w-2xl text-slate-200">
              View, edit, activate, suspend, and manage properties.
            </p>
          </div>

          <Link
            href="/admin/properties/new"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900"
          >
            Add Property
          </Link>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          Error: {error.message}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Total Properties</p>
          <p className="mt-3 text-4xl font-black">{propertyList.length}</p>
        </div>

        <div className="rounded-3xl bg-blue-50 p-5 shadow-sm ring-1 ring-blue-100">
          <p className="text-sm text-blue-700">Quick Setup</p>
          <p className="mt-3 text-xl font-black text-blue-900">
            Add buildings and units
          </p>
        </div>

        <div className="rounded-3xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
          <p className="text-sm text-emerald-700">Next Step</p>
          <p className="mt-3 text-xl font-black text-emerald-900">
            Generate routes
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-black text-slate-900">All Properties</h2>

        <div className="mt-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          {propertyList.length === 0 ? (
            <p className="text-slate-600">No properties found yet.</p>
          ) : (
            <div className="space-y-3">
              {propertyList.map((property) => (
                <Link
                  key={property.id}
                  href={`/admin/properties/${property.id}`}
                  className="block cursor-pointer rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/40"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-black text-slate-900">
                        {property.name || "Unnamed Property"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {property.address_line_1 || "No address"}
                        {property.city
                          ? ` • ${property.city}, ${property.state || ""}`
                          : ""}
                      </p>

                      <p className="mt-2 text-xs font-semibold text-blue-600">
                        Click to manage property →
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                        {property.property_status || "pending"}
                      </span>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {property.number_of_units ?? 0} units
                      </span>

                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {property.number_of_buildings ?? 0} buildings
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}