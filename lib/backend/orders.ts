import { z } from "zod";
import { getStoreProducts } from "@/lib/backend/catalog";
import { resolveDeliveryQuote } from "@/lib/backend/delivery";
import { markOrderInventorySold, releaseOrderInventory, reserveOrderInventory } from "@/lib/backend/inventory";
import { queueOrderNotification, recordOrderEvent } from "@/lib/backend/order-lifecycle";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";
import { priceToUsd } from "@/lib/cart";

export const checkoutDraftSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  currency: z.string().default("USD"),
  shippingCountry: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  postalCode: z.string().optional(),
  shippingAddress: z.string().optional(),
  destinationLatitude: z.number().min(-90).max(90).optional(),
  destinationLongitude: z.number().min(-180).max(180).optional(),
  deliveryQuoteId: z.string().uuid().optional(),
  customerProfileId: z.string().uuid().optional(),
  items: z
    .array(
      z.object({
        productSlug: z.string().min(1),
        quantity: z.number().int().positive(),
        size: z.string().min(1),
        unitPriceUsd: z.number().positive()
      })
    )
    .min(1)
});

export type CheckoutDraftInput = z.infer<typeof checkoutDraftSchema>;

type PricedOrderItem = {
  productSlug: string;
  quantity: number;
  size: string;
  unitPriceUsd: number;
  name: string;
  edition: string;
  image: string;
};

export async function createOrder(draft: CheckoutDraftInput) {
  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, reason: "Supabase is not configured yet." };
  }

  const products = await getStoreProducts();
  const pricedItems: PricedOrderItem[] = [];

  for (const item of draft.items) {
    const product = products.find((entry) => entry.slug === item.productSlug);

    if (!product) {
      return { ok: false as const, reason: `Unknown product: ${item.productSlug}` };
    }

    pricedItems.push({
      productSlug: item.productSlug,
      quantity: item.quantity,
      size: item.size,
      unitPriceUsd: priceToUsd(product.price),
      name: product.name,
      edition: product.edition,
      image: product.image
    });
  }

  const subtotalUsd = pricedItems.reduce((total, item) => total + item.unitPriceUsd * item.quantity, 0);
  const deliveryQuote = await resolveDeliveryQuote({
    email: draft.email,
    shippingCountry: draft.shippingCountry ?? "NG",
    shippingCity: draft.shippingCity ?? "Lagos",
    shippingState: draft.shippingState,
    postalCode: draft.postalCode,
    shippingAddress: draft.shippingAddress ?? "Address pending",
    destinationLatitude: draft.destinationLatitude,
    destinationLongitude: draft.destinationLongitude,
    itemCount: pricedItems.reduce((total, item) => total + item.quantity, 0),
    subtotalUsd,
    deliveryQuoteId: draft.deliveryQuoteId
  });
  const shippingUsd = deliveryQuote.shippingUsd;
  const totalUsd = subtotalUsd + shippingUsd;

  const { data: order, error } = await client
    .from("orders")
    .insert({
      email: draft.email,
      customer_profile_id: draft.customerProfileId ?? null,
      full_name: draft.fullName,
      phone: draft.phone ?? null,
      currency: draft.currency,
      shipping_country: draft.shippingCountry ?? null,
      shipping_city: draft.shippingCity ?? null,
      shipping_state: draft.shippingState ?? null,
      shipping_postal_code: draft.postalCode ?? null,
      shipping_address: draft.shippingAddress ?? null,
      delivery_quote_id: deliveryQuote.id ?? null,
      delivery_zone_code: deliveryQuote.zoneCode,
      delivery_method_code: deliveryQuote.methodCode,
      delivery_method_name: deliveryQuote.methodName,
      delivery_distance_km: deliveryQuote.distanceKm,
      carrier_code: deliveryQuote.carrierCode ?? null,
      route_provider: deliveryQuote.routeProvider,
      route_duration_seconds: deliveryQuote.durationSeconds,
      map_url: deliveryQuote.mapUrl,
      shipping_status: "quote_attached",
      status: "pending_payment",
      payment_provider: "stripe",
      payment_status: "unpaid",
      subtotal_usd: subtotalUsd,
      shipping_usd: shippingUsd,
      total_usd: totalUsd
    })
    .select("id")
    .single();

  if (error || !order) {
    return { ok: false as const, reason: error?.message ?? "Unable to create order." };
  }

  const itemRows = pricedItems.map((item) => ({
    order_id: order.id,
    product_slug: item.productSlug,
    quantity: item.quantity,
    size: item.size,
    unit_price_usd: item.unitPriceUsd
  }));

  const { error: itemsError } = await client.from("order_items").insert(itemRows);

  if (itemsError) {
    await client.from("orders").delete().eq("id", order.id);
    return { ok: false as const, reason: itemsError.message };
  }

  const reserved = await reserveOrderInventory(order.id as string);

  if (!reserved.ok) {
    await client.from("orders").delete().eq("id", order.id);
    return { ok: false as const, reason: reserved.reason };
  }

  await recordOrderEvent({
    orderId: order.id as string,
    eventType: "order_created",
    status: "pending_payment",
    paymentStatus: "unpaid",
    shippingStatus: "quote_attached",
    inventoryStatus: "reserved",
    note: "Order created and inventory reserved while payment is pending.",
    source: "system"
  });

  await queueOrderNotification({
    orderId: order.id as string,
    customerProfileId: draft.customerProfileId ?? null,
    template: "checkout_started",
    recipient: draft.email,
    subject: "Your ỌNUỌRA order has been started",
    payload: {
      fullName: draft.fullName,
      subtotalUsd,
      shippingUsd,
      totalUsd,
      items: pricedItems.map((item) => ({
        productSlug: item.productSlug,
        name: item.name,
        size: item.size,
        quantity: item.quantity
      }))
    }
  });

  return {
    ok: true as const,
    orderId: order.id as string,
    items: pricedItems,
    deliveryQuote,
    subtotalUsd,
    shippingUsd,
    totalUsd
  };
}

