import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "../../../../src/lib/supabase/server";
import { getStripe } from "../../../../src/lib/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();

  const body = await req.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return new Response(
      `Webhook error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 400 }
    );
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    const supabase = await createClient();

    const requirementsDue = [
      ...(account.requirements?.currently_due || []),
      ...(account.requirements?.past_due || []),
    ];

    const { error } = await supabase
      .from("profiles")
      .update({
        stripe_details_submitted: account.details_submitted ?? false,
        stripe_charges_enabled: account.charges_enabled ?? false,
        stripe_payouts_enabled: account.payouts_enabled ?? false,
        stripe_onboarding_complete:
          Boolean(account.details_submitted) && Boolean(account.payouts_enabled),
        stripe_requirements_due: requirementsDue,
        stripe_onboarded_at:
          account.details_submitted || account.payouts_enabled
            ? new Date().toISOString()
            : null,
      })
      .eq("stripe_account_id", account.id);

    if (error) {
      return new Response(error.message, { status: 500 });
    }
  }

  return new Response("ok", { status: 200 });
}