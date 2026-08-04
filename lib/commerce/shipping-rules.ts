import type { CurrencyCode } from "@/data/site-config";

export type ShippingBand = {
  zoneCode: "NG_DOMESTIC" | "GLOBAL_EXPORT";
  methodCode: string;
  methodName: string;
  label: string;
  displayCurrency: CurrencyCode;
  displayAmount: number | null;
  shippingUsd: number;
  requiresManualQuote: boolean;
  note: string;
};

const internationalRates: Record<CurrencyCode, readonly [number, number, number]> = {
  USD: [60, 90, 120],
  GBP: [50, 75, 100],
  EUR: [55, 80, 110],
  NGN: [100000, 150000, 200000]
};

function normalizeLocation(value?: string) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[-_,.]+/g, " ")
    .replace(/\s+/g, " ");
}

export function isNigeriaDestination(country: string) {
  const normalized = normalizeLocation(country);
  return normalized === "ng" || normalized === "nigeria";
}

export function shippingBandIndex(outfitCount: number) {
  if (outfitCount <= 2) return 0;
  if (outfitCount <= 4) return 1;
  if (outfitCount <= 6) return 2;
  return -1;
}

export function resolveShippingRule({
  shippingCountry,
  itemCount,
  currency = "USD"
}: {
  shippingCountry: string;
  shippingCity?: string;
  shippingState?: string;
  itemCount: number;
  currency?: CurrencyCode;
}): ShippingBand {
  const outfits = Math.max(1, Math.floor(itemCount));

  if (outfits >= 7) {
    return {
      zoneCode: isNigeriaDestination(shippingCountry) ? "NG_DOMESTIC" : "GLOBAL_EXPORT",
      methodCode: "manual-delivery-quote",
      methodName: "Delivery Quotation Required",
      label: "7+ Outfits",
      displayCurrency: isNigeriaDestination(shippingCountry) ? "NGN" : currency,
      displayAmount: null,
      shippingUsd: 0,
      requiresManualQuote: true,
      note: "Please contact Client Care for a delivery quotation on orders of seven outfits or more."
    };
  }

  if (isNigeriaDestination(shippingCountry)) {
    return {
      zoneCode: "NG_DOMESTIC",
      methodCode: "nigeria-delivery",
      methodName: "Delivery Within Nigeria",
      label: "Delivery Within Nigeria (1–6 Outfits)",
      displayCurrency: "NGN",
      displayAmount: 15000,
      shippingUsd: 15,
      requiresManualQuote: false,
      note: "A flat delivery fee of ₦15,000 applies to online orders of up to six outfits."
    };
  }

  const index = shippingBandIndex(outfits);
  const lower = index === 0 ? 1 : index === 1 ? 3 : 5;
  const upper = index === 0 ? 2 : index === 1 ? 4 : 6;
  const usdRates = internationalRates.USD;

  return {
    zoneCode: "GLOBAL_EXPORT",
    methodCode: `international-${lower}-${upper}`,
    methodName: `International Delivery (${lower}–${upper} Outfits)`,
    label: `International Delivery (${lower}–${upper} Outfits)`,
    displayCurrency: currency,
    displayAmount: internationalRates[currency][index],
    shippingUsd: usdRates[index],
    requiresManualQuote: false,
    note: "International shipping is charged according to the number of outfits ordered."
  };
}

export function shippingIncreaseForNextOutfit({
  shippingCountry,
  itemCount,
  currency
}: {
  shippingCountry: string;
  itemCount: number;
  currency: CurrencyCode;
}) {
  const current = resolveShippingRule({ shippingCountry, itemCount, currency });
  const next = resolveShippingRule({ shippingCountry, itemCount: itemCount + 1, currency });

  if (current.requiresManualQuote || next.requiresManualQuote || current.displayCurrency !== next.displayCurrency) {
    return null;
  }

  return Math.max(0, (next.displayAmount ?? 0) - (current.displayAmount ?? 0));
}
