import { createClient } from "../../../src/lib/supabase/server";

export default async function AdminWorkersPage() {
  try {
    const supabase = await createClient();

    // 🔐 Check auth safely
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return (
        <main className="p-8">
          <h1 className="text-2xl font-bold">Not logged in</h1>
        </main>
      );
    }

    // 🔥 SIMPLE QUERY (no risky fields)
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(10);

    if (error) {
      console.error("Supabase error:", error);

      return (
        <main className="p-8 text-red-500">
          Database error: {error.message}
        </main>
      );
    }

    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-6">Workers</h1>

        <pre className="bg-black text-green-400 p-4 rounded-xl text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </main>
    );
  } catch (err: any) {
    console.error("Page crash:", err);

    return (
      <main className="p-8 text-red-500">
        Page crashed: {err?.message || "Unknown error"}
      </main>
    );
  }
}