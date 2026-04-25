import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          
          {/* LEFT SIDE */}
          <div>
            <p className="text-blue-500 text-sm uppercase tracking-widest">
              On-Demand Valet Trash Service
            </p>

            <h1 className="mt-4 text-5xl md:text-6xl font-extrabold leading-tight">
              A better way to <br />
              <span className="text-blue-500">handle valet trash.</span>
            </h1>

            <p className="mt-6 text-lg text-slate-300 max-w-xl">
              No hiring. No scheduling headaches. No missed pickups.  
              FetchValet connects properties with reliable workers—on demand.
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                href="/property/onboarding"
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
              >
                Request Service
              </Link>

              <Link
                href="/signup/worker"
                className="rounded-xl border border-white px-6 py-3 font-semibold hover:bg-white hover:text-black"
              >
                Become a Worker
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE IMAGE */}
          <div className="hidden md:block">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl">
              <div className="h-[400px] w-full rounded-2xl bg-[url('/hero-trash.jpg')] bg-cover bg-center" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-4 gap-8 text-center">
          
          <div>
            <p className="text-blue-500 text-lg">●</p>
            <h3 className="mt-3 font-semibold">Reliable Service</h3>
            <p className="text-sm text-slate-400 mt-2">
              You can count on every pickup.
            </p>
          </div>

          <div>
            <p className="text-blue-500 text-lg">●</p>
            <h3 className="mt-3 font-semibold">On-Demand</h3>
            <p className="text-sm text-slate-400 mt-2">
              Service when you need it.
            </p>
          </div>

          <div>
            <p className="text-blue-500 text-lg">●</p>
            <h3 className="mt-3 font-semibold">Verified Pickups</h3>
            <p className="text-sm text-slate-400 mt-2">
              Proof photos every time.
            </p>
          </div>

          <div>
            <p className="text-blue-500 text-lg">●</p>
            <h3 className="mt-3 font-semibold">Better Communities</h3>
            <p className="text-sm text-slate-400 mt-2">
              Cleaner properties daily.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold">How FetchValet Works</h2>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            
            <div className="rounded-2xl bg-slate-900 p-6">
              <h3 className="font-semibold">1. Add your property</h3>
              <p className="text-sm text-slate-400 mt-2">
                Set units and service days.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6">
              <h3 className="font-semibold">2. Routes get claimed</h3>
              <p className="text-sm text-slate-400 mt-2">
                Workers pick up jobs instantly.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6">
              <h3 className="font-semibold">3. Track everything</h3>
              <p className="text-sm text-slate-400 mt-2">
                Monitor service and payments.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA SPLIT */}
      <section className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-2 gap-8 items-center text-white">
          
          <div>
            <h3 className="text-2xl font-bold">For Properties</h3>
            <p className="mt-2 text-blue-100">
              Simplify operations. No staffing headaches.
            </p>

            <Link
              href="/property/onboarding"
              className="inline-block mt-4 rounded-xl bg-white text-blue-600 px-5 py-3 font-semibold"
            >
              Get Started
            </Link>
          </div>

          <div>
            <h3 className="text-2xl font-bold">For Workers</h3>
            <p className="mt-2 text-blue-100">
              Flexible work. Get paid fast.
            </p>

            <Link
              href="/signup/worker"
              className="inline-block mt-4 rounded-xl border border-white px-5 py-3 font-semibold"
            >
              Join Now
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}