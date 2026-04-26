import { createProperty } from "../actions/create-property";

export default function NewPropertyPage() {
  return (
    <>
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
          Property Onboarding
        </p>
        <h1 className="mt-2 text-4xl font-bold">Add New Property</h1>
        <p className="mt-3 max-w-2xl text-slate-200">
          Create a property profile with contacts, operations defaults, and service details.
        </p>
      </div>

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <form action={createProperty} className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900">Property Basics</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Property Name
                </label>
                <input
                  name="name"
                  required
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="Harbor Point Apartments"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Property Manager Name
                </label>
                <input
                  name="propertyManagerName"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="Jordan Smith"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">Address</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Address Line 1
                </label>
                <input
                  name="addressLine1"
                  required
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Address Line 2
                </label>
                <input
                  name="addressLine2"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="Suite, gate, or landmark"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  City
                </label>
                <input
                  name="city"
                  required
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  State
                </label>
                <input
                  name="state"
                  required
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="VA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  ZIP Code
                </label>
                <input
                  name="zipCode"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">Primary Contacts</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Contact Phone
                </label>
                <input
                  name="contactPhone"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="(555) 555-5555"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Contact Email
                </label>
                <input
                  name="contactEmail"
                  type="email"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="manager@property.com"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Alternate Onsite Contact Name
                </label>
                <input
                  name="alternateContactName"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="Assistant Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Alternate Onsite Contact Phone
                </label>
                <input
                  name="alternateContactPhone"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="(555) 222-2222"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Billing Contact Name
                </label>
                <input
                  name="billingContactName"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="Accounts Payable"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Billing Contact Email
                </label>
                <input
                  name="billingContactEmail"
                  type="email"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="billing@property.com"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">Operations</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Service Days
                </label>
                <input
                  name="serviceDays"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="Sunday, Tuesday, Thursday"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Pickup Start Time
                </label>
                <input
                  name="pickupStartTime"
                  type="time"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Default Route Payout ($)
                </label>
                <input
                  name="defaultRoutePayoutDollars"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue="0"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="95.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Default Minimum Worker Score
                </label>
                <input
                  name="defaultMinimumWorkerScore"
                  type="number"
                  step="1"
                  min="0"
                  defaultValue="0"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="80"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700">
                Access Notes
              </label>
              <textarea
                name="accessNotes"
                rows={4}
                className="mt-1 w-full rounded-2xl border px-3 py-2"
                placeholder="Gate code, dumpster access notes, service restrictions, quiet hours, etc."
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700">
                Special Handling Notes
              </label>
              <textarea
                name="specialHandlingNotes"
                rows={4}
                className="mt-1 w-full rounded-2xl border px-3 py-2"
                placeholder="Overflow protocol, fragile areas, special customer requests, holiday rules, etc."
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">Automation Settings</h2>
            <div className="mt-5 grid gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <input
                  id="requiresPhotoProof"
                  name="requiresPhotoProof"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4"
                />
                <label
                  htmlFor="requiresPhotoProof"
                  className="text-sm font-medium text-slate-700"
                >
                  Require building photo proof for this property
                </label>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <input
                  id="residentRemindersEnabled"
                  name="residentRemindersEnabled"
                  type="checkbox"
                  className="h-4 w-4"
                />
                <label
                  htmlFor="residentRemindersEnabled"
                  className="text-sm font-medium text-slate-700"
                >
                  Enable resident reminders for trash-out days
                </label>
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Create Property
          </button>
        </form>
      </div>
    </>
  );
}
