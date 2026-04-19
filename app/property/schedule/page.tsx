import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../src/lib/supabase/server";
import { getPropertyProfile } from "../../../src/lib/auth/get-property-profile";

type PropertyRecord = {
  id: string;
  name: string;
  service_days: string | null;
  pickup_start_time: string | null;
  recycle_pickup_day: string | null;
  requires_photo_proof: boolean | null;
};

export default async function PropertySchedulePage() {
  const { user, profile } = await getPropertyProfile();

  if (!user) {
    redirect("/property/login");
  }

  if (!profile || profile.role !== "property" || !profile.property_id) {
    redirect("/property/login");
  }

  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select(
      "id, name, service_days, pickup_start_time, recycle_pickup_day, requires_photo_proof"
    )
    .eq("id", profile.property_id)
    .single();

  if (error || !property) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Service Schedule</h1>
          <p className="mt-2 text-slate-600">Property schedule could not be loaded.</p>

          <Link
            href="/property"
            className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to Portal
          </Link>
        </div>
      </main>
    );
  }

  const typedProperty = property as PropertyRecord;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Property Portal
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Service Schedule
            </h1>
            <p className="mt-2 text-slate-600">{typedProperty.name}</p>
          </div>

          <Link
            href="/property"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back
          </Link>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Current Schedule</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Trash Service Days</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {typedProperty.service_days || "Not set"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Pickup Start Time</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {typedProperty.pickup_start_time || "Not set"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Recycle Pickup Day</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {typedProperty.recycle_pickup_day || "Not set"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Photo Proof Requirement</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {typedProperty.requires_photo_proof ? "Required" : "Optional"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}