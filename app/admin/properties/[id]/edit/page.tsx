import { notFound } from "next/navigation";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { updateProperty } from "../../actions/update-property";

// ✅ Fix time formatting (AM/PM → 24hr)
function formatTimeForInput(value: string | null | undefined) {
  if (!value) return "20:00";

  if (/^\d{2}:\d{2}$/.test(value)) return value;

  const match = value.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return "20:00";

  let hour = Number(match[1]);
  const minute = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

export default async function EditPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !property) {
    return notFound();
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Edit Property
      </h1>

      <form action={updateProperty} className="space-y-6">
        <input type="hidden" name="propertyId" value={property.id} />

        {/* Name */}
        <div>
          <label className="text-sm font-medium">Property Name</label>
          <input
            name="name"
            defaultValue={property.name}
            required
            className="mt-2 w-full rounded-xl border px-4 py-3"
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-sm font-medium">Address</label>
          <input
            name="addressLine1"
            defaultValue={property.address_line_1}
            required
            className="mt-2 w-full rounded-xl border px-4 py-3"
          />
        </div>

        {/* City / State */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="city"
            defaultValue={property.city}
            required
            className="rounded-xl border px-4 py-3"
          />
          <input
            name="state"
            defaultValue={property.state}
            required
            className="rounded-xl border px-4 py-3"
          />
        </div>

        {/* Pickup Time (FIXED) */}
        <div>
          <label className="text-sm font-medium">Pickup Start Time</label>
          <input
            name="pickupStartTime"
            type="time"
            defaultValue={formatTimeForInput(property.pickup_start_time)}
            required
            className="mt-2 w-full rounded-xl border px-4 py-3"
          />
        </div>

        {/* Pricing (Admin only) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Monthly Billing ($)</label>
            <input
              name="monthlyBillingDollars"
              type="number"
              step="0.01"
              defaultValue={(property.monthly_billing_cents || 0) / 100}
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Route Payout ($)</label>
            <input
              name="defaultRoutePayoutDollars"
              type="number"
              step="0.01"
              defaultValue={(property.default_route_payout_cents || 0) / 100}
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </div>
        </div>

        {/* Submit */}
        <button className="w-full rounded-xl bg-black py-3 text-white font-semibold">
          Update Property
        </button>
      </form>
    </main>
  );
}