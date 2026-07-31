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

const euroLanguagePrefixes = new Set([
  "de",
  "fr",
  "it",
  "es",
  "pt",
  "nl",
  "be",
  "at",
  "ie",
  "fi",
  "el",
  "sk",
  "sl",
  "et",
  "lv",
  "lt",
  "mt",
  "cy",
  "hr",
  "lu"
]);

export function detectSuggestedCurrency(languages: readonly string[], timeZone?: string) {
  const normalized = languages.map((language) => language.toLowerCase());

  if (normalized.some((language) => language === "en-ng" || language.endsWith("-ng"))) {
    return "NGN" as const;
  }

  if (normalized.some((language) => language === "en-gb" || language.endsWith("-gb"))) {
    return "GBP" as const;
  }

  if (normalized.some((language) => language === "en-us" || language.endsWith("-us"))) {
    return "USD" as const;
  }

  if (
    normalized.some((language) => euroLanguagePrefixes.has(language.split("-")[0])) ||
    timeZone?.startsWith("Europe/")
  ) {
    return timeZone === "Europe/London" ? ("GBP" as const) : ("EUR" as const);
  }

  if (timeZone === "Africa/Lagos") {
    return "NGN" as const;
  }

  return "USD" as const;
}

export const PRODUCT_TYPE_LABEL = "Complete Two-Piece Outfit";
export const PRODUCT_INCLUSION_LABEL = "Top And Trousers Included";

export const ADDITIONAL_PRODUCT_COLOURS = [
  { id: "burnt-orange", name: "Burnt Orange", value: "#D9582E" },
  { id: "pale-beige", name: "Pale Beige", value: "#DBAC76" },
  { id: "royal-blue", name: "Royal Blue", value: "#06058C" }
] as const;

export type AdditionalProductColour = (typeof ADDITIONAL_PRODUCT_COLOURS)[number];

export function isAdditionalProductColour(name: string, value?: string) {
  return ADDITIONAL_PRODUCT_COLOURS.some(
    (colour) =>
      colour.name.toLowerCase() === name.trim().toLowerCase() &&
      (!value || colour.value.toLowerCase() === value.trim().toLowerCase())
  );
}

export const DELIVERY_COPY =
  "Prepared for dispatch within three working days. Worldwide delivery is available. International delivery is charged at a $50 flat rate, Lagos delivery is complimentary for valid addresses, and delivery outside Lagos is charged at a single ₦15,000 flat rate.";

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
      discountPercent: 50
    },
    "buy-five-sixth-free": {
      enabled: false,
      title: "Buy Five Outfits And Receive A Sixth Outfit Free",
      qualifyingQuantity: 6,
      discountedQuantity: 1,
      discountPercent: 100
    }
  }
} as const;

export function promotionDiscountForQuantity(quantity: number, currency: CurrencyCode) {
  const campaign = PROMOTIONS.campaigns[PROMOTIONS.activeCampaign];
  if (!campaign.enabled || quantity < campaign.qualifyingQuantity) return 0;

  const qualifyingGroups = Math.floor(quantity / campaign.qualifyingQuantity);
  return Math.round(
    qualifyingGroups *
      campaign.discountedQuantity *
      PRODUCT_PRICES[currency] *
      (campaign.discountPercent / 100)
  );
}
