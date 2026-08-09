import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isCurrencyCode, operationalUsdAmountInCurrency, type CurrencyCode } from "@/data/site-config";
import { getOrderConfirmationTokenSecret } from "@/lib/backend/env";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";

const tokenContext = "onuora:order-confirmation:v1";

type ConfirmationOrderRow = {
  id: string;
  order_number: string;
  full_name: string;
  status: string;
  payment_status: string;
  shipping_status: string | null;
  currency: string | null;
  subtotal_usd: number;
  shipping_usd: number;
  total_usd: number;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string;
  delivery_method_name: string | null;
  delivery_quotes:
    | {
        estimated_min_days: number;
        estimated_max_days: number;
      }
    | Array<{
        estimated_min_days: number;
        estimated_max_days: number;
      }>
    | null;
  order_items: Array<{
    product_slug: string;
    product_name: string | null;
    product_edition: string | null;
    color_name: string | null;
    size: string;
    quantity: number;
    unit_price_usd: number;
  }> | null;
};

function sign(orderId: string) {
  const secret = getOrderConfirmationTokenSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(`${tokenContext}:${orderId}`).digest("base64url");
}

export function createOrderConfirmationToken(orderId: string) {
  return sign(orderId);
}

export function hasValidOrderConfirmationToken(orderId: string, token: string | undefined) {
  const expected = sign(orderId);
  if (!expected || !token) return false;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(token);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function getOrderConfirmation(orderId: string, token: string | undefined) {
  if (!hasValidOrderConfirmationToken(orderId, token)) return null;

  const client = createSupabaseServiceClient();
  if (!client) return null;

  const { data, error } = await client
    .from("orders")
    .select(
      "id, order_number, full_name, status, payment_status, shipping_status, currency, subtotal_usd, shipping_usd, total_usd, shipping_address, shipping_city, shipping_state, shipping_postal_code, shipping_country, delivery_method_name, delivery_quotes(estimated_min_days, estimated_max_days), order_items(product_slug, product_name, product_edition, color_name, size, quantity, unit_price_usd)"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return null;

  const order = data as ConfirmationOrderRow;
  const deliveryQuote = Array.isArray(order.delivery_quotes) ? order.delivery_quotes[0] : order.delivery_quotes;
  const currency: CurrencyCode = isCurrencyCode(order.currency) ? order.currency : "USD";
  const subtotalUsd = Number(order.subtotal_usd);
  const shippingUsd = Number(order.shipping_usd);
  const totalUsd = Number(order.total_usd);

  return {
    fullName: order.full_name,
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    shippingStatus: order.shipping_status ?? "not_started",
    currency,
    subtotal: operationalUsdAmountInCurrency(subtotalUsd, currency),
    shipping: operationalUsdAmountInCurrency(shippingUsd, currency),
    discount: operationalUsdAmountInCurrency(Math.max(0, subtotalUsd + shippingUsd - totalUsd), currency),
    total: operationalUsdAmountInCurrency(totalUsd, currency),
    deliveryAddress: [
      order.shipping_address,
      order.shipping_city,
      order.shipping_state,
      order.shipping_postal_code,
      order.shipping_country
    ].filter(Boolean).join(", "),
    deliveryMethod: order.delivery_method_name ?? "Tracked delivery",
    deliveryWindow:
      deliveryQuote?.estimated_min_days && deliveryQuote?.estimated_max_days
        ? `${deliveryQuote.estimated_min_days}-${deliveryQuote.estimated_max_days} business days after dispatch`
        : "Confirmed with your dispatch notification",
    items: (order.order_items ?? []).map((item) => ({
      name: item.product_name ?? item.product_slug,
      edition: item.product_edition,
      colour: item.color_name,
      size: item.size,
      quantity: item.quantity
    }))
  };
}
