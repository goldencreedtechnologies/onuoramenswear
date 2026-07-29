export const shippingRules = {
  lagos: {
    rateUsd: 0,
    zoneCode: "LAGOS",
    methodCode: "complimentary-lagos",
    methodName: "Complimentary Lagos delivery"
  },
  outsideLagos: {
    multiItemMinimum: 2,
    standardRateUsd: 50,
    multiItemRateUsd: 25,
    zoneCode: "OUTSIDE_LAGOS",
    methodCode: "outside-lagos",
    methodName: "Outside Lagos delivery"
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
  shippingState,
  itemCount
}: {
  shippingCountry: string;
  shippingCity: string;
  shippingState?: string;
  itemCount: number;
}) {
  if (isWithinLagos({ shippingCountry, shippingCity, shippingState })) {
    return {
      ...shippingRules.lagos,
      shippingUsd: shippingRules.lagos.rateUsd,
      note: "Complimentary shipping has been applied for this Lagos delivery."
    };
  }

  const qualifiesForMultiItemRate = itemCount >= shippingRules.outsideLagos.multiItemMinimum;
  const shippingUsd = qualifiesForMultiItemRate
    ? shippingRules.outsideLagos.multiItemRateUsd
    : shippingRules.outsideLagos.standardRateUsd;

  return {
    ...shippingRules.outsideLagos,
    shippingUsd,
    note: qualifiesForMultiItemRate
      ? "The reduced outside-Lagos rate has been applied for an order of two or more outfits."
      : "The standard outside-Lagos rate has been applied."
  };
}
