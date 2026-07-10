import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl, hasSupabaseConfig } from "@/lib/backend/env";

export const checkoutDraftSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  currency: z.string().default("USD"),
  shippingCountry: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingAddress: z.string().optional(),
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

function createServiceClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!hasSupabaseConfig() || !url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function createOrder(draft: CheckoutDraftInput) {
  const client = createServiceClient();

  if (!client) {
    return { ok: false as const, reason: "Supabase is not configured yet." };
  }

  const { data: order, error } = await client
    .from("orders")
    .insert({
      email: draft.email,
      full_name: draft.fullName,
      phone: draft.phone ?? null,
      currency: draft.currency,
      shipping_country: draft.shippingCountry ?? null,
      shipping_city: draft.shippingCity ?? null,
      shipping_address: draft.shippingAddress ?? null,
      status: "draft"
    })
    .select("id")
    .single();

  if (error || !order) {
    return { ok: false as const, reason: error?.message ?? "Unable to create order." };
  }

  const itemRows = draft.items.map((item) => ({
    order_id: order.id,
    product_slug: item.productSlug,
    quantity: item.quantity,
    size: item.size,
    unit_price_usd: item.unitPriceUsd
  }));

  const { error: itemsError } = await client.from("order_items").insert(itemRows);

  if (itemsError) {
    return { ok: false as const, reason: itemsError.message };
  }

  return { ok: true as const, orderId: order.id };
}
