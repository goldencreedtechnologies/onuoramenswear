import "server-only";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";

export const trackingStatuses = [
  "order_received",
  "order_confirmed",
  "preparing_order",
  "ready_for_dispatch",
  "dispatched",
  "in_transit",
  "out_for_delivery",
  "delivered"
] as const;

export type TrackingStatus = (typeof trackingStatuses)[number];

export const trackingLookupSchema = z.object({
  trackingId: z.string().trim().regex(/^TRK-\d{4}-\d{8}$/i, "Enter the tracking ID from your order confirmation."),
  email: z.string().trim().email().max(254)
});

type TrackingOrderRow = {
  order_number: string;
  tracking_id: string;
  tracking_status: TrackingStatus;
  tracking_updated_at: string;
  delivery_method_name: string | null;
  shipping_status: string | null;
};

export function trackingStatusLabel(status: TrackingStatus) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export async function getTrackingLookup(input: z.infer<typeof trackingLookupSchema>) {
  const client = createSupabaseServiceClient();
  if (!client) return { ok: false as const, reason: "Order tracking is temporarily unavailable." };

  const { data, error } = await client
    .from("orders")
    .select("order_number, tracking_id, tracking_status, tracking_updated_at, delivery_method_name, shipping_status")
    .ilike("tracking_id", input.trackingId.toUpperCase())
    .ilike("email", input.email.toLowerCase())
    .maybeSingle();

  if (error) return { ok: false as const, reason: "Order tracking is temporarily unavailable." };
  if (!data) return { ok: false as const, reason: "We could not find an order matching those details." };

  const order = data as TrackingOrderRow;
  return {
    ok: true as const,
    tracking: {
      orderNumber: order.order_number,
      trackingId: order.tracking_id,
      status: order.tracking_status,
      statusLabel: trackingStatusLabel(order.tracking_status),
      updatedAt: order.tracking_updated_at,
      deliveryMethod: order.delivery_method_name ?? "Tracked delivery",
      shippingStatus: order.shipping_status ?? "not_started"
    }
  };
}
