import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">FetchValet</h1>
            <p className="text-sm text-slate-500">
              On-demand valet trash service
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/property/login"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Property Login
            </Link>
            <Link
              href="/worker/login"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Worker Login
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-8 py-16">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm text-blue-600">
              On-demand valet trash
            </span>

            <h2 className="mt-4 text-5xl font-bold leading-tight text-slate-900">
              Book reliable trash
              <br />
              pickup <span className="text-blue-600">without the hassle</span>
            </h2>

            <p className="mt-6 text-lg text-slate-600">
              FetchValet connects properties with vetted workers to handle
              nightly trash collection—no hiring, no scheduling headaches, and
              no missed pickups.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/property/onboarding"
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Request Service
              </Link>

              <Link
                href="/worker/onboarding"
                className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Become a Worker
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">
                Instant route assignment
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Routes are automatically created and picked up by available
                workers in your area.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">
                Verified service with proof
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Every pickup includes photo proof for full transparency.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">
                Flexible workforce
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                No hiring needed. Workers claim jobs and complete routes on
                demand.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Simple billing</h3>
              <p className="mt-2 text-sm text-slate-600">
                Monthly invoices with built-in tracking and reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-8">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            How FetchValet Works
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <h3 className="text-lg font-semibold">1. Add your property</h3>
              <p className="mt-2 text-sm text-slate-600">
                Enter your units and service schedule.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <h3 className="text-lg font-semibold">2. Jobs get claimed</h3>
              <p className="mt-2 text-sm text-slate-600">
                Workers nearby accept and complete jobs.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <h3 className="text-lg font-semibold">3. Track everything</h3>
              <p className="mt-2 text-sm text-slate-600">
                Monitor service, proof photos, and payments in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-8 md:grid-cols-2">
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
        </div>
      </section>

      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900">
          Ready to simplify your trash operations?
        </h2>

        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/property/onboarding"
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Get Started
          </Link>

          <Link
            href="/worker/onboarding"
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Join as Worker
          </Link>
        </div>
      </section>
    </main>
  );
}