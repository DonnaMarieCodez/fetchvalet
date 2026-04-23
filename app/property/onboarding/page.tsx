import Link from "next/link";
import { submitPropertyOnboarding } from "./actions";

const weekDays = [
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
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            FetchValet
          </p>
          <h1 className="mt-2 text-4xl font-bold">Property Onboarding</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Set up your property, choose service days, and get ready for
            on-demand valet trash coverage.
          </p>
        </div>

        <form
          action={submitPropertyOnboarding}
          className="space-y-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
        >
          <section className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Property Details
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Tell us where service will happen.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Property Name
                </label>
                <input
                  name="propertyName"
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="Bayview Residences"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Address Line 1
                </label>
                <input
                  name="addressLine1"
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  City
                </label>
                <input
                  name="city"
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="Norfolk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  State
                </label>
                <input
                  name="state"
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="VA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  ZIP Code
                </label>
                <input
                  name="zip"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="23510"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Pickup Time
                </label>
                <input
                  name="pickupTime"
                  type="time"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                />
              </div>
            </div>
          </section>

          <section className="space-y-5 border-t border-slate-200 pt-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Primary Contact
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                This is the property account owner or manager.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Manager Name
                </label>
                <input
                  name="managerName"
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="Jane Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Manager Email
                </label>
                <input
                  name="managerEmail"
                  type="email"
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="manager@property.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Manager Phone
                </label>
                <input
                  name="managerPhone"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="(555) 555-5555"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Billing Contact
                </label>
                <input
                  name="billingContact"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="AP Department or Manager"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Alternate Contact
                </label>
                <input
                  name="alternateContact"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="Backup onsite contact"
                />
              </div>
            </div>
          </section>

          <section className="space-y-5 border-t border-slate-200 pt-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Service Setup
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Choose how often service is needed and how the property should be handled.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Number of Units
                </label>
                <input
                  name="units"
                  type="number"
                  min="1"
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Number of Buildings
                </label>
                <input
                  name="buildings"
                  type="number"
                  min="1"
                  defaultValue={1}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Monthly Billing ($)
                </label>
                <input
                  name="monthlyBillingDollars"
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="2950.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Default Route Payout ($)
                </label>
                <input
                  name="routePayoutDollars"
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="95.00"
                />
              </div>
            </div>

            <div>
              <p className="block text-sm font-medium text-slate-700">
                Service Days
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {weekDays.map((day) => (
                  <label
                    key={day}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  >
                    <input type="checkbox" name="serviceDays" value={day} />
                    {day}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Access Notes
                </label>
                <textarea
                  name="accessNotes"
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="Gate code, dumpster location, building access info..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Special Handling
                </label>
                <textarea
                  name="specialHandling"
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="Overflow notes, recycling instructions, exceptions..."
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" name="requiresPhotoProof" defaultChecked />
                Require proof photos
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" name="autoGenerateRoutes" defaultChecked />
                Auto-generate routes
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" name="recyclingEnabled" />
                Recycling service
              </label>
            </div>

            <div className="max-w-sm">
              <label className="block text-sm font-medium text-slate-700">
                Recycling Day
              </label>
              <select
                name="recyclingDay"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                defaultValue=""
              >
                <option value="">Select recycling day</option>
                {weekDays.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-8">
            <button
              type="submit"
              className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Complete Setup
            </button>

            <Link
              href="/"
              className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}