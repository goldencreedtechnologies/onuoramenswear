export type CollectionFamily = "original" | "button" | "buttonless";

export const BRAND = {
  name: "ỌNUỌRA Menswear",
  positioning: "Contemporary African Menswear",
  supportingLine: "Designed And Made In Nigeria For A Global Wardrobe."
} as const;

export const COLLECTIONS = [
  {
    id: "heritage",
    family: "original" as CollectionFamily,
    legacyHash: "original",
    englishName: "Heritage Collection",
    igboName: "Nkwọ",
    navigationLabel: "Heritage Collection",
    description:
      "A contemporary interpretation of the original ỌNUỌRA silhouette, defined by its signature three-quarter sleeve."
  },
  {
    id: "cowrie",
    family: "button" as CollectionFamily,
    legacyHash: "with-button",
    englishName: "Cowrie Collection",
    igboName: "Ọzọ",
    navigationLabel: "Cowrie Collection",
    description:
      "A refined contemporary silhouette distinguished by signature cowrie detailing."
  },
  {
    id: "resort",
    family: "buttonless" as CollectionFamily,
    legacyHash: "without-button",
    englishName: "Resort Collection",
    igboName: "Uzọ",
    navigationLabel: "Resort Collection",
    description:
      "A clean collarless silhouette designed for relaxed, effortless dressing."
  }
] as const;

export function getCollectionByFamily(family: CollectionFamily) {
  return COLLECTIONS.find((collection) => collection.family === family) ?? COLLECTIONS[0];
}

/**
 * Product slugs are implementation identifiers. They must never become the
 * label a customer or the house sees on an order.
 */
export function getCollectionByProductSlug(slug: string) {
  const normalized = slug.trim().toLowerCase();
  if (normalized.startsWith("ndb")) return getCollectionByFamily("button");
  if (/^nd\d+$/i.test(normalized)) return getCollectionByFamily("buttonless");
  return getCollectionByFamily("original");
}

export function getOrderItemCollectionLabel(slug: string) {
  return getCollectionByProductSlug(slug).englishName;
}

export function formatOrderItemLabel(input: { productSlug: string; colour?: string | null; size?: string | null }) {
  const collection = getCollectionByProductSlug(input.productSlug).englishName;
  return [collection, input.colour?.trim() || "Selected Colour", input.size?.trim() || "Selected Size"].join(" — ");
}

export type CurrencyCode = "NGN" | "GBP" | "USD" | "EUR";

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ["NGN", "GBP", "USD", "EUR"];

export const PRODUCT_PRICES: Record<CurrencyCode, number> = {
  NGN: 120000,
  GBP: 90,
  USD: 120,
  EUR: 100
};

export const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  NGN: "en-NG",
  GBP: "en-GB",
  USD: "en-US",
  EUR: "en-IE"
};

export const CURRENCY_PREFERENCE_KEY = "onuora-currency";

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return SUPPORTED_CURRENCIES.includes(value as CurrencyCode);
}

export function formatCurrency(currency: CurrencyCode, amount: number) {
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0
  }).format(amount);
}

export type ProductPriceOverride = Partial<Record<CurrencyCode, number>>;

export function fixedProductPrice(currency: CurrencyCode, override?: ProductPriceOverride) {
  return override?.[currency] ?? PRODUCT_PRICES[currency];
}

export function fixedProductPriceLabel(currency: CurrencyCode, quantity = 1) {
  return formatCurrency(currency, fixedProductPrice(currency) * quantity);
}

export function operationalUsdAmountInCurrency(amountUsd: number, currency: CurrencyCode) {
  return Math.round((amountUsd * PRODUCT_PRICES[currency]) / PRODUCT_PRICES.USD);
}

export const PRODUCT_TYPE_LABEL = "Complete Two-Piece Outfit";
export const PRODUCT_INCLUSION_LABEL = "Top And Trousers Included";

export type AdditionalProductColour = { id: string; name: string; value: string };
export const ADDITIONAL_PRODUCT_COLOURS: AdditionalProductColour[] = [];

export function isAdditionalProductColour(name: string, value?: string) {
  return ADDITIONAL_PRODUCT_COLOURS.some(
    (colour) => colour.name.toLowerCase() === name.trim().toLowerCase() && (!value || colour.value.toLowerCase() === value.trim().toLowerCase())
  );
}

export const DELIVERY_COPY =
  "Prepared for dispatch within three working days. Tracked delivery across Nigeria and worldwide. Shipping is calculated according to your destination and the number of outfits ordered.";

export function announcementCopy(_currency: CurrencyCode) {
  return "Prepared for Dispatch Within Three Working Days | Worldwide Delivery";
}

export const PROMOTIONS = {
  activeCampaign: "buy-two-half-third" as const,
  campaigns: {
    "buy-two-half-third": {
      enabled: true,
      title: "Buy Two Outfits And Receive 50% Off A Third Outfit",
      qualifyingQuantity: 3,
      discountedQuantity: 1,
      discountPercent: 50,
      supportsMultipleGroups: true
    },
    "buy-five-sixth-free": {
      enabled: false,
      title: "Buy Five Outfits And Receive A Sixth Outfit Free",
      qualifyingQuantity: 6,
      discountedQuantity: 1,
      discountPercent: 100,
      supportsMultipleGroups: false
    }
  }
} as const;

export function promotionDiscountForQuantity(quantity: number, currency: CurrencyCode) {
  const campaign = PROMOTIONS.campaigns[PROMOTIONS.activeCampaign];
  if (!campaign.enabled || quantity < campaign.qualifyingQuantity) return 0;
  const groups = campaign.supportsMultipleGroups ? Math.floor(quantity / campaign.qualifyingQuantity) : 1;
  return Math.round(groups * campaign.discountedQuantity * PRODUCT_PRICES[currency] * (campaign.discountPercent / 100));
}
