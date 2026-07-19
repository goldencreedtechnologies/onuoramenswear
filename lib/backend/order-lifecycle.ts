import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";

type OrderEventInput = {
  orderId: string;
  eventType: string;
  status?: string | null;
  paymentStatus?: string | null;
  shippingStatus?: string | null;
  inventoryStatus?: string | null;
  note?: string | null;
  source?: "system" | "stripe" | "admin" | "customer";
  visibleToCustomer?: boolean;
  metadata?: Record<string, unknown>;
};

type NotificationInput = {
  orderId: string;
  customerProfileId?: string | null;
  template: string;
  recipient: string;
  subject?: string;
  payload?: Record<string, unknown>;
  scheduledAt?: string;
};

export async function recordOrderEvent(input: OrderEventInput) {
  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, reason: "Supabase is not configured yet." };
  }

  const { error } = await client.from("order_events").insert({
    order_id: input.orderId,
    event_type: input.eventType,
    status: input.status ?? null,
    payment_status: input.paymentStatus ?? null,
    shipping_status: input.shippingStatus ?? null,
    inventory_status: input.inventoryStatus ?? null,
    note: input.note ?? null,
    source: input.source ?? "system",
    visible_to_customer: input.visibleToCustomer ?? true,
    metadata: input.metadata ?? {}
  });

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  return { ok: true as const };
}

export async function queueOrderNotification(input: NotificationInput) {
  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, reason: "Supabase is not configured yet." };
  }

  const { error } = await client.from("notification_queue").insert({
    order_id: input.orderId,
    customer_profile_id: input.customerProfileId ?? null,
    template: input.template,
    recipient: input.recipient,
    subject: input.subject ?? null,
    payload: input.payload ?? {},
    scheduled_at: input.scheduledAt ?? new Date().toISOString()
  });

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  return { ok: true as const };
}

export async function getOrderNotificationContext(orderId: string) {
  const client = createSupabaseServiceClient();

  if (!client) {
    return null;
  }

  const { data } = await client
    .from("orders")
    .select("id, email, customer_profile_id, full_name, status, payment_status, shipping_status, inventory_status, total_usd")
    .eq("id", orderId)
    .maybeSingle();

  return data ?? null;
}
