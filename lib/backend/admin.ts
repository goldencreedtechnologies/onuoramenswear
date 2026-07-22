import { z } from "zod";
import { getStoreProducts } from "@/lib/backend/catalog";
import { recordOrderEvent } from "@/lib/backend/order-lifecycle";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const orderStatusSchema = z.object({
  status: z
    .enum(["pending_payment", "paid", "processing", "fulfilled", "cancelled", "payment_expired", "payment_failed"])
    .optional(),
  paymentStatus: z.enum(["unpaid", "paid", "expired", "refunded", "failed"]).optional(),
  shippingStatus: z
    .enum(["not_started", "quote_attached", "preparing", "ready_to_ship", "in_transit", "delivered", "manual_review"])
    .optional(),
  note: z.string().trim().max(280).optional()
});

export const inventoryUpdateSchema = z.object({
  stockQuantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  active: z.boolean().optional()
});

export const adminCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  fullName: z.string().trim().min(2).max(120),
  username: z.string().trim().min(3).max(60),
  roleSlug: z.string().trim().min(2).default("admin"),
  active: z.boolean().default(true)
});

export const adminUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  username: z.string().trim().min(3).max(60).optional(),
  roleSlug: z.string().trim().min(2).optional(),
  active: z.boolean().optional()
});

export const productAdminSchema = z.object({
  slug: z.string().trim().min(2).max(80),
  name: z.string().trim().min(2).max(120),
  edition: z.string().trim().min(2).max(120),
  meaning: z.string().trim().min(2).max(160),
  price: z.string().trim().min(1).max(40),
  image: z.string().trim().min(1).max(500),
  images: z.array(z.string().trim().min(1).max(500)).default([]),
  palette: z.string().trim().min(4).max(40),
  pageText: z.string().trim().min(4).max(40),
  pageMuted: z.string().trim().min(4).max(40),
  pagePanel: z.string().trim().min(4).max(40),
  darkPage: z.boolean().default(false),
  story: z.string().trim().min(10),
  storyKicker: z.string().trim().min(2).max(160),
  storyTitle: z.string().trim().min(2).max(220),
  occasion: z.string().trim().min(2).max(180),
  sortOrder: z.number().int().min(0).default(0)
});

export const settingUpdateSchema = z.object({
  key: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(80).default("general"),
  label: z.string().trim().min(2).max(160),
  value: z.record(z.unknown())
});

export const socialLinkSchema = z.object({
  platform: z.string().trim().min(2).max(80),
  handle: z.string().trim().max(120).optional().or(z.literal("")),
  url: z.string().url(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0)
});

export const mediaSchema = z.object({
  title: z.string().trim().min(2).max(160),
  altText: z.string().trim().max(240).optional().or(z.literal("")),
  fileUrl: z.string().trim().min(1).max(500),
  fileType: z.string().trim().min(2).max(40).default("image"),
  folder: z.string().trim().min(2).max(80).default("brand"),
  metadata: z.record(z.unknown()).default({})
});

type AdminUserRow = {
  id: string;
  auth_user_id: string;
  email: string;
  role: string;
  full_name: string | null;
  username: string | null;
  access_level: string;
  role_id: string | null;
  active: boolean;
};

type OrderRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  status: string;
  payment_status: string;
  shipping_status: string;
  inventory_status: string;
  delivery_method_name: string | null;
  shipping_country: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_address: string | null;
  shipping_usd: number;
  subtotal_usd: number;
  total_usd: number;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemRow[];
};

type OrderItemRow = {
  id: string;
  product_slug: string;
  quantity: number;
  size: string;
  unit_price_usd: number;
};

type InventoryRow = {
  id: string;
  product_slug: string;
  size: string;
  stock_quantity: number;
  reserved_quantity: number;
  sold_quantity: number;
  low_stock_threshold: number;
  active: boolean;
  updated_at: string;
};

