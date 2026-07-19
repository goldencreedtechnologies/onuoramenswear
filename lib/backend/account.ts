import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const accountProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  marketingOptIn: z.boolean().optional()
});

export const addressSchema = z.object({
  label: z.string().trim().min(2).max(60).default("Primary"),
  recipientName: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  addressLine1: z.string().trim().min(4).max(220),
  addressLine2: z.string().trim().max(220).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(100),
  stateRegion: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().max(30).optional().or(z.literal("")),
  countryCode: z.string().trim().min(2).max(2),
  countryName: z.string().trim().min(2).max(100),
  isDefault: z.boolean().optional().default(false)
});

type AccountUser = {
  id: string;
  email: string;
};

export type CustomerProfile = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  marketingOptIn: boolean;
};

export type CustomerAddress = {
  id: string;
  label: string;
  recipientName: string | null;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateRegion: string | null;
  postalCode: string | null;
  countryCode: string;
  countryName: string;
  isDefault: boolean;
};

export type CustomerOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  deliveryMethodName: string | null;
  subtotalUsd: number;
  shippingUsd: number;
  totalUsd: number;
  createdAt: string;
  items: Array<{
    id: string;
    productSlug: string;
    quantity: number;
    size: string;
    unitPriceUsd: number;
  }>;
};

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  marketing_opt_in: boolean;
};

type AddressRow = {
  id: string;
  label: string;
  recipient_name: string | null;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_region: string | null;
  postal_code: string | null;
  country_code: string;
  country_name: string;
  is_default: boolean;
};

type OrderRow = {
  id: string;
  status: string;
  payment_status: string;
  shipping_status: string | null;
  delivery_method_name: string | null;
  subtotal_usd: number;
  shipping_usd: number;
  total_usd: number;
  created_at: string;
  order_items?: Array<{
    id: string;
    product_slug: string;
    quantity: number;
    size: string;
    unit_price_usd: number;
  }>;
};

function mapProfile(row: ProfileRow): CustomerProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    marketingOptIn: row.marketing_opt_in
  };
}

function mapAddress(row: AddressRow): CustomerAddress {
  return {
    id: row.id,
    label: row.label,
    recipientName: row.recipient_name,
    phone: row.phone,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    stateRegion: row.state_region,
    postalCode: row.postal_code,
    countryCode: row.country_code,
    countryName: row.country_name,
    isDefault: row.is_default
  };
}

function mapOrder(row: OrderRow): CustomerOrder {
  return {
    id: row.id,
    status: row.status,
    paymentStatus: row.payment_status,
    shippingStatus: row.shipping_status ?? "not_started",
    deliveryMethodName: row.delivery_method_name,
    subtotalUsd: Number(row.subtotal_usd),
    shippingUsd: Number(row.shipping_usd),
    totalUsd: Number(row.total_usd),
    createdAt: row.created_at,
    items: (row.order_items ?? []).map((item) => ({
      id: item.id,
      productSlug: item.product_slug,
      quantity: item.quantity,
      size: item.size,
      unitPriceUsd: Number(item.unit_price_usd)
    }))
  };
}

export async function getAuthenticatedAccountUser(): Promise<{ ok: true; user: AccountUser } | { ok: false; status: number; reason: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user?.email) {
      return { ok: false, status: 401, reason: "Sign in to continue." };
    }

    return { ok: true, user: { id: data.user.id, email: data.user.email } };
  } catch {
    return { ok: false, status: 503, reason: "Supabase Auth is not configured yet." };
  }
}

export async function ensureCustomerProfile(user: AccountUser) {
  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, status: 503, reason: "Supabase is not configured yet." };
  }

  const { data: profile, error } = await client
    .from("customer_profiles")
    .upsert(
      {
        auth_user_id: user.id,
        email: user.email,
        updated_at: new Date().toISOString()
      },
      { onConflict: "auth_user_id" }
    )
    .select("id, email, full_name, phone, marketing_opt_in")
    .single();

  if (error || !profile) {
    return { ok: false as const, status: 500, reason: error?.message ?? "Unable to prepare customer profile." };
  }

  await client
    .from("orders")
    .update({ customer_profile_id: profile.id, updated_at: new Date().toISOString() })
    .eq("email", user.email)
    .is("customer_profile_id", null);

  return { ok: true as const, profile: mapProfile(profile as ProfileRow) };
}