export async function attachStripeCheckoutSession(orderId: string, checkoutSessionId: string) {
  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, reason: "Supabase is not configured yet." };
  }

  const { error } = await client
    .from("orders")
    .update({
      stripe_checkout_session_id: checkoutSessionId,
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId);

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  return { ok: true as const };
}

export async function releasePendingOrderInventory(orderId: string) {
  const released = await releaseOrderInventory(orderId);

  if (released.ok) {
    await recordOrderEvent({
      orderId,
      eventType: "inventory_released",
      inventoryStatus: "released",
      note: "Reserved inventory was released before payment completion.",
      source: "system",
      visibleToCustomer: false
    });
  }

  return released;
}

export async function markOrderPaid({
  checkoutSessionId,
  paymentIntentId
}: {
  checkoutSessionId: string;
  paymentIntentId?: string | null;
}) {
  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, reason: "Supabase is not configured yet." };
  }

  const { error } = await client
    .from("orders")
    .update({
      status: "paid",
      payment_status: "paid",
      stripe_payment_intent_id: paymentIntentId ?? null,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("stripe_checkout_session_id", checkoutSessionId);

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  const { data: order } = await client
    .from("orders")
    .select("id, email, customer_profile_id, full_name, status, payment_status, shipping_status, inventory_status, total_usd")
    .eq("stripe_checkout_session_id", checkoutSessionId)
    .maybeSingle();

  if (order?.id) {
    await markOrderInventorySold(order.id as string);
    await recordOrderEvent({
      orderId: order.id as string,
      eventType: "payment_confirmed",
      status: "paid",
      paymentStatus: "paid",
      shippingStatus: order.shipping_status ?? "quote_attached",
      inventoryStatus: "sold",
      note: "Payment confirmed. The order is ready for fulfilment.",
      source: "stripe",
      metadata: {
        stripeCheckoutSessionId: checkoutSessionId,
        stripePaymentIntentId: paymentIntentId ?? null
      }
    });
    await queueOrderNotification({
      orderId: order.id as string,
      customerProfileId: order.customer_profile_id as string | null,
      template: "payment_confirmed",
      recipient: order.email as string,
      subject: "Your ỌNUỌRA payment is confirmed",
      payload: {
        fullName: order.full_name,
        totalUsd: Number(order.total_usd)
      }
    });
  }

  return { ok: true as const };
}

export async function markOrderPaymentExpired(checkoutSessionId: string) {
  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, reason: "Supabase is not configured yet." };
  }

  const { error } = await client
    .from("orders")
    .update({
      status: "payment_expired",
      payment_status: "expired",
      updated_at: new Date().toISOString()
    })
    .eq("stripe_checkout_session_id", checkoutSessionId)
    .eq("payment_status", "unpaid");

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  const { data: order } = await client
    .from("orders")
    .select("id, email, customer_profile_id, full_name")
    .eq("stripe_checkout_session_id", checkoutSessionId)
    .maybeSingle();

  if (order?.id) {
    await releaseOrderInventory(order.id as string);
    await recordOrderEvent({
      orderId: order.id as string,
      eventType: "payment_expired",
      status: "payment_expired",
      paymentStatus: "expired",
      inventoryStatus: "released",
      note: "Payment session expired and inventory reservation was released.",
      source: "stripe"
    });
    await queueOrderNotification({
      orderId: order.id as string,
      customerProfileId: order.customer_profile_id as string | null,
      template: "payment_expired",
      recipient: order.email as string,
      subject: "Your ỌNUỌRA checkout expired",
      payload: {
        fullName: order.full_name
      }
    });
  }

  return { ok: true as const };
}