export type AdminSession = {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
  username: string | null;
  accessLevel: string;
  roleId: string | null;
  permissions: string[];
};

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function mapOrder(row: OrderRow) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    status: row.status,
    paymentStatus: row.payment_status,
    shippingStatus: row.shipping_status,
    inventoryStatus: row.inventory_status,
    deliveryMethodName: row.delivery_method_name,
    shippingCountry: row.shipping_country,
    shippingCity: row.shipping_city,
    shippingState: row.shipping_state,
    shippingAddress: row.shipping_address,
    subtotalUsd: toNumber(row.subtotal_usd),
    shippingUsd: toNumber(row.shipping_usd),
    totalUsd: toNumber(row.total_usd),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: (row.order_items ?? []).map((item) => ({
      id: item.id,
      productSlug: item.product_slug,
      quantity: item.quantity,
      size: item.size,
      unitPriceUsd: toNumber(item.unit_price_usd)
    }))
  };
}

function mapInventory(row: InventoryRow, productName: string) {
  const availableQuantity = Math.max(toNumber(row.stock_quantity) - toNumber(row.reserved_quantity), 0);

  return {
    id: row.id,
    productSlug: row.product_slug,
    productName,
    size: row.size,
    stockQuantity: toNumber(row.stock_quantity),
    reservedQuantity: toNumber(row.reserved_quantity),
    soldQuantity: toNumber(row.sold_quantity),
    availableQuantity,
    lowStockThreshold: toNumber(row.low_stock_threshold),
    active: row.active,
    isLowStock: availableQuantity > 0 && availableQuantity <= toNumber(row.low_stock_threshold),
    isSoldOut: availableQuantity <= 0,
    updatedAt: row.updated_at
  };
}

export async function requireAdminSession() {
  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, status: 503, reason: "Supabase service role is not configured." };
  }

  let serverClient: Awaited<ReturnType<typeof createSupabaseServerClient>>;

  try {
    serverClient = await createSupabaseServerClient();
  } catch {
    return { ok: false as const, status: 503, reason: "Supabase Auth is not configured." };
  }

  const { data: authData, error: authError } = await serverClient.auth.getUser();

  if (authError || !authData.user?.id) {
    return { ok: false as const, status: 401, reason: "Sign in to access the admin dashboard." };
  }

  const { data: admin, error } = await serviceClient
    .from("admin_users")
    .select("id, auth_user_id, email, role, full_name, username, access_level, role_id, active")
    .eq("auth_user_id", authData.user.id)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    return { ok: false as const, status: 500, reason: error.message };
  }

  if (!admin) {
    return { ok: false as const, status: 403, reason: "This account is not approved for admin access." };
  }

  const row = admin as AdminUserRow;
  const permissions = await getAdminPermissions(row);

  await serviceClient.from("admin_users").update({ last_seen_at: new Date().toISOString() }).eq("id", row.id);

  return {
    ok: true as const,
    admin: {
      id: row.id,
      email: row.email,
      role: row.role,
      fullName: row.full_name,
      username: row.username,
      accessLevel: row.access_level,
      roleId: row.role_id,
      permissions
    }
  };
}

async function getAdminPermissions(admin: AdminUserRow) {
  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return [];
  }

  if (admin.access_level === "super_admin") {
    const { data } = await serviceClient.from("admin_permissions").select("key");
    return (data ?? []).map((permission) => permission.key as string);
  }

  if (!admin.role_id) {
    return [];
  }

  const { data } = await serviceClient.from("admin_role_permissions").select("permission_key").eq("role_id", admin.role_id);
  return (data ?? []).map((permission) => permission.permission_key as string);
}

export function adminCan(admin: AdminSession, permission: string) {
  return admin.accessLevel === "super_admin" || admin.permissions.includes(permission);
}

function assertAdminCan(admin: AdminSession, permission: string) {
  if (!adminCan(admin, permission)) {
    return { ok: false as const, reason: "You do not have permission to perform this admin action." };
  }

  return { ok: true as const };
}

async function logAdminActivity(admin: AdminSession, action: string, targetType: string, targetId?: string, metadata?: Record<string, unknown>) {
  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return;
  }

  await serviceClient.from("admin_activity_logs").insert({
    admin_user_id: admin.id,
    action,
    target_type: targetType,
    target_id: targetId ?? null,
    metadata: metadata ?? {}
  });
}

