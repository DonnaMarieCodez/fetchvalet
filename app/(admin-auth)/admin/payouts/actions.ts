"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { getStripe } from "@/src/lib/stripe";

export async function releaseWorkerPayout(formData: FormData) {
  const routeId = String(formData.get("routeId") || "");

  if (!routeId) {
    throw new Error("Route ID is required.");
  }

  const supabase = await createAdminClient();
  const stripe = getStripe();

  const { data: route, error: routeError } = await supabase
    .from("routes")
    .select(`
      id,
      route_date,
      status,
      worker_payout_cents,
      worker_payout_status,
      stripe_transfer_id,
      claimed_by,
      properties (
        name
      ),
      profiles!routes_claimed_by_fkey (
        id,
        full_name,
        stripe_account_id,
        stripe_payouts_enabled
      )
    `)
    .eq("id", routeId)
    .single();

  if (routeError || !route) {
    throw new Error(routeError?.message || "Route not found.");
  }

  if (route.status !== "completed") {
    throw new Error("Only completed routes can be paid.");
  }

  if (route.worker_payout_status === "paid" || route.stripe_transfer_id) {
    throw new Error("This route has already been paid.");
  }

  const payoutCents = Number(route.worker_payout_cents || 0);

  if (payoutCents <= 0) {
    throw new Error("This route does not have a valid payout amount.");
  }

  const worker = Array.isArray(route.profiles)
    ? route.profiles[0]
    : route.profiles;

  const property = Array.isArray(route.properties)
    ? route.properties[0]
    : route.properties;

  if (!worker?.stripe_account_id) {
    throw new Error("Worker does not have a Stripe account connected.");
  }

  if (!worker?.stripe_payouts_enabled) {
    throw new Error("Worker Stripe payouts are not enabled.");
  }

  const transfer = await stripe.transfers.create({
    amount: payoutCents,
    currency: "usd",
    destination: worker.stripe_account_id,
    description: `FetchValet payout for ${property?.name || "route"}`,
    metadata: {
      route_id: route.id,
      worker_id: worker.id,
      property_name: property?.name || "",
      route_date: route.route_date || "",
    },
  });

  const { error: updateError } = await supabase
    .from("routes")
    .update({
      worker_payout_status: "paid",
      worker_payout_released_at: new Date().toISOString(),
      stripe_transfer_id: transfer.id,
    })
    .eq("id", route.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/admin/payouts");
  revalidatePath("/worker/pay");
}