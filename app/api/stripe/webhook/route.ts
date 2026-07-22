import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeWebhookSecret } from "@/lib/backend/env";
import { markOrderPaid, markOrderPaymentExpired, markOrderPaymentFailed } from "@/lib/backend/orders";
import { createStripeClient } from "@/lib/stripe";

function getPaymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
}

export async function POST(request: Request) {
  const webhookSecret = getStripeWebhookSecret();

  if (!webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook secret is not configured." }, { status: 503 });
  }

  const stripe = createStripeClient();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook payload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  let result: { ok: true } | { ok: false; reason: string } = { ok: true };

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === "paid") {
      result = await markOrderPaid({
        checkoutSessionId: session.id,
        paymentIntentId: getPaymentIntentId(session)
      });
    }
  }

  if (event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    result = await markOrderPaid({
      checkoutSessionId: session.id,
      paymentIntentId: getPaymentIntentId(session)
    });
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    result = await markOrderPaymentFailed(session.id);
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    result = await markOrderPaymentExpired(session.id);
  }

  if (!result.ok) {
    return NextResponse.json({ error: "Unable to process Stripe event." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