export async function getAdminOverview() {
  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, reason: "Supabase service role is not configured." };
  }

  const [orders, lowStock, quotes] = await Promise.all([
    serviceClient.from("orders").select("id, status, payment_status, shipping_status, total_usd, created_at").order("created_at", { ascending: false }).limit(50),
    serviceClient
      .from("product_inventory")
      .select("id, product_slug, size, stock_quantity, reserved_quantity, sold_quantity, low_stock_threshold, active, updated_at")
      .eq("active", true)
      .order("product_slug", { ascending: true }),
    serviceClient
      .from("delivery_quotes")
      .select("id, requires_manual_review, status, shipping_usd, created_at")
      .eq("requires_manual_review", true)
      .order("created_at", { ascending: false })
      .limit(20)
  ]);

  if (orders.error) {
    return { ok: false as const, reason: orders.error.message };
  }

  if (lowStock.error) {
    return { ok: false as const, reason: lowStock.error.message };
  }

  if (quotes.error) {
    return { ok: false as const, reason: quotes.error.message };
  }

  const orderRows = orders.data ?? [];
  const inventoryRows = (lowStock.data ?? []) as InventoryRow[];
  const totalRevenueUsd = orderRows
    .filter((order) => order.payment_status === "paid")
    .reduce((sum, order) => sum + toNumber(order.total_usd), 0);
  const lowStockRows = inventoryRows.filter((row) => {
    const available = toNumber(row.stock_quantity) - toNumber(row.reserved_quantity);
    return available <= toNumber(row.low_stock_threshold);
  });

  return {
    ok: true as const,
    overview: {
      totalOrders: orderRows.length,
      paidOrders: orderRows.filter((order) => order.payment_status === "paid").length,
      pendingPayments: orderRows.filter((order) => order.payment_status === "unpaid").length,
      fulfilmentQueue: orderRows.filter((order) => ["paid", "processing"].includes(order.status)).length,
      manualDeliveryReviews: quotes.data?.length ?? 0,
      lowStockCount: lowStockRows.length,
      totalRevenueUsd,
      recentOrders: orderRows.slice(0, 8).map((order) => ({
        id: order.id,
        status: order.status,
        paymentStatus: order.payment_status,
        shippingStatus: order.shipping_status,
        totalUsd: toNumber(order.total_usd),
        createdAt: order.created_at
      })),
      lowStock: lowStockRows.slice(0, 8).map((row) => ({
        id: row.id,
        productSlug: row.product_slug,
        size: row.size,
        availableQuantity: Math.max(toNumber(row.stock_quantity) - toNumber(row.reserved_quantity), 0),
        lowStockThreshold: toNumber(row.low_stock_threshold)
      }))
    }
  };
}

export async function getAdminOrders() {
  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, reason: "Supabase service role is not configured." };
  }

  const { data, error } = await serviceClient
    .from("orders")
    .select(
      "id, email, full_name, phone, status, payment_status, shipping_status, inventory_status, delivery_method_name, shipping_country, shipping_city, shipping_state, shipping_address, subtotal_usd, shipping_usd, total_usd, created_at, updated_at, order_items(id, product_slug, quantity, size, unit_price_usd)"
    )
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  return { ok: true as const, orders: ((data ?? []) as OrderRow[]).map(mapOrder) };
}

export async function updateAdminOrderStatus(admin: AdminSession, orderId: string, input: z.infer<typeof orderStatusSchema>) {
  const permitted = assertAdminCan(admin, "orders.manage");

  if (!permitted.ok) {
    return permitted;
  }

  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, reason: "Supabase service role is not configured." };
  }

  const updates: Record<string, string> = {
    updated_at: new Date().toISOString()
  };

  if (input.status) {
    updates.status = input.status;
  }

  if (input.paymentStatus) {
    updates.payment_status = input.paymentStatus;
  }

  if (input.shippingStatus) {
    updates.shipping_status = input.shippingStatus;
  }

  const { data, error } = await serviceClient
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .select("id, status, payment_status, shipping_status, inventory_status")
    .maybeSingle();

  if (error || !data) {
    return { ok: false as const, reason: error?.message ?? "Order not found." };
  }

  await recordOrderEvent({
    orderId,
    eventType: "admin_status_updated",
    status: data.status,
    paymentStatus: data.payment_status,
    shippingStatus: data.shipping_status,
    inventoryStatus: data.inventory_status,
    note: input.note || "Order status was updated by the admin team.",
    source: "admin",
    metadata: {
      adminUserId: admin.id,
      adminRole: admin.role
    }
  });

  await logAdminActivity(admin, "order_status_updated", "order", orderId, updates);

  return { ok: true as const };
}

