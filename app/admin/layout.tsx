import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle();

    isAdmin = profile?.role === "admin" && profile?.status === "approved";
  }

  // No admin nav until logged in as approved admin
  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xl font-black text-slate-900">FetchValet Admin</p>
            <p className="text-sm text-slate-500">
              Manage workers, properties, routes, payouts, and complaints
            </p>
          </div>

          <nav className="flex items-center gap-6 text-sm font-semibold text-slate-700">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/workers">Workers</Link>
            <Link href="/admin/routes">Routes</Link>
            <Link href="/admin/properties">Properties</Link>
            <Link href="/admin/complaints">Complaints</Link>
            <Link href="/admin/payouts">Payouts</Link>
            <Link href="/admin/accounting">Accounting</Link>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}