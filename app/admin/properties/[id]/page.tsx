import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatMoney(cents: number | null | undefined) {
  return `$${((cents ?? 0) / 100).toFixed(2)}`;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !property) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
              Property Setup
            </p>

            <h1 className="mt-3 text-4xl font-black">
              {property.name || "Unnamed Property"}
            </h1>

            <p className="mt-3 text-slate-200">
              {property.address_line_1 || "No address"}
              {property.city ? ` • ${property.city}, ${property.state || ""}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/properties/${property.id}/edit`}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900"
            >
              Edit Property
            </Link>

            <Link
              href="/admin/properties"
              className="rounded-2xl border border-white/30 px-5 py-3 text-sm font-bold text-white"
            >
              Back to Properties
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card label="Status" value={property.property_status || "pending"} />
        <Card label="Units" value={property.number_of_units ?? 0} />
        <Card label="Buildings" value={property.number_of_buildings ?? 0} />
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-black text-slate-900">
          Property Details
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Detail label="Manager" value={property.property_manager_name} />
          <Detail label="Phone" value={property.contact_phone} />
          <Detail label="Email" value={property.contact_email} />
          <Detail label="Service Days" value={property.service_days} />
          <Detail label="Pickup Time" value={property.pickup_start_time} />
          <Detail label="Route Payout" value={formatMoney(property.default_route_payout_cents)} />
          <Detail label="Monthly Billing" value={formatMoney(property.monthly_billing_cents)} />
          <Detail label="Billing Contact" value={property.billing_contact_name} />
          <Detail label="Alternate Contact" value={property.alternate_contact_name} />
          <Detail label="Access Notes" value={property.access_notes} />
          <Detail label="Special Handling" value={property.special_handling_notes} />
        </div>
      </section>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black capitalize text-slate-900">
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">
        {value === null || value === undefined || value === "" ? "None" : value}
      </p>
    </div>
  );
}