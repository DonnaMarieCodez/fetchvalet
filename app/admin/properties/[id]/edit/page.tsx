import { notFound } from "next/navigation";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPropertyPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !property) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-3xl font-black">Edit Property</h1>

      <form className="space-y-4">
        <div>
          <label className="text-sm font-medium">Property Name</label>
          <input
            name="name"
            defaultValue={property.name ?? ""}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Address</label>
          <input
            name="addressLine1"
            defaultValue={property.address_line_1 ?? ""}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">City</label>
          <input
            name="city"
            defaultValue={property.city ?? ""}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">State</label>
          <input
            name="state"
            defaultValue={property.state ?? ""}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        {/* ✅ SAFE TIME INPUT */}
        <div>
          <label className="text-sm font-medium">Pickup Time</label>
          <input
            type="time"
            name="pickupStartTime"
            defaultValue={
              property.pickup_start_time
                ? String(property.pickup_start_time).slice(0, 5)
                : ""
            }
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        {/* ✅ OPTIONAL — safe financial fields */}
        <div>
          <label className="text-sm font-medium">Monthly Billing ($)</label>
          <input
            type="number"
            step="0.01"
            name="monthlyBillingDollars"
            defaultValue={(property.monthly_billing_cents ?? 0) / 100}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Route Payout ($)</label>
          <input
            type="number"
            step="0.01"
            name="defaultRoutePayoutDollars"
            defaultValue={(property.default_route_payout_cents ?? 0) / 100}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="mt-4 rounded bg-black text-white px-5 py-3"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}