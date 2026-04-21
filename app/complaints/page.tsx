import { createClient } from "../../src/lib/supabase/server";
import { submitComplaint } from "./actions";

export default async function ComplaintsPage() {
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, name, city, state")
    .order("name", { ascending: true });

  const { data: workers } = await supabase
    .from("profiles")
    .select("id, full_name, display_name, role")
    .eq("role", "worker")
    .order("full_name", { ascending: true });

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Resident Complaint Form</h1>
        <p className="mt-2 text-slate-600">
          Use this form to report missed pickups, service issues, or other concerns.
        </p>

        <form action={submitComplaint} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Property
            </label>
            <select
              name="propertyId"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              defaultValue=""
            >
              <option value="">Select a property</option>
              {properties?.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name} ({property.city}, {property.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Worker Involved (optional)
            </label>
            <select
              name="workerId"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              defaultValue=""
            >
              <option value="">Select a worker</option>
              {workers?.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.display_name || worker.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Resident Name
            </label>
            <input
              name="residentName"
              type="text"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                name="residentEmail"
                type="email"
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Phone
              </label>
              <input
                name="residentPhone"
                type="text"
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Building
              </label>
              <input
                name="buildingName"
                type="text"
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Unit
              </label>
              <input
                name="unitNumber"
                type="text"
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Complaint Type
            </label>
            <select
              name="complaintType"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
              defaultValue=""
            >
              <option value="">Select complaint type</option>
              <option value="missed_pickup">Missed Pickup</option>
              <option value="trash_left_behind">Trash Left Behind</option>
              <option value="mess_or_spill">Mess or Spill</option>
              <option value="worker_conduct">Worker Conduct</option>
              <option value="blocked_access">Blocked Access</option>
              <option value="billing_service_issue">Billing or Service Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              required
              rows={5}
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="Describe what happened."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-white"
          >
            Submit Complaint
          </button>
        </form>
      </div>
    </main>
  );
}
