import { createClient } from "../../../../src/lib/supabase/server";
import { approveProofPhoto, rejectProofPhoto } from "../actions/review-proof-photo";

type PendingPhoto = {
  id: string;
  image_url: string;
  service_date: string | null;
  caption: string | null;
  created_at: string;
  properties: { name: string } | null;
};

export default async function ReviewProofPhotosPage() {
  const supabase = await createClient();

  const { data: photos } = await supabase
    .from("proof_photos")
    .select(`
      id,
      image_url,
      service_date,
      caption,
      created_at,
      properties(name)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const typedPhotos = (photos ?? []) as PendingPhoto[];

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Review Proof Photos</h1>
          <p className="mt-2 text-slate-600">
            Approve photos before they appear in the property portal.
          </p>
        </div>

        {typedPhotos.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-slate-600">No pending proof photos.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {typedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200"
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption || "Pending proof photo"}
                  className="h-72 w-full object-cover"
                />

                <div className="space-y-3 p-5">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {photo.properties?.name || "Unknown property"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Service Date: {photo.service_date || "Not set"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Uploaded: {new Date(photo.created_at).toLocaleString()}
                    </p>
                  </div>

                  <p className="text-sm text-slate-700">
                    {photo.caption || "No caption provided."}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <form action={approveProofPhoto}>
                      <input type="hidden" name="photoId" value={photo.id} />
                      <button
                        type="submit"
                        className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                    </form>

                    <form action={rejectProofPhoto} className="flex flex-wrap gap-2">
                      <input type="hidden" name="photoId" value={photo.id} />
                      <input
                        name="rejectionReason"
                        placeholder="Reason optional"
                        className="rounded-2xl border px-3 py-2 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}