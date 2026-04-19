import { createClient } from "../../../src/lib/supabase/server";
import { uploadProofPhoto } from "./actions/upload-proof-photo";

type PropertyRecord = {
  id: string;
  name: string;
};

export default async function AdminProofPhotosPage() {
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, name")
    .order("name");

  const typedProperties = (properties ?? []) as PropertyRecord[];

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Upload Proof Photo</h1>
          <p className="mt-2 text-slate-600">
            Upload a photo for admin review before it appears in the property portal.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <form action={uploadProofPhoto} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Property
              </label>
              <select
                name="propertyId"
                required
                className="mt-1 w-full rounded-2xl border px-3 py-2"
              >
                <option value="">Select property</option>
                {typedProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Route ID
              </label>
              <input
                name="routeId"
                className="mt-1 w-full rounded-2xl border px-3 py-2"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Service Date
              </label>
              <input
                type="date"
                name="serviceDate"
                className="mt-1 w-full rounded-2xl border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Caption
              </label>
              <input
                name="caption"
                className="mt-1 w-full rounded-2xl border px-3 py-2"
                placeholder="Optional caption"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Photo
              </label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                required
                className="mt-1 w-full rounded-2xl border px-3 py-2"
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Upload Photo
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}