export async function getAdminInventory() {
  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, reason: "Supabase service role is not configured." };
  }

  const [products, inventory] = await Promise.all([
    getStoreProducts(),
    serviceClient
      .from("product_inventory")
      .select("id, product_slug, size, stock_quantity, reserved_quantity, sold_quantity, low_stock_threshold, active, updated_at")
      .order("product_slug", { ascending: true })
      .order("size", { ascending: true })
  ]);

  if (inventory.error) {
    return { ok: false as const, reason: inventory.error.message };
  }

  const productNames = new Map(products.map((product) => [product.slug, product.name]));

  return {
    ok: true as const,
    inventory: ((inventory.data ?? []) as InventoryRow[]).map((row) => mapInventory(row, productNames.get(row.product_slug) ?? row.product_slug.toUpperCase()))
  };
}

export async function updateAdminInventory(admin: AdminSession, inventoryId: string, input: z.infer<typeof inventoryUpdateSchema>) {
  const permitted = assertAdminCan(admin, "inventory.manage");

  if (!permitted.ok) {
    return permitted;
  }

  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, reason: "Supabase service role is not configured." };
  }

  const updates: Record<string, number | boolean | string> = {
    updated_at: new Date().toISOString()
  };

  if (typeof input.stockQuantity === "number") {
    updates.stock_quantity = input.stockQuantity;
  }

  if (typeof input.lowStockThreshold === "number") {
    updates.low_stock_threshold = input.lowStockThreshold;
  }

  if (typeof input.active === "boolean") {
    updates.active = input.active;
  }

  const { data, error } = await serviceClient
    .from("product_inventory")
    .update(updates)
    .eq("id", inventoryId)
    .select("id, product_slug, size")
    .maybeSingle();

  if (error || !data) {
    return { ok: false as const, reason: error?.message ?? "Inventory row not found." };
  }

  await logAdminActivity(admin, "inventory_updated", "product_inventory", inventoryId, {
    productSlug: data.product_slug,
    size: data.size,
    updates
  });

  return { ok: true as const };
}

export async function getAdminAccessControl() {
  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, reason: "Supabase service role is not configured." };
  }

  const [admins, roles, permissions] = await Promise.all([
    serviceClient
      .from("admin_users")
      .select("id, email, role, full_name, username, access_level, active, role_id, last_seen_at, created_at")
      .order("created_at", { ascending: false }),
    serviceClient
      .from("admin_roles")
      .select("id, slug, name, access_level, description, system_role, active, admin_role_permissions(permission_key)")
      .order("name", { ascending: true }),
    serviceClient.from("admin_permissions").select("key, category, label, description").order("category", { ascending: true }).order("label", { ascending: true })
  ]);

  if (admins.error) {
    return { ok: false as const, reason: admins.error.message };
  }

  if (roles.error) {
    return { ok: false as const, reason: roles.error.message };
  }

  if (permissions.error) {
    return { ok: false as const, reason: permissions.error.message };
  }

  return {
    ok: true as const,
    access: {
      admins: (admins.data ?? []).map((admin) => ({
        id: admin.id,
        email: admin.email,
        role: admin.role,
        fullName: admin.full_name,
        username: admin.username,
        accessLevel: admin.access_level,
        roleId: admin.role_id,
        active: admin.active,
        lastSeenAt: admin.last_seen_at,
        createdAt: admin.created_at
      })),
      roles: (roles.data ?? []).map((role) => ({
        id: role.id,
        slug: role.slug,
        name: role.name,
        accessLevel: role.access_level,
        description: role.description,
        systemRole: role.system_role,
        active: role.active,
        permissions: (role.admin_role_permissions ?? []).map((permission: { permission_key: string }) => permission.permission_key)
      })),
      permissions: permissions.data ?? []
    }
  };
}

