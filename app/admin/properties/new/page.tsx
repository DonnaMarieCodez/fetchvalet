import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createProperty } from "../actions/create-property";

const SERVICE_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default async function NewPropertyPage() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
          FetchValet
        </p>
        <h1 className="mt-3 text-4xl font-black">Property Onboarding</h1>
        <p className="mt-2 text-slate-300">
          Add property details, contacts, and service settings. Billing and route
          payout are set later by admin.
        </p>
      </section>

      <form
        action={createProperty}
        className="mt-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <section>
          <h2 className="text-2xl font-black text-slate-900">
            Property Details
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Property Name
              </label>
              <input
                name="name"
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Address Line 1
              </label>
              <input
                name="addressLine1"
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Address Line 2
              </label>
              <input
                name="addressLine2"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                City
              </label>
              <input
                name="city"
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                State
              </label>
              <input
                name="state"
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                ZIP Code
              </label>
              <input
                name="zipCode"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>
          </div>
        </section>

        <hr className="my-8" />

        <section>
          <h2 className="text-2xl font-black text-slate-900">
            Primary Contact
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Manager Name
              </label>
              <input
                name="propertyManagerName"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Manager Email
              </label>
              <input
                name="contactEmail"
                type="email"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Manager Phone
              </label>
              <input
                name="contactPhone"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Billing Contact Name
              </label>
              <input
                name="billingContactName"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Billing Contact Email
              </label>
              <input
                name="billingContactEmail"
                type="email"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Alternate Contact Name
              </label>
              <input
                name="alternateContactName"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Alternate Contact Phone
              </label>
              <input
                name="alternateContactPhone"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>
          </div>
        </section>

        <hr className="my-8" />

        <section>
          <h2 className="text-2xl font-black text-slate-900">
            Service Setup
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Pickup Start Time
              </label>
              <input
                name="pickupStartTime"
                type="time"
                defaultValue="20:00"
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-slate-700">Service Days</p>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {SERVICE_DAYS.map((day) => (
                <label
                  key={day}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                >
                  <input type="checkbox" name="serviceDays" value={day} />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Access Notes
              </label>
              <textarea
                name="accessNotes"
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="Gate code, dumpster location, building access..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Special Handling
              </label>
              <textarea
                name="specialHandlingNotes"
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="Overflow notes, recycling instructions, exceptions..."
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <input type="checkbox" name="requiresPhotoProof" defaultChecked />
              Require proof photos
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <input type="checkbox" name="autoGenerateRoutes" defaultChecked />
              Auto-generate routes
            </label>
          </div>
        </section>

        <div className="mt-8 flex gap-3 border-t pt-8">
          <button
            type="submit"
            className="rounded-2xl bg-slate-950 px-6 py-3 font-semibold text-white"
          >
            Complete Setup
          </button>

          <Link
            href="/admin/properties"
            className="rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
