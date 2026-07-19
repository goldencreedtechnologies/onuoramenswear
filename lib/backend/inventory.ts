import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";

export type ProductInventoryItem = {
  productSlug: string;
  size: string;
  stockQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  active: boolean;
  isLowStock: boolean;
  isSoldOut: boolean;
};

type InventoryRow = {
  product_slug: string;
  size: string;
  stock_quantity: number;
  reserved_quantity: number;
  sold_quantity: number;
  low_stock_threshold: number;
  active: boolean;
};

function mapInventoryRow(row: InventoryRow): ProductInventoryItem {
  const availableQuantity = Math.max(Number(row.stock_quantity) - Number(row.reserved_quantity), 0);

  return {
    productSlug: row.product_slug,
    size: row.size,
    stockQuantity: Number(row.stock_quantity),
    reservedQuantity: Number(row.reserved_quantity),
    soldQuantity: Number(row.sold_quantity),
    availableQuantity,
    lowStockThreshold: Number(row.low_stock_threshold),
    active: row.active,
    isLowStock: availableQuantity > 0 && availableQuantity <= Number(row.low_stock_threshold),
    isSoldOut: availableQuantity <= 0
  };
}

export async function getProductInventory(productSlug: string) {
  const client = createSupabaseServiceClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("product_inventory")
    .select("product_slug, size, stock_quantity, reserved_quantity, sold_quantity, low_stock_threshold, active")
    .eq("product_slug", productSlug)
    .eq("active", true)
    .order("size", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapInventoryRow(row as InventoryRow));
}

export async function reserveOrderInventory(orderId: string) {
  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, reason: "Supabase is not configured yet." };
  }

  const { error } = await client.rpc("reserve_order_inventory", { target_order_id: orderId });

  if (error) {
    const stockMatch = error.message.match(/INSUFFICIENT_STOCK:([^:]+):([^:\s]+)/);
    const reason = stockMatch
      ? `${stockMatch[1].toUpperCase()} in size ${stockMatch[2]} is sold out or no longer available in the requested quantity.`
      : error.message;

    return { ok: false as const, reason };
  }

  return { ok: true as const };
}

export async function releaseOrderInventory(orderId: string) {
  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, reason: "Supabase is not configured yet." };
  }

  const { error } = await client.rpc("release_order_inventory", { target_order_id: orderId });

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  return { ok: true as const };
}

export async function markOrderInventorySold(orderId: string) {
  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, reason: "Supabase is not configured yet." };
  }

  const { error } = await client.rpc("mark_order_inventory_sold", { target_order_id: orderId });

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  return { ok: true as const };
}