export async function createAdminAccount(admin: AdminSession, input: z.infer<typeof adminCreateSchema>) {
  const permitted = assertAdminCan(admin, "admins.manage");

  if (!permitted.ok) {
    return permitted;
  }

  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, reason: "Supabase service role is not configured." };
  }

  const { data: role, error: roleError } = await serviceClient
    .from("admin_roles")
    .select("id, slug, access_level")
    .eq("slug", input.roleSlug)
    .eq("active", true)
    .maybeSingle();

  if (roleError || !role) {
    return { ok: false as const, reason: roleError?.message ?? "Selected admin role was not found." };
  }

  const { data: authUser, error: authError } = input.password
    ? await serviceClient.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: {
          full_name: input.fullName,
          username: input.username
        }
      })
    : await serviceClient.auth.admin.inviteUserByEmail(input.email, {
        data: {
          full_name: input.fullName,
          username: input.username
        }
      });

  if (authError || !authUser.user?.id || !authUser.user.email) {
    return { ok: false as const, reason: authError?.message ?? "Unable to create Supabase Auth user." };
  }

  const { error } = await serviceClient.from("admin_users").upsert(
    {
      auth_user_id: authUser.user.id,
      email: authUser.user.email,
      full_name: input.fullName,
      username: input.username,
      role: role.slug === "super-admin" ? "super_admin" : role.slug,
      role_id: role.id,
      access_level: role.access_level,
      active: input.active,
      updated_at: new Date().toISOString()
    },
    { onConflict: "auth_user_id" }
  );

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  await logAdminActivity(admin, "admin_created", "admin_user", authUser.user.id, {
    email: input.email,
    username: input.username,
    roleSlug: input.roleSlug
  });

  return { ok: true as const };
}

export async function updateAdminAccount(admin: AdminSession, adminUserId: string, input: z.infer<typeof adminUpdateSchema>) {
  const permitted = assertAdminCan(admin, "admins.manage");

  if (!permitted.ok) {
    return permitted;
  }

  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, reason: "Supabase service role is not configured." };
  }

  const updates: Record<string, string | boolean | null> = {
    updated_at: new Date().toISOString()
  };

  if (typeof input.fullName === "string") {
    updates.full_name = input.fullName;
  }

  if (typeof input.username === "string") {
    updates.username = input.username;
  }

  if (typeof input.active === "boolean") {
    updates.active = input.active;
  }

  if (input.roleSlug) {
    const { data: role, error: roleError } = await serviceClient
      .from("admin_roles")
      .select("id, slug, access_level")
      .eq("slug", input.roleSlug)
      .eq("active", true)
      .maybeSingle();

    if (roleError || !role) {
      return { ok: false as const, reason: roleError?.message ?? "Selected admin role was not found." };
    }

    updates.role_id = role.id;
    updates.role = role.slug === "super-admin" ? "super_admin" : role.slug;
    updates.access_level = role.access_level;
  }

  const { error } = await serviceClient.from("admin_users").update(updates).eq("id", adminUserId);

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  await logAdminActivity(admin, "admin_updated", "admin_user", adminUserId, updates);

  return { ok: true as const };
}

export async function getAdminProducts() {
  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, reason: "Supabase service role is not configured." };
  }

  const { data, error } = await serviceClient
    .from("products")
    .select("id, slug, name, edition, meaning, price, image, images, palette, page_text, page_muted, page_panel, dark_page, story, story_kicker, story_title, occasion, sort_order, updated_at")
    .order("sort_order", { ascending: true });

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  return { ok: true as const, products: data ?? [] };
}

