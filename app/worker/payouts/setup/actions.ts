"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/server";
import { getStripe } from "../../../../src/lib/stripe";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function startStripeWorkerOnboarding() {
  const supabase = await createClient();
  const stripe = getStripe();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message || "You must be logged in.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, stripe_account_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message || "Worker profile not found.");
  }

  if (profile.role !== "worker") {
    throw new Error("Only workers can set up payouts.");
  }

  let stripeAccountId = profile.stripe_account_id;

  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      country: "US",
      email: profile.email || user.email || undefined,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        profile_id: profile.id,
        role: "worker",
        worker_name: profile.full_name || "",
      },
    });

    stripeAccountId = account.id;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ stripe_account_id: stripeAccountId })
      .eq("id", profile.id);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  const baseUrl = getBaseUrl();

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${baseUrl}/worker/payouts/setup`,
    return_url: `${baseUrl}/worker/payouts/setup`,
    type: "account_onboarding",
  });

  redirect(accountLink.url);
}