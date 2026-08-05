import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
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
import { DELIVERY_COPY, PRODUCT_INCLUSION_LABEL, PRODUCT_PRICES, PRODUCT_TYPE_LABEL } from "@/data/site-config";
import type { StoreProduct } from "@/lib/backend/types";

const legacyProductColumns =
  "id, slug, name, edition, meaning, price, image, images, palette, page_text, page_muted, page_panel, dark_page, story, story_kicker, story_title, occasion, sort_order, updated_at";
const extendedProductColumns = `${legacyProductColumns}, family, color_name, color_value, model_name, details, fit, fabric_care, delivery`;

const correctedColourImages: Partial<Record<string, string[]>> = {
  ndb6: [
    "/brand/products/button/ndb7/ndb7-front.png",
    "/brand/products/button/ndb7/ndb7-studio.png",
    "/brand/products/button/ndb7/ndb7-back.png"
  ],
  ndb7: [
    "/brand/products/button/ndb6/ndb6-front.png",
    "/brand/products/button/ndb6/ndb6-side.png",
    "/brand/products/button/ndb6/ndb6-back.png"
  ],
  nd6: [
    "/brand/products/buttonless/nd7/nd7-front.png",
    "/brand/products/buttonless/nd7/nd7-studio.png",
    "/brand/products/buttonless/nd7/nd7-back.png"
  ],
  nd7: [
    "/brand/products/buttonless/nd6/nd6-front.png",
    "/brand/products/buttonless/nd6/nd6-back.png"
  ]
};

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

function normalizeDetails(value: string) {
  if (value.includes(PRODUCT_TYPE_LABEL) || value.includes(PRODUCT_INCLUSION_LABEL)) return value;
  return `${PRODUCT_TYPE_LABEL}. ${PRODUCT_INCLUSION_LABEL}. ${value}`;
}

function normalizeFabricCare(value: string) {
  return value.replace(/\bpremium\s+/gi, "").replace(/\bluxury\s+/gi, "");
}

function correctColourImagery<T extends Pick<StoreProduct, "slug" | "image" | "images">>(product: T): T {
  const images = correctedColourImages[product.slug];
  return images ? { ...product, image: images[0], images } : product;
}

function mapRow(row: ProductRow): StoreProduct {
  const local = localProducts.find((product) => product.slug === row.slug);

  if (local && !isProductFamily(row.family)) {
    return correctColourImagery({
      ...local,
      price: `$${PRODUCT_PRICES.USD}`,
      id: row.id,
      sort_order: row.sort_order,
      updated_at: row.updated_at
    });
  }

  const fallback = local ?? localProducts[0];
  const family = isProductFamily(row.family) ? row.family : fallback.family;

  return correctColourImagery({
    slug: row.slug,
    name: row.name,
    edition: row.edition,
    meaning: row.meaning,
    price: `$${PRODUCT_PRICES.USD}`,
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
    details: normalizeDetails(row.details || fallback.details),
    fit: row.fit || fallback.fit,
    fabricCare: normalizeFabricCare(row.fabric_care || fallback.fabricCare),
    delivery: DELIVERY_COPY,
    id: row.id,
    sort_order: row.sort_order,
    updated_at: row.updated_at
  });
}

function mergeWithLocal(rows: ProductRow[]) {
  const rowBySlug = new Map(rows.map((row) => [row.slug, row]));
  const merged = localProducts.map((product, index) => {
    const row = rowBySlug.get(product.slug);
    rowBySlug.delete(product.slug);

    return row
      ? mapRow(row)
      : correctColourImagery({
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
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8_000) })
    }
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

async function loadStoreProducts(): Promise<StoreProduct[]> {
  if (!hasSupabaseConfig()) {
    return localProducts.map((product) => correctColourImagery(product));
  }

  const rows = await readRows();

  if (!rows?.length) {
    return localProducts.map((product) => correctColourImagery(product));
  }

  return mergeWithLocal(rows);
}

const getCachedStoreProducts = unstable_cache(loadStoreProducts, ["onuora-store-products"], {
  revalidate: 300,
  tags: ["products"]
});

export async function getStoreProducts(): Promise<StoreProduct[]> {
  return getCachedStoreProducts();
}

export async function getStoreProductBySlug(slug: string): Promise<StoreProduct | null> {
  const products = await getStoreProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export function mergeProductWithLocal(
  product: Partial<Product> & Pick<Product, "slug">
): Product | null {
  const local = localProducts.find((item) => item.slug === product.slug);
  return local
    ? correctColourImagery({
        ...local,
        ...product,
        price: `$${PRODUCT_PRICES.USD}`,
        details: normalizeDetails(product.details ?? local.details),
        fabricCare: normalizeFabricCare(product.fabricCare ?? local.fabricCare),
        delivery: DELIVERY_COPY
      })
    : null;
}
