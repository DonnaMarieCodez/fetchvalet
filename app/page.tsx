import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-widest text-blue-500">
              On-Demand Valet Trash Service
            </p>

            <h1 className="mt-4 text-5xl font-extrabold leading-tight md:text-6xl">
              A better way to <br />
              <span className="text-blue-500">handle valet trash.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-300">
              No hiring. No scheduling headaches. No missed pickups. FetchValet
              connects properties with reliable workers—on demand.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
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

              <Link
                href="/property/login"
                className="rounded-xl border border-blue-500 px-6 py-3 font-semibold text-blue-400 hover:bg-blue-500 hover:text-white"
              >
                Property Login
              </Link>

              <Link
                href="/worker/login"
                className="rounded-xl border border-blue-500 px-6 py-3 font-semibold text-blue-400 hover:bg-blue-500 hover:text-white"
              >
                Worker Login
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl">
              <div className="h-[400px] w-full rounded-2xl bg-[url('/hero-trash.jpg')] bg-cover bg-center" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 text-center md:grid-cols-4">
          <Feature title="Reliable Service" text="You can count on every pickup." />
          <Feature title="On-Demand" text="Service when you need it." />
          <Feature title="Verified Pickups" text="Proof photos every time." />
          <Feature title="Better Communities" text="Cleaner properties daily." />
        </div>
      </section>

      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold">How FetchValet Works</h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Step title="1. Add your property" text="Set units and service days." />
            <Step title="2. Routes get claimed" text="Workers pick up jobs instantly." />
            <Step title="3. Track everything" text="Monitor service and payments." />
          </div>
        </div>
      </section>

      <section className="bg-blue-600">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-16 text-white md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold">For Properties</h3>
            <p className="mt-2 text-blue-100">
              Simplify operations. No staffing headaches.
            </p>

            <Link
              href="/property/onboarding"
              className="mt-4 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-blue-600"
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
              className="mt-4 inline-block rounded-xl border border-white px-5 py-3 font-semibold"
            >
              Join Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-lg text-blue-500">●</p>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{text}</p>
    </div>
  );
}

function Step({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-6">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{text}</p>
    </div>
  );
}