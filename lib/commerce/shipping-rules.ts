export const shippingRules = {
  international: {
    rateUsd: 50,
    zoneCode: "GLOBAL_EXPORT",
    methodCode: "international-delivery",
    methodName: "International Delivery"
  },
  lagos: {
    rateUsd: 0,
    zoneCode: "LAGOS",
    methodCode: "lagos-delivery",
    methodName: "Lagos Delivery"
  },
  outsideLagos: {
    // The storefront's deterministic operating ratio displays this as ₦15,000.
    rateUsd: 15,
    zoneCode: "OUTSIDE_LAGOS",
    methodCode: "outside-lagos",
    methodName: "Outside Lagos"
  }
} as const;

const lagosLocalities = new Set([
  "agege",
  "ajah",
  "alimosho",
  "apapa",
  "badagry",
  "epe",
  "eti osa",
  "festac",
  "ibeju lekki",
  "ikeja",
  "ikorodu",
  "ikoyi",
  "isolo",
  "kosofe",
  "lagos",
  "lagos island",
  "lagos mainland",
  "lekki",
  "magodo",
  "maryland",
  "mushin",
  "ogba",
  "oshodi",
  "shomolu",
  "somolu",
  "surulere",
  "victoria island",
  "vi",
  "yaba"
]);

function normalizeLocation(value?: string) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[-_,.]+/g, " ")
    .replace(/\s+/g, " ");
}

function isNigeria(country: string) {
  const normalized = normalizeLocation(country);
  return normalized === "ng" || normalized === "nigeria";
}

export function isWithinLagos({
  shippingCountry,
  shippingCity,
  shippingState
}: {
  shippingCountry: string;
  shippingCity: string;
  shippingState?: string;
}) {
  if (!isNigeria(shippingCountry)) {
    return false;
  }

  const city = normalizeLocation(shippingCity);
  const state = normalizeLocation(shippingState);

  return state === "lagos" || state === "lagos state" || lagosLocalities.has(city);
}

export function resolveShippingRule({
  shippingCountry,
  shippingCity,
  shippingState
}: {
  shippingCountry: string;
  shippingCity: string;
  shippingState?: string;
  itemCount: number;
}) {
  if (!isNigeria(shippingCountry)) {
    return {
      ...shippingRules.international,
      shippingUsd: shippingRules.international.rateUsd,
      note: "The international flat rate has been applied."
    };
  }

  if (isWithinLagos({ shippingCountry, shippingCity, shippingState })) {
    return {
      ...shippingRules.lagos,
      shippingUsd: shippingRules.lagos.rateUsd,
      note: "Complimentary Lagos delivery has been applied."
    };
  }

  return {
    ...shippingRules.outsideLagos,
    shippingUsd: shippingRules.outsideLagos.rateUsd,
    note: "The single outside-Lagos flat rate has been applied."
  };
}
