import { NextResponse } from "next/server";
import { checkoutDraftSchema, attachStripeCheckoutSession, createOrder, releasePendingOrderInventory } from "@/lib/backend/orders";
import { getSiteUrl, hasStripeConfig, hasSupabaseConfig } from "@/lib/backend/env";
import { ensureCustomerProfile, getAuthenticatedAccountUser } from "@/lib/backend/account";
import { createStripeClient } from "@/lib/stripe";

const allowedShippingCountries = [
  "US",
  "CA",
  "GB",
  "NG",
  "GH",
  "ZA",
  "KE",
  "AE",
  "AU",
  "DE",
  "FR",
  "IT",
  "ES",
  "NL",
  "IE"
] as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutDraftSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: "Supabase is not configured yet." }, { status: 503 });
  }

  if (!hasStripeConfig()) {
    return NextResponse.json({ error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY." }, { status: 503 });
  }

  const auth = await getAuthenticatedAccountUser();
  const profile = auth.ok ? await ensureCustomerProfile(auth.user) : null;
  const order = await createOrder({
    ...parsed.data,
    currency: "USD",
    customerProfileId: profile?.ok ? profile.profile.id : undefined
  });

  if (!order.ok) {
    return NextResponse.json({ error: order.reason }, { status: 500 });
  }

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const stripe = createStripeClient();
  const lineItems = order.items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "usd",
      unit_amount: Math.round(item.unitPriceUsd * 100),
      product_data: {
        name: `${item.name} - Size ${item.size}`,
        description: item.edition
      }
    }
  }));

  if (order.shippingUsd > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(order.shippingUsd * 100),
        product_data: {
          name: order.deliveryQuote.methodName,
          description: `${order.deliveryQuote.estimatedMinDays}-${order.deliveryQuote.estimatedMaxDays} business days`
        }
      }
    });
  }

  const session = await stripe.checkout.sessions
    .create({
      mode: "payment",
      customer_email: parsed.data.email,
      client_reference_id: order.orderId,
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: [...allowedShippingCountries]
      },
      metadata: {
        order_id: order.orderId,
        source: "onuoramenswear"
      },
      line_items: lineItems,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel?order_id=${order.orderId}`
    })
    .catch(async (error: Error) => {
      await releasePendingOrderInventory(order.orderId);
      throw error;
    });

  if (!session.url) {
    await releasePendingOrderInventory(order.orderId);
    return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 500 });
  }

  const attached = await attachStripeCheckoutSession(order.orderId, session.id);

  if (!attached.ok) {
    await releasePendingOrderInventory(order.orderId);
    return NextResponse.json({ error: attached.reason }, { status: 500 });
  }

  return NextResponse.json({ ok: true, orderId: order.orderId, checkoutUrl: session.url });
}
