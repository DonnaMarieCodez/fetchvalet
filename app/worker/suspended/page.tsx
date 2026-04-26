export default function WorkerSuspendedPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Account Suspended
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          Your FetchValet worker account is currently suspended. You cannot view
          or claim routes at this time.
        </p>

        <p className="mt-4 text-sm text-slate-500">
          Please contact FetchValet support or an admin for assistance.
        </p>
      </div>
    </main>
  );
}