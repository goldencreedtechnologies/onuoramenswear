import { createClient } from "@supabase/supabase-js";
import {
  products as localProducts,
  type Product,
  type ProductFamily
} from "@/data/catalog";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  hasSupabaseConfig
} from "@/lib/backend/env";
import type { StoreProduct } from "@/lib/backend/types";

const legacyProductColumns =
  "id, slug, name, edition, meaning, price, image, images, palette, page_text, page_muted, page_panel, dark_page, story, story_kicker, story_title, occasion, sort_order, updated_at";
const extendedProductColumns = `${legacyProductColumns}, family, color_name, color_value, model_name, details, fit, fabric_care, delivery`;

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
  family?: string | null;
  color_name?: string | null;
  color_value?: string | null;
  model_name?: string | null;
  details?: string | null;
  fit?: string | null;
  fabric_care?: string | null;
  delivery?: string | null;
  sort_order?: number;
  updated_at?: string;
};

function isProductFamily(value?: string | null): value is ProductFamily {
  return value === "original" || value === "button" || value === "buttonless";
}

function mapRow(row: ProductRow): StoreProduct {
  const local = localProducts.find((product) => product.slug === row.slug);

  if (local && !isProductFamily(row.family)) {
    return {
      ...local,
      price: row.price || local.price,
      id: row.id,
      sort_order: row.sort_order,
      updated_at: row.updated_at
    };
  }

  const fallback = local ?? localProducts[0];
  const family = isProductFamily(row.family) ? row.family : fallback.family;

  return {
    slug: row.slug,
    name: row.name,
    edition: row.edition,
    meaning: row.meaning,
    price: row.price,
    image: row.image,
    images: Array.isArray(row.images) && row.images.length ? row.images : [row.image],
    palette: row.palette,
    pageText: row.page_text,
    pageMuted: row.page_muted,
    pagePanel: row.page_panel,
    darkPage: Boolean(row.dark_page),
    story: row.story,
    storyKicker: row.story_kicker,
    storyTitle: row.story_title,
    occasion: row.occasion,
    family,
    colorName: row.color_name || fallback.colorName,
    colorValue: row.color_value || row.palette || fallback.colorValue,
    modelName: row.model_name || fallback.modelName,
    details: row.details || fallback.details,
    fit: row.fit || fallback.fit,
    fabricCare: row.fabric_care || fallback.fabricCare,
    delivery: row.delivery || fallback.delivery,
    id: row.id,
    sort_order: row.sort_order,
    updated_at: row.updated_at
  };
}

function mergeWithLocal(rows: ProductRow[]) {
  const rowBySlug = new Map(rows.map((row) => [row.slug, row]));
  const merged = localProducts.map((product, index) => {
    const row = rowBySlug.get(product.slug);
    rowBySlug.delete(product.slug);

    return row
      ? mapRow(row)
      : ({
          ...product,
          sort_order: index + 1
        } satisfies StoreProduct);
  });

  const databaseOnly = Array.from(rowBySlug.values()).map(mapRow);

  return [...merged, ...databaseOnly].sort(
    (a, b) =>
      (a.sort_order ?? Number.MAX_SAFE_INTEGER) -
      (b.sort_order ?? Number.MAX_SAFE_INTEGER)
  );
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

async function readRows() {
  const client = createReadClient();

  if (!client) {
    return null;
  }

  const extended = await client
    .from("products")
    .select(extendedProductColumns)
    .order("sort_order", { ascending: true });

  if (!extended.error) {
    return (extended.data ?? []) as unknown as ProductRow[];
  }

  const legacy = await client
    .from("products")
    .select(legacyProductColumns)
    .order("sort_order", { ascending: true });

  if (legacy.error) {
    return null;
  }

  return (legacy.data ?? []) as unknown as ProductRow[];
}

export async function getStoreProducts(): Promise<StoreProduct[]> {
  if (!hasSupabaseConfig()) {
    return localProducts;
  }

  const rows = await readRows();

  if (!rows?.length) {
    return localProducts;
  }

  return mergeWithLocal(rows);
}

export async function getStoreProductBySlug(slug: string): Promise<StoreProduct | null> {
  const products = await getStoreProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export function mergeProductWithLocal(
  product: Partial<Product> & Pick<Product, "slug">
): Product | null {
  const local = localProducts.find((item) => item.slug === product.slug);
  return local ? { ...local, ...product } : null;
}
