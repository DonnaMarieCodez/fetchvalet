import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { completeWorkerOnboarding } from "./actions";

export default async function WorkerOnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/worker/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/worker/login");
  }

  if (profile.status !== "onboarding") {
    redirect("/worker/status");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
          Worker Onboarding
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-900">
          Complete Your Worker Profile
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Add your address, emergency contact, and background check consent.
          Stripe payout setup will be connected next.
        </p>

        <form action={completeWorkerOnboarding} className="mt-8 space-y-5">
          <Input
            name="phone"
            label="Phone Number"
            defaultValue={profile.phone}
            required
          />

          <Input name="addressLine1" label="Address Line 1" required />
          <Input name="addressLine2" label="Address Line 2" />
          <Input name="city" label="City" required />
          <Input name="state" label="State" required />
          <Input name="zipCode" label="ZIP Code" required />

          <Input
            name="emergencyContactName"
            label="Emergency Contact Name"
          />

          <Input
            name="emergencyContactPhone"
            label="Emergency Contact Phone"
          />

          <label className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <input
              type="checkbox"
              name="backgroundCheckConsent"
              required
            />
            I consent to a background check before accepting FetchValet routes.
          </label>

          <button className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white">
            Complete Onboarding
          </button>
        </form>
      </section>
    </main>
  );
}

function Input({
  name,
  label,
  defaultValue,
  required = false,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>

      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
      />
    </div>
  );
}