export async function upsertAdminProduct(admin: AdminSession, input: z.infer<typeof productAdminSchema>) {
  const permitted = assertAdminCan(admin, "products.manage");

  if (!permitted.ok) {
    return permitted;
  }

  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, reason: "Supabase service role is not configured." };
  }

  const { error } = await serviceClient.from("products").upsert(
    {
      slug: input.slug,
      name: input.name,
      edition: input.edition,
      meaning: input.meaning,
      price: input.price,
      image: input.image,
      images: input.images.length ? input.images : [input.image],
      palette: input.palette,
      page_text: input.pageText,
      page_muted: input.pageMuted,
      page_panel: input.pagePanel,
      dark_page: input.darkPage,
      story: input.story,
      story_kicker: input.storyKicker,
      story_title: input.storyTitle,
      occasion: input.occasion,
      sort_order: input.sortOrder,
      updated_at: new Date().toISOString()
    },
    { onConflict: "slug" }
  );

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  await logAdminActivity(admin, "product_upserted", "product", input.slug, { slug: input.slug });

  return { ok: true as const };
}

export async function getAdminContentControl() {
  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, reason: "Supabase service role is not configured." };
  }

  const [settings, socialLinks, media, pages] = await Promise.all([
    serviceClient.from("site_settings").select("key, category, label, value, updated_at").order("category", { ascending: true }),
    serviceClient.from("site_social_links").select("id, platform, handle, url, active, sort_order, updated_at").order("sort_order", { ascending: true }),
    serviceClient.from("site_media").select("id, title, alt_text, file_url, file_type, folder, metadata, created_at").order("created_at", { ascending: false }).limit(80),
    serviceClient.from("site_pages").select("id, slug, title, page_type, status, seo_title, seo_description, sections, updated_at").order("updated_at", { ascending: false })
  ]);

  for (const result of [settings, socialLinks, media, pages]) {
    if (result.error) {
      return { ok: false as const, reason: result.error.message };
    }
  }

  return {
    ok: true as const,
    content: {
      settings: settings.data ?? [],
      socialLinks: socialLinks.data ?? [],
      media: media.data ?? [],
      pages: pages.data ?? []
    }
  };
}

export async function upsertAdminSetting(admin: AdminSession, input: z.infer<typeof settingUpdateSchema>) {
  const permitted = assertAdminCan(admin, "settings.manage");

  if (!permitted.ok) {
    return permitted;
  }

  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, reason: "Supabase service role is not configured." };
  }

  const { error } = await serviceClient.from("site_settings").upsert(
    {
      key: input.key,
      category: input.category,
      label: input.label,
      value: input.value,
      updated_by: admin.id,
      updated_at: new Date().toISOString()
    },
    { onConflict: "key" }
  );

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  await logAdminActivity(admin, "setting_upserted", "site_setting", input.key);

  return { ok: true as const };
}

export async function createAdminSocialLink(admin: AdminSession, input: z.infer<typeof socialLinkSchema>) {
  const permitted = assertAdminCan(admin, "settings.manage");

  if (!permitted.ok) {
    return permitted;
  }

  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, reason: "Supabase service role is not configured." };
  }

  const { error } = await serviceClient.from("site_social_links").insert({
    platform: input.platform,
    handle: input.handle || null,
    url: input.url,
    active: input.active,
    sort_order: input.sortOrder,
    updated_by: admin.id
  });

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  await logAdminActivity(admin, "social_link_created", "site_social_link", input.platform);

  return { ok: true as const };
}

export async function createAdminMedia(admin: AdminSession, input: z.infer<typeof mediaSchema>) {
  const permitted = assertAdminCan(admin, "media.manage");

  if (!permitted.ok) {
    return permitted;
  }

  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return { ok: false as const, reason: "Supabase service role is not configured." };
  }

  const { error } = await serviceClient.from("site_media").insert({
    title: input.title,
    alt_text: input.altText || null,
    file_url: input.fileUrl,
    file_type: input.fileType,
    folder: input.folder,
    metadata: input.metadata,
    uploaded_by: admin.id
  });

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  await logAdminActivity(admin, "media_created", "site_media", input.fileUrl);

  return { ok: true as const };
}
