import { NextResponse } from "next/server";
import { checkoutDraftSchema, attachStripeCheckoutSession, createOrder, releasePendingOrderInventory } from "@/lib/backend/orders";
import { getSiteUrl, hasStripeConfig, hasSupabaseConfig } from "@/lib/backend/env";
import { ensureCustomerProfile, getAuthenticatedAccountUser } from "@/lib/backend/account";
import { getStoreProductBySlug } from "@/lib/backend/catalog";
import { markOrderInventorySold } from "@/lib/backend/inventory";
import { recordOrderEvent } from "@/lib/backend/order-lifecycle";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";
import {
  PRODUCT_PRICES,
  getCollectionByFamily,
  promotionDiscountForQuantity,
  type CurrencyCode
} from "@/data/site-config";
import { resolveShippingRule } from "@/lib/commerce/shipping-rules";
import { createStripeClient } from "@/lib/stripe";

const TEST_VOUCHER_CODE = "ONUORA-TEST-100";
const stripeCurrencies = {
  USD: "usd",
  GBP: "gbp",
  EUR: "eur",
  NGN: "ngn"
} as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const voucherCode = typeof body?.voucherCode === "string" ? body.voucherCode.trim().toUpperCase() : "";
  const parsed = checkoutDraftSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: "Supabase is not configured yet." }, { status: 503 });
  }

  const itemCount = parsed.data.items.reduce((total, item) => total + item.quantity, 0);
  const currency = parsed.data.currency as CurrencyCode;
  const shippingRule = resolveShippingRule({
    shippingCountry: parsed.data.shippingCountry,
    itemCount,
    currency
  });

  if (shippingRule.requiresManualQuote || itemCount >= 7) {
    return NextResponse.json(
      { error: "Please contact Client Care for a delivery quotation on orders of seven outfits or more." },
      { status: 409 }
    );
  }

  if (shippingRule.displayCurrency !== currency) {
    return NextResponse.json(
      { error: "Delivery within Nigeria is charged in NGN. Select NGN before continuing." },
      { status: 409 }
    );
  }

  const auth = await getAuthenticatedAccountUser();
  const profile = auth.ok ? await ensureCustomerProfile(auth.user) : null;
  const order = await createOrder({
    ...parsed.data,
    currency,
    customerProfileId: profile?.ok ? profile.profile.id : undefined
  });

  if (!order.ok) {
    return NextResponse.json({ error: order.reason }, { status: 500 });
  }

  const siteUrl = getSiteUrl().replace(/\/$/, "");

  if (voucherCode === TEST_VOUCHER_CODE) {
    const inventory = await markOrderInventorySold(order.orderId);
    const client = createSupabaseServiceClient();

    if (!inventory.ok || !client) {
      await releasePendingOrderInventory(order.orderId);
      return NextResponse.json({ error: inventory.ok ? "Supabase is not configured yet." : inventory.reason }, { status: 500 });
    }

    const now = new Date().toISOString();
    const { error: updateError } = await client
      .from("orders")
      .update({
        status: "paid",
        payment_status: "paid",
        payment_provider: "testing_voucher",
        total_usd: 0,
        paid_at: now,
        updated_at: now
      })
      .eq("id", order.orderId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await recordOrderEvent({
      orderId: order.orderId,
      eventType: "testing_voucher_applied",
      status: "paid",
      paymentStatus: "paid",
      inventoryStatus: "sold",
      note: "A 100% testing voucher completed this order with no payment required.",
      source: "system",
      metadata: {
        voucherCode: TEST_VOUCHER_CODE,
        discountUsd: order.totalUsd
      }
    });

    return NextResponse.json({
      ok: true,
      orderId: order.orderId,
      voucherApplied: true,
      successUrl: `${siteUrl}/checkout/success?order_id=${order.orderId}&voucher=1`
    });
  }

  if (!hasStripeConfig()) {
    await releasePendingOrderInventory(order.orderId);
    return NextResponse.json({ error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY." }, { status: 503 });
  }

  const stripe = createStripeClient();
  const stripeCurrency = stripeCurrencies[currency];
  const lineItems: Array<{
    quantity: number;
    price_data: {
      currency: typeof stripeCurrency;
      unit_amount: number;
      product_data: { name: string; description: string };
    };
  }> = await Promise.all(order.items.map(async (item) => {
    const product = await getStoreProductBySlug(item.productSlug);
    const collection = product ? getCollectionByFamily(product.family) : null;
    const collectionName = collection?.englishName ?? "ỌNUỌRA Collection";

    return {
      quantity: item.quantity,
      price_data: {
        currency: stripeCurrency,
        unit_amount: PRODUCT_PRICES[currency] * 100,
        product_data: {
          name: collectionName,
          description: `Product: Complete Two-Piece Set · Colour: ${item.colorName} · Size: ${item.size}`
        }
      }
    };
  }));

  if ((shippingRule.displayAmount ?? 0) > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: stripeCurrency,
        unit_amount: (shippingRule.displayAmount ?? 0) * 100,
        product_data: {
          name: shippingRule.methodName,
          description: shippingRule.label
        }
      }
    });
  }

  const wardrobeDiscount = promotionDiscountForQuantity(itemCount, currency);
  let discountCouponId: string | undefined;

  if (wardrobeDiscount > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: wardrobeDiscount * 100,
      currency: stripeCurrency,
      duration: "once",
      name: "ỌNUỌRA Wardrobe Offer"
    });
    discountCouponId = coupon.id;
  }

  let session;

  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: parsed.data.email,
      client_reference_id: order.orderId,
      billing_address_collection: "auto",
      metadata: {
        order_id: order.orderId,
        source: "onuoramenswear",
        outfit_count: String(itemCount),
        shipping_band: shippingRule.label
      },
      payment_intent_data: {
        metadata: {
          order_id: order.orderId,
          source: "onuoramenswear"
        }
      },
      line_items: lineItems,
      ...(discountCouponId ? { discounts: [{ coupon: discountCouponId }] } : {}),
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel?order_id=${order.orderId}`
    }, {
      idempotencyKey: `checkout-session-${order.orderId}`
    });
  } catch {
    await releasePendingOrderInventory(order.orderId);
    return NextResponse.json({ error: "Unable to start secure payment right now." }, { status: 502 });
  }

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
