import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <div>
            <Link
              href="/admin"
              className="text-xl font-bold text-slate-900"
            >
              FetchValet Admin
            </Link>
            <p className="text-sm text-slate-500">
              Manage workers, properties, routes, payouts, and complaints
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/workers"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Workers
            </Link>
<Link
  href="/admin/routes"
  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
>
  Routes
</Link>
            <Link
              href="/admin/properties"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Properties
            </Link>

            <Link
              href="/admin/complaints"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Complaints
            </Link>

            <Link
              href="/admin/payouts"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Payouts
            </Link>
            <Link
  href="/admin/accounting"
  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
>
  Accounting
</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
    </div>
  );
}
