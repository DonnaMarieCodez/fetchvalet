import Link from "next/link";
import { createPropertyOnboarding } from "./actions";

const SERVICE_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function PropertyOnboardingPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
            FetchValet
          </p>
          <h1 className="mt-3 text-4xl font-black">Property Onboarding</h1>
          <p className="mt-2 text-slate-300">
            Set up your property, choose service days, and request valet trash coverage.
          </p>
        </section>

        <form
          action={createPropertyOnboarding}
          className="mt-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
        >
          <section>
            <h2 className="text-2xl font-black text-slate-900">
              Property Details
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <input name="name" required placeholder="Property Name" className="rounded-2xl border px-4 py-3" />
              <input name="addressLine1" required placeholder="Address Line 1" className="rounded-2xl border px-4 py-3" />
              <input name="city" required placeholder="City" className="rounded-2xl border px-4 py-3" />
              <input name="state" required placeholder="State" className="rounded-2xl border px-4 py-3" />
              <input name="zipCode" placeholder="ZIP Code" className="rounded-2xl border px-4 py-3" />

              <input
                name="pickupStartTime"
                type="time"
                defaultValue="20:00"
                required
                className="rounded-2xl border px-4 py-3"
              />
            </div>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-2xl font-black text-slate-900">
              Primary Contact
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <input name="propertyManagerName" placeholder="Manager Name" className="rounded-2xl border px-4 py-3" />
              <input name="contactEmail" type="email" placeholder="Manager Email" className="rounded-2xl border px-4 py-3" />
              <input name="contactPhone" placeholder="Manager Phone" className="rounded-2xl border px-4 py-3" />
              <input name="billingContactName" placeholder="Billing Contact" className="rounded-2xl border px-4 py-3" />
              <input name="alternateContactName" placeholder="Alternate Contact" className="rounded-2xl border px-4 py-3 md:col-span-2" />
            </div>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-2xl font-black text-slate-900">
              Service Setup
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <input name="numberOfUnits" type="number" min="1" placeholder="Number of Units" className="rounded-2xl border px-4 py-3" />
              <input name="numberOfBuildings" type="number" min="1" placeholder="Number of Buildings" className="rounded-2xl border px-4 py-3" />
            </div>

            <p className="mt-6 text-sm font-medium text-slate-700">
              Service Days
            </p>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {SERVICE_DAYS.map((day) => (
                <label key={day} className="flex items-center gap-3 rounded-2xl border bg-slate-50 px-4 py-3 text-sm">
                  <input type="checkbox" name="serviceDays" value={day} />
                  {day}
                </label>
              ))}
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <textarea name="accessNotes" rows={4} placeholder="Access notes..." className="rounded-2xl border px-4 py-3" />
              <textarea name="specialHandlingNotes" rows={4} placeholder="Special handling..." className="rounded-2xl border px-4 py-3" />
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border bg-slate-50 px-4 py-3 text-sm">
                <input type="checkbox" name="requiresPhotoProof" defaultChecked />
                Require proof photos
              </label>

              <label className="flex items-center gap-3 rounded-2xl border bg-slate-50 px-4 py-3 text-sm">
                <input type="checkbox" name="autoGenerateRoutes" defaultChecked />
                Auto-generate routes
              </label>
            </div>
          </section>

          <div className="mt-8 flex gap-3 border-t pt-8">
            <button type="submit" className="rounded-2xl bg-slate-950 px-6 py-3 font-semibold text-white">
              Complete Setup
            </button>

            <Link href="/" className="rounded-2xl border px-6 py-3 font-semibold text-slate-700">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}