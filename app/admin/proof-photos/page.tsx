import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createClient } from "@/src/lib/supabase/server";

type PendingPhoto = {
  id: string;
  image_url: string | null;
  service_date: string | null;
  caption: string | null;
  created_at: string | null;
  properties: {
    name: string;
  } | null;
};

function normalizeProperty(value: unknown): { name: string } | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    const first = value[0];

    if (
      first &&
      typeof first === "object" &&
      "name" in first &&
      typeof (first as { name?: unknown }).name === "string"
    ) {
      return { name: (first as { name: string }).name };
    }

    return null;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as { name?: unknown }).name === "string"
  ) {
    return { name: (value as { name: string }).name };
  }

  return null;
}

export default async function AdminProofPhotosPage() {
  const supabase = await createClient();

  const { data: photos, error } = await supabase
    .from("proof_photos")
    .select(`
      id,
      image_url,
      service_date,
      caption,
      created_at,
      properties (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const typedPhotos: PendingPhoto[] = (photos ?? []).map((row) => {
    const record = row as Record<string, unknown>;

    return {
      id: String(record.id ?? ""),
      image_url: typeof record.image_url === "string" ? record.image_url : null,
      service_date:
        typeof record.service_date === "string" ? record.service_date : null,
      caption: typeof record.caption === "string" ? record.caption : null,
      created_at:
        typeof record.created_at === "string" ? record.created_at : null,
      properties: normalizeProperty(record.properties),
    };
  });

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            Proof Photos
          </p>
          <h1 className="mt-2 text-4xl font-bold">Proof Photo Gallery</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Review uploaded service proof photos across all properties.
          </p>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                All Proof Photos
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Latest uploaded proof photos.
              </p>
            </div>

            <Link
              href="/admin"
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {typedPhotos.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                No proof photos found.
              </div>
            ) : (
              typedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-2xl border bg-slate-50 p-5"
                >
                  <div className="grid gap-5 lg:grid-cols-[220px,1fr]">
                    <div className="overflow-hidden rounded-2xl bg-slate-200">
                      {photo.image_url ? (
                        <img
                          src={photo.image_url}
                          alt={photo.caption || "Proof photo"}
                          className="h-56 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-56 items-center justify-center text-sm text-slate-500">
                          No image
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xl font-bold text-slate-900">
                        {photo.properties?.name || "Unknown Property"}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        Service Date: {photo.service_date || "Not set"}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Uploaded:{" "}
                        {photo.created_at
                          ? new Date(photo.created_at).toLocaleString()
                          : "Not set"}
                      </p>

                      <p className="mt-3 text-sm text-slate-700">
                        {photo.caption || "No caption provided."}
                      </p>

                      {photo.image_url && (
                        <a
                          href={photo.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Open Full Image
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}