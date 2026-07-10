import { createClient } from "@supabase/supabase-js";
import { products as localProducts } from "@/data/catalog";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabaseConfig } from "@/lib/backend/env";
import type { StoreProduct } from "@/lib/backend/types";

const productColumns =
  "id, slug, name, edition, meaning, price, image, images, palette, page_text, page_muted, page_panel, dark_page, story, story_kicker, story_title, occasion, sort_order, updated_at";

type ProductRow = {
  id?: string;
  slug: string;
  name: string;
  edition: string;
  meaning: string;
  price: string;
  image: string;
  images: string[] | null;
  palette: string;
  page_text: string;
  page_muted: string;
  page_panel: string;
  dark_page: boolean;
  story: string;
  story_kicker: string;
  story_title: string;
  occasion: string;
  sort_order?: number;
  updated_at?: string;
};

function mapRow(row: ProductRow): StoreProduct {
  return {
    slug: row.slug,
    name: row.name,
    edition: row.edition,
    meaning: row.meaning,
    price: row.price,
    image: row.image,
    images: Array.isArray(row.images) ? row.images : [row.image],
    palette: row.palette,
    pageText: row.page_text,
    pageMuted: row.page_muted,
    pagePanel: row.page_panel,
    darkPage: Boolean(row.dark_page),
    story: row.story,
    storyKicker: row.story_kicker,
    storyTitle: row.story_title,
    occasion: row.occasion,
    id: row.id,
    sort_order: row.sort_order,
    updated_at: row.updated_at
  };
}

function createReadClient() {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();

  if (!url || !publishableKey) {
    return null;
  }

  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function getStoreProducts(): Promise<StoreProduct[]> {
  if (!hasSupabaseConfig()) {
    return localProducts;
  }

  const client = createReadClient();

  if (!client) {
    return localProducts;
  }

  const { data, error } = await client.from("products").select(productColumns).order("sort_order", { ascending: true });

  if (error || !data?.length) {
    return localProducts;
  }

  return data.map(mapRow);
}

export async function getStoreProductBySlug(slug: string): Promise<StoreProduct | null> {
  if (!hasSupabaseConfig()) {
    return localProducts.find((product) => product.slug === slug) ?? null;
  }

  const client = createReadClient();

  if (!client) {
    return localProducts.find((product) => product.slug === slug) ?? null;
  }

  const { data, error } = await client.from("products").select(productColumns).eq("slug", slug).maybeSingle();

  if (error || !data) {
    return localProducts.find((product) => product.slug === slug) ?? null;
  }

  return mapRow(data);
}
