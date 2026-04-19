import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../src/lib/supabase/server";
import { getPropertyProfile } from "../../../src/lib/auth/get-property-profile";

type ProofPhotoRecord = {
  id: string;
  property_id: string;
  route_id: string | null;
  image_url: string;
  service_date: string | null;
  created_at: string;
  archived: boolean | null;
  caption: string | null;
};

function formatServiceDate(value: string | null) {
  if (!value) return "Unknown service date";
  return value;
}

function groupPhotosByDate(photos: ProofPhotoRecord[]) {
  return photos.reduce<Record<string, ProofPhotoRecord[]>>((acc, photo) => {
    const key = photo.service_date || "Unknown service date";
    if (!acc[key]) acc[key] = [];
    acc[key].push(photo);
    return acc;
  }, {});
}

export default async function PropertyProofPage() {
  const { user, profile } = await getPropertyProfile();

  if (!user) {
    redirect("/property/login");
  }

  if (!profile || profile.role !== "property" || !profile.property_id) {
    redirect("/property/login");
  }

  const supabase = await createClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, name")
    .eq("id", profile.property_id)
    .single();

  if (propertyError || !property) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Proof Photos</h1>
          <p className="mt-2 text-slate-600">
            Property information could not be loaded.
          </p>
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

  const { data: photos, error: photosError } = await supabase
    .from("proof_photos")
    .select("id, property_id, route_id, image_url, service_date, created_at, archived, caption")
    .eq("property_id", profile.property_id)
    .eq("archived", false)
.eq("status", "approved")
    .order("service_date", { ascending: false })
    .order("created_at", { ascending: false });

  const typedPhotos = (photos ?? []) as ProofPhotoRecord[];
  const grouped = groupPhotosByDate(typedPhotos);
  const groupedEntries = Object.entries(grouped);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Property Portal
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Proof Photos
            </h1>
            <p className="mt-2 text-slate-600">{property.name}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              {typedPhotos.length} recent photo{typedPhotos.length === 1 ? "" : "s"}
            </div>

            <Link
              href="/property"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </Link>
          </div>
        </div>

        {photosError ? (
          <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Unable to load photos</h2>
            <p className="mt-2 text-slate-600">
              There was a problem loading proof photos for this property.
            </p>
          </section>
        ) : typedPhotos.length === 0 ? (
          <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-slate-900">No proof photos yet</h2>
            <p className="mt-2 text-slate-600">
              Proof photos will appear here after service is completed and photos are uploaded.
            </p>
          </section>
        ) : (
          groupedEntries.map(([serviceDate, items]) => (
            <section
              key={serviceDate}
              className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Service Date: {formatServiceDate(serviceDate)}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {items.length} photo{items.length === 1 ? "" : "s"} uploaded
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((photo) => (
                  <article
                    key={photo.id}
                    className="overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200"
                  >
                    <a
                      href={photo.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <img
                        src={photo.image_url}
                        alt={photo.caption || "Proof photo"}
                        className="h-64 w-full object-cover"
                      />
                    </a>

                    <div className="space-y-2 p-4">
                      <p className="text-sm font-medium text-slate-900">
                        {photo.caption || "Service proof photo"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Uploaded: {new Date(photo.created_at).toLocaleString()}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}