export async function getAccountOverview(user: AccountUser) {
  const prepared = await ensureCustomerProfile(user);

  if (!prepared.ok) {
    return prepared;
  }

  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, status: 503, reason: "Supabase is not configured yet." };
  }

  const [{ data: addresses, error: addressError }, { data: orders, error: orderError }] = await Promise.all([
    client
      .from("customer_addresses")
      .select(
        "id, label, recipient_name, phone, address_line1, address_line2, city, state_region, postal_code, country_code, country_name, is_default"
      )
      .eq("customer_profile_id", prepared.profile.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false }),
    client
      .from("orders")
      .select(
        "id, status, payment_status, shipping_status, delivery_method_name, subtotal_usd, shipping_usd, total_usd, created_at, order_items(id, product_slug, quantity, size, unit_price_usd)"
      )
      .eq("customer_profile_id", prepared.profile.id)
      .order("created_at", { ascending: false })
      .limit(12)
  ]);

  if (addressError) {
    return { ok: false as const, status: 500, reason: addressError.message };
  }

  if (orderError) {
    return { ok: false as const, status: 500, reason: orderError.message };
  }

  return {
    ok: true as const,
    profile: prepared.profile,
    addresses: (addresses ?? []).map((row) => mapAddress(row as AddressRow)),
    orders: (orders ?? []).map((row) => mapOrder(row as OrderRow))
  };
}

export async function updateCustomerProfile(user: AccountUser, input: z.infer<typeof accountProfileSchema>) {
  const prepared = await ensureCustomerProfile(user);

  if (!prepared.ok) {
    return prepared;
  }

  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, status: 503, reason: "Supabase is not configured yet." };
  }

  const { data, error } = await client
    .from("customer_profiles")
    .update({
      full_name: input.fullName || null,
      phone: input.phone || null,
      marketing_opt_in: Boolean(input.marketingOptIn),
      updated_at: new Date().toISOString()
    })
    .eq("id", prepared.profile.id)
    .select("id, email, full_name, phone, marketing_opt_in")
    .single();

  if (error || !data) {
    return { ok: false as const, status: 500, reason: error?.message ?? "Unable to update customer profile." };
  }

  return { ok: true as const, profile: mapProfile(data as ProfileRow) };
}

export async function createCustomerAddress(user: AccountUser, input: z.infer<typeof addressSchema>) {
  const prepared = await ensureCustomerProfile(user);

  if (!prepared.ok) {
    return prepared;
  }

  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, status: 503, reason: "Supabase is not configured yet." };
  }

  if (input.isDefault) {
    await client.from("customer_addresses").update({ is_default: false }).eq("customer_profile_id", prepared.profile.id);
  }

  const { data, error } = await client
    .from("customer_addresses")
    .insert({
      customer_profile_id: prepared.profile.id,
      label: input.label,
      recipient_name: input.recipientName || null,
      phone: input.phone || null,
      address_line1: input.addressLine1,
      address_line2: input.addressLine2 || null,
      city: input.city,
      state_region: input.stateRegion || null,
      postal_code: input.postalCode || null,
      country_code: input.countryCode.toUpperCase(),
      country_name: input.countryName,
      is_default: Boolean(input.isDefault)
    })
    .select(
      "id, label, recipient_name, phone, address_line1, address_line2, city, state_region, postal_code, country_code, country_name, is_default"
    )
    .single();

  if (error || !data) {
    return { ok: false as const, status: 500, reason: error?.message ?? "Unable to save address." };
  }

  return { ok: true as const, address: mapAddress(data as AddressRow) };
}

export async function deleteCustomerAddress(user: AccountUser, addressId: string) {
  const prepared = await ensureCustomerProfile(user);

  if (!prepared.ok) {
    return prepared;
  }

  const client = createSupabaseServiceClient();

  if (!client) {
    return { ok: false as const, status: 503, reason: "Supabase is not configured yet." };
  }

  const { error } = await client
    .from("customer_addresses")
    .delete()
    .eq("id", addressId)
    .eq("customer_profile_id", prepared.profile.id);

  if (error) {
    return { ok: false as const, status: 500, reason: error.message };
  }

  return { ok: true as const };
}
