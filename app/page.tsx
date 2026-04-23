import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* NAVBAR */}
      <header className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">FetchValet</h1>
          <p className="text-sm text-slate-500">
            On-demand valet trash service
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="rounded-xl border px-4 py-2 text-sm"
          >
            Admin
          </Link>
          <Link
            href="/property/onboarding"
            className="rounded-xl border px-4 py-2 text-sm"
          >
            Property Login
          </Link>
          <Link
            href="/worker/login"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
          >
            Worker Login
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-8 py-16">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm text-blue-600">
              On-demand valet trash
            </span>

            <h2 className="mt-4 text-5xl font-bold leading-tight text-slate-900">
              Book reliable trash pickup{" "}
              <span className="text-blue-600">without the hassle</span>
            </h2>

            <p className="mt-6 text-lg text-slate-600">
              FetchValet connects properties with vetted workers to handle
              nightly trash collection—no hiring, no scheduling headaches, no
              missed pickups.
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                href="/property"
                className="rounded-xl bg-slate-900 px-6 py-3 text-white"
              >
                Request Service
              </Link>

              <Link
                href="/signup/worker"
                className="rounded-xl border px-6 py-3"
              >
                Become a Worker
              </Link>
            </div>
          </div>

          {/* FEATURE CARDS */}
          <div className="grid gap-4">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">
                Instant route assignment
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Routes are automatically created and picked up by available
                workers in your area.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">
                Verified service with proof
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Every pickup includes photo proof for full transparency.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">
                Flexible workforce
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                No hiring needed. Workers claim jobs and complete routes on
                demand.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">
                Simple billing
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Monthly invoices with built-in tracking and reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900">
            How FetchValet Works
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border p-6 text-center">
              <h3 className="font-semibold text-lg">1. Add your property</h3>
              <p className="text-sm text-slate-600 mt-2">
                Enter your units and service schedule.
              </p>
            </div>

            <div className="rounded-2xl border p-6 text-center">
              <h3 className="font-semibold text-lg">2. Routes get claimed</h3>
              <p className="text-sm text-slate-600 mt-2">
                Workers nearby accept and complete jobs.
              </p>
            </div>

            <div className="rounded-2xl border p-6 text-center">
              <h3 className="font-semibold text-lg">3. Track everything</h3>
              <p className="text-sm text-slate-600 mt-2">
                Monitor service, proof photos, and payments in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AUDIENCE SECTIONS */}
      <section className="bg-slate-900 text-white py-16">
        <div className="mx-auto max-w-6xl px-8 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">For Properties</h3>
            <p className="mt-2 text-sm text-slate-300">
              Stay on top of service without managing staff.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">For Workers</h3>
            <p className="mt-2 text-sm text-slate-300">
              Claim jobs, complete routes, and get paid fast.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">For Admins</h3>
            <p className="mt-2 text-sm text-slate-300">
              Run operations, approvals, payouts, and performance tracking.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900">
          Ready to simplify your trash operations?
        </h2>

        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/property"
            className="rounded-xl bg-slate-900 px-6 py-3 text-white"
          >
            Get Started
          </Link>

          <Link
            href="/signup/worker"
            className="rounded-xl border px-6 py-3"
          >
            Join as Worker
          </Link>
        </div>
      </section>
    </main>
  );
}