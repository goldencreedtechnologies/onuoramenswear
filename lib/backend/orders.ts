import { z } from "zod";
import { getStoreProducts } from "@/lib/backend/catalog";
import { resolveDeliveryQuote } from "@/lib/backend/delivery";
import { markOrderInventorySold, releaseOrderInventory, reserveOrderInventory } from "@/lib/backend/inventory";
import { queueOrderNotification, recordOrderEvent } from "@/lib/backend/order-lifecycle";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";
import { getAbandonedCheckoutDelayMinutes, getOrderNotificationEmail, getSiteUrl } from "@/lib/backend/env";
import { priceToUsd } from "@/lib/cart";
import { getCollectionByFamily, getOrderItemCollectionLabel, isAdditionalProductColour, isCurrencyCode, operationalUsdAmountInCurrency, promotionDiscountForQuantity } from "@/data/site-config";

export const checkoutDraftSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  currency: z.enum(["NGN", "GBP", "USD", "EUR"]).default("USD"),
  shippingCountry: z.string().trim().min(2),
  shippingCity: z.string().trim().min(2),
  shippingState: z.string().optional(),
  postalCode: z.string().optional(),
  shippingAddress: z.string().trim().min(4),
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
        colorName: z.string().trim().min(2).max(80).optional(),
        colorValue: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
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
  colorName: string;
  colorValue: string;
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

    const colorName = item.colorName ?? product.colorName;
    const colorValue = item.colorValue ?? product.colorValue;
    const isProductColour =
      colorName.toLowerCase() === product.colorName.toLowerCase() &&
      colorValue.toLowerCase() === product.colorValue.toLowerCase();

    if (!isProductColour && !isAdditionalProductColour(colorName, colorValue)) {
      return { ok: false as const, reason: `Unknown colour selection: ${colorName}` };
    }

    pricedItems.push({
      productSlug: item.productSlug,
      quantity: item.quantity,
      size: item.size,
      colorName,
      colorValue,
      unitPriceUsd: priceToUsd(product.price),
      name: getCollectionByFamily(product.family).englishName,
      edition: product.edition,
      image: product.image
    });
  }

  const itemCount = pricedItems.reduce((total, item) => total + item.quantity, 0);
  const subtotalUsd = pricedItems.reduce((total, item) => total + item.unitPriceUsd * item.quantity, 0);
  const deliveryQuote = await resolveDeliveryQuote({
    email: draft.email,
    shippingCountry: draft.shippingCountry,
    shippingCity: draft.shippingCity,
    shippingState: draft.shippingState,
    postalCode: draft.postalCode,
    shippingAddress: draft.shippingAddress,
    destinationLatitude: draft.destinationLatitude,
    destinationLongitude: draft.destinationLongitude,
    itemCount,
    subtotalUsd,
    deliveryQuoteId: draft.deliveryQuoteId
  });
  const shippingUsd = deliveryQuote.shippingUsd;
  const discountUsd = promotionDiscountForQuantity(itemCount, "USD");
  const totalUsd = Math.max(0, subtotalUsd + shippingUsd - discountUsd);

  const { data: order, error } = await client
    .from("orders")
    .insert({
      email: draft.email,
      customer_profile_id: draft.customerProfileId ?? null,
      full_name: draft.fullName,
      phone: draft.phone ?? null,
      currency: draft.currency,
      shipping_country: draft.shippingCountry,
      shipping_city: draft.shippingCity,
      shipping_state: draft.shippingState ?? null,
      shipping_postal_code: draft.postalCode ?? null,
      shipping_address: draft.shippingAddress,
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
    .select("id, order_number, created_at, tracking_id")
    .single();

  if (error || !order) {
    return { ok: false as const, reason: error?.message ?? "Unable to create order." };
  }

  const itemRows = pricedItems.map((item) => ({
    order_id: order.id,
    product_slug: item.productSlug,
    quantity: item.quantity,
    size: item.size,
    unit_price_usd: item.unitPriceUsd,
    product_name: item.name,
    product_edition: null,
    color_name: item.colorName,
    color_value: item.colorValue
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
    source: "system",
    metadata: {
      selectedColours: pricedItems.map((item) => ({
        productSlug: item.productSlug,
        size: item.size,
        colorName: item.colorName,
        colorValue: item.colorValue,
        quantity: item.quantity
      }))
    }
  });

  await queueOrderNotification({
    orderId: order.id as string,
    customerProfileId: draft.customerProfileId ?? null,
    template: "checkout_started",
    recipient: draft.email,
    subject: "Your ỌNUỌRA order has been started",
    payload: {
      fullName: draft.fullName,
      currency: draft.currency,
      subtotalUsd,
      shippingUsd,
      totalUsd,
      subtotal: operationalUsdAmountInCurrency(subtotalUsd, isCurrencyCode(draft.currency) ? draft.currency : "USD"),
      shipping: operationalUsdAmountInCurrency(shippingUsd, isCurrencyCode(draft.currency) ? draft.currency : "USD"),
      total: operationalUsdAmountInCurrency(totalUsd, isCurrencyCode(draft.currency) ? draft.currency : "USD"),
      items: pricedItems.map((item) => ({
        productSlug: item.productSlug,
        name: item.name,
        size: item.size,
        colorName: item.colorName,
        colorValue: item.colorValue,
        quantity: item.quantity
      }))
    }
  });

  await queueOrderNotification({
    orderId: order.id as string,
    customerProfileId: draft.customerProfileId ?? null,
    template: "abandoned_checkout",
    recipient: draft.email,
    subject: "Can we help you complete your ỌNUỌRA order?",
    scheduledAt: new Date(Date.now() + getAbandonedCheckoutDelayMinutes() * 60_000).toISOString(),
    payload: {
      fullName: draft.fullName,
      resumeUrl: `${getSiteUrl().replace(/\/$/, "")}/cart`
    }
  });

  const orderNotificationEmail = getOrderNotificationEmail();

  if (orderNotificationEmail) {
    await queueOrderNotification({
      orderId: order.id as string,
      customerProfileId: draft.customerProfileId ?? null,
      template: "checkout_started_admin",
      recipient: orderNotificationEmail,
      subject: `Checkout started · ${order.order_number}`,
      payload: {
        orderReference: order.order_number,
        fullName: draft.fullName,
        customerEmail: draft.email,
        currency: draft.currency,
        subtotal: operationalUsdAmountInCurrency(subtotalUsd, isCurrencyCode(draft.currency) ? draft.currency : "USD"),
        shipping: operationalUsdAmountInCurrency(shippingUsd, isCurrencyCode(draft.currency) ? draft.currency : "USD"),
        total: operationalUsdAmountInCurrency(totalUsd, isCurrencyCode(draft.currency) ? draft.currency : "USD"),
        trackingId: order.tracking_id,
        purchasedItems: pricedItems.map((item) => ({
          name: item.name,
          edition: item.edition,
          colour: item.colorName,
          size: item.size,
          quantity: item.quantity
        }))
      }
    });
  }

  return {
    ok: true as const,
    orderId: order.id as string,
    orderNumber: order.order_number as string,
    createdAt: order.created_at as string,
    trackingId: order.tracking_id as string,
    items: pricedItems,
    deliveryQuote,
    subtotalUsd,
    shippingUsd,
    totalUsd,
    discountUsd
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

  const { data: order, error: orderError } = await client
    .from("orders")
    .select("id, order_number, created_at, tracking_id, email, customer_profile_id, full_name, payment_provider, payment_status, shipping_status, currency, subtotal_usd, shipping_usd, total_usd, shipping_address, shipping_city, shipping_state, shipping_postal_code, shipping_country, delivery_method_name, delivery_quotes(estimated_min_days, estimated_max_days), order_items(product_slug, product_name, product_edition, color_name, size, quantity, unit_price_usd)")
    .eq("stripe_checkout_session_id", checkoutSessionId)
    .maybeSingle();

  if (orderError || !order) {
    return { ok: false as const, reason: orderError?.message ?? "Stripe order was not found." };
  }

  const inventory = await markOrderInventorySold(order.id as string);

  if (!inventory.ok) {
    return inventory;
  }

  const wasAlreadyPaid = order.payment_status === "paid";
  const paymentUpdate = wasAlreadyPaid
    ? {
        ...(paymentIntentId ? { stripe_payment_intent_id: paymentIntentId } : {}),
        updated_at: new Date().toISOString()
      }
    : {
        status: "paid",
        payment_status: "paid",
        tracking_status: "order_confirmed",
        tracking_updated_at: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntentId ?? null,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
  const { error: updateError } = await client.from("orders").update(paymentUpdate).eq("id", order.id);

  if (updateError) {
    return { ok: false as const, reason: updateError.message };
  }

  if (!wasAlreadyPaid) {
    await client
      .from("notification_queue")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("order_id", order.id)
      .eq("template", "abandoned_checkout")
      .eq("status", "queued");

    const deliveryQuote = order.delivery_quotes as
      | { estimated_min_days: number; estimated_max_days: number }
      | Array<{ estimated_min_days: number; estimated_max_days: number }>
      | null;
    const deliveryEstimate = Array.isArray(deliveryQuote) ? deliveryQuote[0] : deliveryQuote;

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
      template: "order_confirmed",
      recipient: order.email as string,
      subject: `ỌNUỌRA order confirmed · ${order.order_number}`,
      payload: {
        orderReference: order.order_number,
        fullName: order.full_name,
        currency: isCurrencyCode(order.currency) ? order.currency : "USD",
        purchasedItems: (order.order_items ?? []).map((item) => ({
          name: getOrderItemCollectionLabel(item.product_slug),
          colour: item.color_name ?? undefined,
          size: item.size,
          quantity: item.quantity,
          unitPrice: operationalUsdAmountInCurrency(Number(item.unit_price_usd), isCurrencyCode(order.currency) ? order.currency : "USD")
        })),
        orderDate: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(order.created_at)),
        trackingId: order.tracking_id,
        deliveryAddress: [order.shipping_address, order.shipping_city, order.shipping_state, order.shipping_postal_code, order.shipping_country].filter(Boolean).join(", "),
        shippingMethod: order.delivery_method_name ?? "Tracked delivery",
        dispatchStatus: "Payment confirmed and preparing for dispatch",
        estimatedDispatchTiming: "Prepared for dispatch within three working days",
        estimatedDeliveryWindow: deliveryEstimate?.estimated_min_days && deliveryEstimate?.estimated_max_days ? `${deliveryEstimate.estimated_min_days}-${deliveryEstimate.estimated_max_days} business days after dispatch` : "Confirmed with your dispatch notification",
        paymentStatus: order.payment_provider === "stripe_testing_voucher" ? "Paid with authorised 100% testing voucher" : "Paid",
        contactInformation: "menswear@onuoraenterprises.com",
        subtotal: operationalUsdAmountInCurrency(Number(order.subtotal_usd), isCurrencyCode(order.currency) ? order.currency : "USD"),
        shipping: operationalUsdAmountInCurrency(Number(order.shipping_usd), isCurrencyCode(order.currency) ? order.currency : "USD"),
        discount: operationalUsdAmountInCurrency(
          Math.max(0, Number(order.subtotal_usd) + Number(order.shipping_usd) - Number(order.total_usd)),
          isCurrencyCode(order.currency) ? order.currency : "USD"
        ),
        totalUsd: Number(order.total_usd),
        total: operationalUsdAmountInCurrency(
          Number(order.total_usd),
          isCurrencyCode(order.currency) ? order.currency : "USD"
        )
      }
    });
    const orderNotificationEmail = getOrderNotificationEmail();

    if (orderNotificationEmail) {
      await queueOrderNotification({
        orderId: order.id as string,
        customerProfileId: order.customer_profile_id as string | null,
        template: "new_order_admin",
        recipient: orderNotificationEmail,
        subject: `New ỌNUỌRA order · ${order.order_number}`,
        payload: {
          orderReference: order.order_number,
          fullName: order.full_name,
          customerEmail: order.email,
          currency: isCurrencyCode(order.currency) ? order.currency : "USD",
          purchasedItems: (order.order_items ?? []).map((item) => ({
            name: getOrderItemCollectionLabel(item.product_slug),
            colour: item.color_name ?? undefined,
            size: item.size,
            quantity: item.quantity
          })),
          trackingId: order.tracking_id,
          paymentStatus: order.payment_provider === "stripe_testing_voucher" ? "Paid with authorised 100% testing voucher" : "Paid",
          subtotal: operationalUsdAmountInCurrency(Number(order.subtotal_usd), isCurrencyCode(order.currency) ? order.currency : "USD"),
          shipping: operationalUsdAmountInCurrency(Number(order.shipping_usd), isCurrencyCode(order.currency) ? order.currency : "USD"),
          discount: operationalUsdAmountInCurrency(
            Math.max(0, Number(order.subtotal_usd) + Number(order.shipping_usd) - Number(order.total_usd)),
            isCurrencyCode(order.currency) ? order.currency : "USD"
          ),
          total: operationalUsdAmountInCurrency(Number(order.total_usd), isCurrencyCode(order.currency) ? order.currency : "USD")
        }
      });
    }
  }

  return { ok: true as const };
}

async function closeUnpaidOrder(checkoutSessionId: string, outcome: "expired" | "failed") {
  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, reason: "Supabase is not configured yet." };
  }

  const { data: order, error: orderError } = await client
    .from("orders")
    .select("id, order_number, email, customer_profile_id, full_name, payment_status, currency, subtotal_usd, shipping_usd, total_usd, tracking_id, order_items(product_slug, product_name, product_edition, color_name, size, quantity)")
    .eq("stripe_checkout_session_id", checkoutSessionId)
    .maybeSingle();

  if (orderError || !order) {
    return { ok: false as const, reason: orderError?.message ?? "Stripe order was not found." };
  }

  if (order.payment_status === "paid") {
    return { ok: true as const };
  }

  const paymentStatus = outcome === "expired" ? "expired" : "failed";
  const orderStatus = outcome === "expired" ? "payment_expired" : "payment_failed";
  const wasAlreadyClosed = order.payment_status === paymentStatus;
  const released = await releaseOrderInventory(order.id as string);

  if (!released.ok) {
    return released;
  }

  const { error: updateError } = await client
    .from("orders")
    .update({
      status: orderStatus,
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", order.id);

  if (updateError) {
    return { ok: false as const, reason: updateError.message };
  }

  if (!wasAlreadyClosed) {
    await recordOrderEvent({
      orderId: order.id as string,
      eventType: orderStatus,
      status: orderStatus,
      paymentStatus,
      inventoryStatus: "released",
      note:
        outcome === "expired"
          ? "Payment session expired and inventory reservation was released."
          : "Payment failed and inventory reservation was released.",
      source: "stripe"
    });
    await queueOrderNotification({
      orderId: order.id as string,
      customerProfileId: order.customer_profile_id as string | null,
      template: orderStatus,
      recipient: order.email as string,
      subject: outcome === "expired" ? "Your ỌNUỌRA checkout expired" : "Your ỌNUỌRA payment was not completed",
      payload: {
        fullName: order.full_name
      }
    });

    const orderNotificationEmail = getOrderNotificationEmail();

    if (orderNotificationEmail) {
      await queueOrderNotification({
        orderId: order.id as string,
        customerProfileId: order.customer_profile_id as string | null,
        template: `${orderStatus}_admin`,
        recipient: orderNotificationEmail,
        subject: outcome === "expired" ? `Checkout expired · ${order.order_number}` : `Payment failed · ${order.order_number}`,
        payload: {
          orderReference: order.order_number,
          fullName: order.full_name,
          customerEmail: order.email,
          currency: isCurrencyCode(order.currency) ? order.currency : "USD",
          subtotal: operationalUsdAmountInCurrency(Number(order.subtotal_usd), isCurrencyCode(order.currency) ? order.currency : "USD"),
          shipping: operationalUsdAmountInCurrency(Number(order.shipping_usd), isCurrencyCode(order.currency) ? order.currency : "USD"),
          total: operationalUsdAmountInCurrency(Number(order.total_usd), isCurrencyCode(order.currency) ? order.currency : "USD"),
          trackingId: order.tracking_id,
          purchasedItems: (order.order_items ?? []).map((item) => ({
            name: getOrderItemCollectionLabel(item.product_slug),
            colour: item.color_name ?? undefined,
            size: item.size,
            quantity: item.quantity
          }))
        }
      });
    }
  }

  return { ok: true as const };
}

export async function markOrderPaymentExpired(checkoutSessionId: string) {
  return closeUnpaidOrder(checkoutSessionId, "expired");
}

export async function markOrderPaymentFailed(checkoutSessionId: string) {
  return closeUnpaidOrder(checkoutSessionId, "failed");
}
