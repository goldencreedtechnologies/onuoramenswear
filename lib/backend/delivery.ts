import { z } from "zod";
import { resolveDeliveryRoute, type Coordinates, type RouteResult } from "@/lib/backend/maps";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";

const countryAliases: Record<string, string> = {
  nigeria: "NG",
  ng: "NG",
  "united states": "US",
  usa: "US",
  us: "US",
  "united kingdom": "GB",
  uk: "GB",
  gb: "GB",
  ghana: "GH",
  gh: "GH",
  canada: "CA",
  ca: "CA"
};

const cityPremiums: Record<string, number> = {
  lagos: 8,
  abuja: 10,
  "port harcourt": 12,
  "new york": 24,
  london: 22,
  accra: 18,
  toronto: 26
};

type DeliveryOrigin = {
  id: string | null;
  code: string;
  name: string;
  addressLine1: string;
  city: string;
  stateRegion: string | null;
  countryCode: string;
  coordinates: Coordinates;
};

const fallbackOrigin: DeliveryOrigin = {
  id: null,
  code: "lagos-studio",
  name: "ONUORA Lagos fulfilment studio",
  addressLine1: "Fulfilment address pending",
  city: "Lagos",
  stateRegion: "Lagos",
  countryCode: "NG",
  coordinates: {
    latitude: 6.5244,
    longitude: 3.3792
  }
};

export const deliveryQuoteRequestSchema = z.object({
  email: z.string().email().optional(),
  shippingCountry: z.string().min(2),
  shippingCity: z.string().min(2),
  shippingAddress: z.string().min(4),
  shippingState: z.string().optional(),
  postalCode: z.string().optional(),
  destinationLatitude: z.number().min(-90).max(90).optional(),
  destinationLongitude: z.number().min(-180).max(180).optional(),
  itemCount: z.number().int().positive().default(1),
  subtotalUsd: z.number().nonnegative().default(0)
});

export type DeliveryQuoteRequest = z.infer<typeof deliveryQuoteRequestSchema>;

export type DeliveryQuote = {
  id?: string;
  zoneCode: string;
  methodCode: string;
  methodName: string;
  carrierCode?: string | null;
  shippingUsd: number;
  currency: "USD";
  estimatedMinDays: number;
  estimatedMaxDays: number;
  distanceKm: number | null;
  durationSeconds: number | null;
  routeProvider: RouteResult["provider"] | "manual";
  routeConfidence: RouteResult["confidence"];
  mapUrl: string | null;
  source: "fallback" | "supabase" | "google" | "mapbox";
  requiresManualReview: boolean;
  note: string;
};

type DeliveryMethod = {
  id: string | null;
  zoneCode: string;
  code: string;
  name: string;
  provider: string;
  baseRateUsd: number;
  perItemRateUsd: number;
  perKmRateUsd: number;
  minimumRateUsd: number | null;
  maximumRateUsd: number | null;
  freeShippingThresholdUsd: number | null;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  requiresDistance: boolean;
  carrierCode: string | null;
};

type DeliveryQuoteRow = {
  id: string;
  shipping_country?: string;
  shipping_city?: string;
  shipping_state?: string | null;
  shipping_postal_code?: string | null;
  shipping_address?: string;
  item_count?: number;
  subtotal_usd?: number;
  delivery_zone_code: string;
  delivery_method_code: string;
  delivery_method_name: string;
  carrier_code: string | null;
  shipping_usd: number;
  currency: string;
  estimated_min_days: number;
  estimated_max_days: number;
  distance_km: number | null;
  route_provider: string | null;
  route_duration_seconds: number | null;
  route_confidence: string | null;
  map_url: string | null;
  quote_source: string;
  requires_manual_review: boolean;
  note: string;
};

type DeliveryZoneRow = {
  code: string;
  country_codes: string[];
  city_patterns: string[];
  base_rate_usd: number;
  per_item_rate_usd: number;
  estimated_min_days: number;
  estimated_max_days: number;
};

type DeliveryMethodRow = {
  id: string;
  zone_code: string;
  code: string;
  name: string;
  provider: string;
  base_rate_usd: number;
  per_item_rate_usd: number;
  per_km_rate_usd: number | null;
  minimum_rate_usd: number | null;
  maximum_rate_usd: number | null;
  free_shipping_threshold_usd: number | null;
  estimated_min_days: number;
  estimated_max_days: number;
  requires_distance: boolean;
  carrier_code: string | null;
};

type DeliveryOriginRow = {
  id: string;
  code: string;
  name: string;
  address_line1: string;
  city: string;
  state_region: string | null;
  country_code: string;
  latitude: number;
  longitude: number;
};

function normalizeCountry(country: string) {
  const clean = country.trim().toLowerCase();
  return countryAliases[clean] ?? country.trim().toUpperCase().slice(0, 2);
}

function normalizeCity(city: string) {
  return city.trim().toLowerCase();
}

function normalizeQuoteText(value?: string | null) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function quoteMatchesInput(row: DeliveryQuoteRow, input: DeliveryQuoteRequest) {
  return (
    normalizeCountry(row.shipping_country ?? "") === normalizeCountry(input.shippingCountry) &&
    normalizeQuoteText(row.shipping_city) === normalizeQuoteText(input.shippingCity) &&
    normalizeQuoteText(row.shipping_state) === normalizeQuoteText(input.shippingState) &&
    normalizeQuoteText(row.shipping_postal_code) === normalizeQuoteText(input.postalCode) &&
    normalizeQuoteText(row.shipping_address) === normalizeQuoteText(input.shippingAddress) &&
    Number(row.item_count) === input.itemCount &&
    Math.abs(Number(row.subtotal_usd) - input.subtotalUsd) < 0.01
  );
}

function asCoordinates(input: DeliveryQuoteRequest): Coordinates | undefined {
  if (typeof input.destinationLatitude !== "number" || typeof input.destinationLongitude !== "number") {
    return undefined;
  }

  return {
    latitude: input.destinationLatitude,
    longitude: input.destinationLongitude
  };
}

function fallbackMethod(input: DeliveryQuoteRequest): DeliveryMethod {
  const countryCode = normalizeCountry(input.shippingCountry);
  const city = normalizeCity(input.shippingCity);
  const extraItems = Math.max(input.itemCount - 1, 0);

  if (countryCode === "NG") {
    const cityRate = cityPremiums[city] ?? 14;

    return {
      id: null,
      zoneCode: "NG_DOMESTIC",
      code: "premium-local",
      name: "Premium local delivery",
      provider: "manual",
      baseRateUsd: cityRate,
      perItemRateUsd: 2,
      perKmRateUsd: 0.14,
      minimumRateUsd: cityRate + extraItems * 2,
      maximumRateUsd: 28,
      freeShippingThresholdUsd: null,
      estimatedMinDays: city === "lagos" ? 1 : 2,
      estimatedMaxDays: city === "lagos" ? 2 : 4,
      requiresDistance: true,
      carrierCode: "manual-local"
    };
  }

  const premiumRate = cityPremiums[city];

  return {
    id: null,
    zoneCode: "GLOBAL_EXPORT",
    code: "international-express",
    name: "International express delivery",
    provider: "manual",
    baseRateUsd: premiumRate ?? (["US", "GB", "CA", "GH"].includes(countryCode) ? 30 : 42),
    perItemRateUsd: 4,
    perKmRateUsd: 0,
    minimumRateUsd: null,
    maximumRateUsd: null,
    freeShippingThresholdUsd: 500,
    estimatedMinDays: ["US", "GB", "CA", "GH"].includes(countryCode) ? 4 : 6,
    estimatedMaxDays: ["US", "GB", "CA", "GH"].includes(countryCode) ? 8 : 12,
    requiresDistance: false,
    carrierCode: "manual-global"
  };
}

function mapQuoteRow(row: DeliveryQuoteRow): DeliveryQuote {
  const source = ["google", "mapbox", "supabase"].includes(row.quote_source) ? row.quote_source : "fallback";
  const routeProvider = ["google", "mapbox", "fallback"].includes(row.route_provider ?? "")
    ? (row.route_provider as RouteResult["provider"])
    : "manual";
  const routeConfidence = ["exact", "estimated", "manual_review"].includes(row.route_confidence ?? "")
    ? (row.route_confidence as RouteResult["confidence"])
    : "manual_review";

  return {
    id: row.id,
    zoneCode: row.delivery_zone_code,
    methodCode: row.delivery_method_code,
    methodName: row.delivery_method_name,
    carrierCode: row.carrier_code,
    shippingUsd: Number(row.shipping_usd),
    currency: "USD",
    estimatedMinDays: row.estimated_min_days,
    estimatedMaxDays: row.estimated_max_days,
    distanceKm: row.distance_km === null ? null : Number(row.distance_km),
    durationSeconds: row.route_duration_seconds,
    routeProvider,
    routeConfidence,
    mapUrl: row.map_url,
    source: source as DeliveryQuote["source"],
    requiresManualReview: row.requires_manual_review,
    note: row.note
  };
}

async function getPrimaryDeliveryOrigin(): Promise<DeliveryOrigin> {
  const client = createSupabaseServiceClient();

  if (!client) {
    return fallbackOrigin;
  }

  const { data, error } = await client
    .from("delivery_origins")
    .select("id, code, name, address_line1, city, state_region, country_code, latitude, longitude")
    .eq("active", true)
    .order("primary_origin", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return fallbackOrigin;
  }

  const row = data as DeliveryOriginRow;

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    addressLine1: row.address_line1,
    city: row.city,
    stateRegion: row.state_region,
    countryCode: row.country_code,
    coordinates: {
      latitude: Number(row.latitude),
      longitude: Number(row.longitude)
    }
  };
}

function matchesZone(zone: DeliveryZoneRow, countryCode: string, city: string) {
  const matchesCountry = zone.country_codes.includes(countryCode);
  const matchesCity = !zone.city_patterns.length || zone.city_patterns.some((pattern) => city.includes(pattern));

  return matchesCountry && matchesCity;
}

function mapMethod(row: DeliveryMethodRow, zone: DeliveryZoneRow): DeliveryMethod {
  return {
    id: row.id,
    zoneCode: row.zone_code,
    code: row.code,
    name: row.name,
    provider: row.provider,
    baseRateUsd: Number(row.base_rate_usd ?? zone.base_rate_usd),
    perItemRateUsd: Number(row.per_item_rate_usd ?? zone.per_item_rate_usd),
    perKmRateUsd: Number(row.per_km_rate_usd ?? 0),
    minimumRateUsd: row.minimum_rate_usd === null ? null : Number(row.minimum_rate_usd),
    maximumRateUsd: row.maximum_rate_usd === null ? null : Number(row.maximum_rate_usd),
    freeShippingThresholdUsd:
      row.free_shipping_threshold_usd === null ? null : Number(row.free_shipping_threshold_usd),
    estimatedMinDays: row.estimated_min_days ?? zone.estimated_min_days,
    estimatedMaxDays: row.estimated_max_days ?? zone.estimated_max_days,
    requiresDistance: row.requires_distance,
    carrierCode: row.carrier_code
  };
}

async function getConfiguredDeliveryMethod(input: DeliveryQuoteRequest): Promise<DeliveryMethod | null> {
  const client = createSupabaseServiceClient();

  if (!client) {
    return null;
  }

  const countryCode = normalizeCountry(input.shippingCountry);
  const city = normalizeCity(input.shippingCity);
  const { data: zones, error: zoneError } = await client
    .from("delivery_zones")
    .select("code, country_codes, city_patterns, base_rate_usd, per_item_rate_usd, estimated_min_days, estimated_max_days")
    .eq("active", true);

  if (zoneError || !zones?.length) {
    return null;
  }

  const zone = (zones as DeliveryZoneRow[]).find((entry) => matchesZone(entry, countryCode, city));

  if (!zone) {
    return null;
  }

  const { data: methods, error: methodError } = await client
    .from("delivery_methods")
    .select(
      "id, zone_code, code, name, provider, base_rate_usd, per_item_rate_usd, per_km_rate_usd, minimum_rate_usd, maximum_rate_usd, free_shipping_threshold_usd, estimated_min_days, estimated_max_days, requires_distance, carrier_code"
    )
    .eq("zone_code", zone.code)
    .eq("active", true)
    .order("base_rate_usd", { ascending: true })
    .limit(1);

  if (methodError || !methods?.length) {
    return null;
  }

  return mapMethod(methods[0] as DeliveryMethodRow, zone);
}

function calculateShippingUsd(input: DeliveryQuoteRequest, method: DeliveryMethod, route: RouteResult) {
  if (method.freeShippingThresholdUsd && input.subtotalUsd >= method.freeShippingThresholdUsd) {
    return 0;
  }

  const extraItems = Math.max(input.itemCount - 1, 0);
  const distanceFee = route.distanceKm && method.perKmRateUsd > 0 ? route.distanceKm * method.perKmRateUsd : 0;
  const rawRate = method.baseRateUsd + extraItems * method.perItemRateUsd + distanceFee;
  const withMinimum = method.minimumRateUsd === null ? rawRate : Math.max(rawRate, method.minimumRateUsd);
  const withMaximum = method.maximumRateUsd === null ? withMinimum : Math.min(withMinimum, method.maximumRateUsd);

  return Number(withMaximum.toFixed(2));
}

export async function createDeliveryQuote(input: DeliveryQuoteRequest) {
  const parsed = deliveryQuoteRequestSchema.parse(input);
  const method = (await getConfiguredDeliveryMethod(parsed)) ?? fallbackMethod(parsed);
  const origin = await getPrimaryDeliveryOrigin();
  const route = await resolveDeliveryRoute({
    origin: origin.coordinates,
    destination: asCoordinates(parsed),
    destinationAddress: parsed.shippingAddress,
    destinationCity: parsed.shippingCity,
    destinationCountry: parsed.shippingCountry
  });
  const shippingUsd = calculateShippingUsd(parsed, method, route);
  const requiresManualReview =
    route.confidence === "manual_review" || (method.requiresDistance && route.distanceKm === null);
  const source = route.provider === "google" || route.provider === "mapbox" ? route.provider : method.id ? "supabase" : "fallback";
  const quote: DeliveryQuote = {
    zoneCode: method.zoneCode,
    methodCode: method.code,
    methodName: method.name,
    carrierCode: method.carrierCode,
    shippingUsd,
    currency: "USD",
    estimatedMinDays: method.estimatedMinDays,
    estimatedMaxDays: method.estimatedMaxDays,
    distanceKm: route.distanceKm,
    durationSeconds: route.durationSeconds,
    routeProvider: route.provider,
    routeConfidence: route.confidence,
    mapUrl: route.mapUrl ?? null,
    source,
    requiresManualReview,
    note:
      shippingUsd === 0 && method.freeShippingThresholdUsd
        ? "Complimentary global delivery has been applied to this private order."
        : route.note
  };
  const client = createSupabaseServiceClient();

  if (!client) {
    return quote;
  }

  const { data, error } = await client
    .from("delivery_quotes")
    .insert({
      delivery_method_id: method.id,
      origin_id: origin.id,
      email: parsed.email ?? null,
      shipping_country: parsed.shippingCountry,
      shipping_city: parsed.shippingCity,
      shipping_state: parsed.shippingState ?? null,
      shipping_postal_code: parsed.postalCode ?? null,
      shipping_address: parsed.shippingAddress,
      destination_latitude: parsed.destinationLatitude ?? null,
      destination_longitude: parsed.destinationLongitude ?? null,
      origin_code: origin.code,
      origin_city: origin.city,
      origin_country_code: origin.countryCode,
      origin_latitude: origin.coordinates.latitude,
      origin_longitude: origin.coordinates.longitude,
      item_count: parsed.itemCount,
      subtotal_usd: parsed.subtotalUsd,
      delivery_zone_code: quote.zoneCode,
      delivery_method_code: quote.methodCode,
      delivery_method_name: quote.methodName,
      carrier_code: quote.carrierCode,
      shipping_usd: quote.shippingUsd,
      currency: quote.currency,
      estimated_min_days: quote.estimatedMinDays,
      estimated_max_days: quote.estimatedMaxDays,
      distance_km: quote.distanceKm,
      route_provider: quote.routeProvider,
      route_distance_meters: quote.distanceKm === null ? null : Math.round(quote.distanceKm * 1000),
      route_duration_seconds: quote.durationSeconds,
      route_confidence: quote.routeConfidence,
      map_url: quote.mapUrl,
      quote_source: quote.source,
      requires_manual_review: quote.requiresManualReview,
      note: quote.note,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    })
    .select(
      "id, delivery_zone_code, delivery_method_code, delivery_method_name, carrier_code, shipping_usd, currency, estimated_min_days, estimated_max_days, distance_km, route_provider, route_duration_seconds, route_confidence, map_url, quote_source, requires_manual_review, note"
    )
    .single();

  if (error || !data) {
    return quote;
  }

  return mapQuoteRow(data as DeliveryQuoteRow);
}

export async function getDeliveryQuoteById(id: string, expectedInput?: DeliveryQuoteRequest) {
  const client = createSupabaseServiceClient();

  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from("delivery_quotes")
    .select(
      "id, shipping_country, shipping_city, shipping_state, shipping_postal_code, shipping_address, item_count, subtotal_usd, delivery_zone_code, delivery_method_code, delivery_method_name, carrier_code, shipping_usd, currency, estimated_min_days, estimated_max_days, distance_km, route_provider, route_duration_seconds, route_confidence, map_url, quote_source, requires_manual_review, note"
    )
    .eq("id", id)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as DeliveryQuoteRow;

  if (expectedInput && !quoteMatchesInput(row, expectedInput)) {
    return null;
  }

  return mapQuoteRow(row);
}

export async function resolveDeliveryQuote(input: DeliveryQuoteRequest & { deliveryQuoteId?: string }) {
  if (input.deliveryQuoteId) {
    const storedQuote = await getDeliveryQuoteById(input.deliveryQuoteId, input);

    if (storedQuote) {
      return storedQuote;
    }
  }

  return createDeliveryQuote(input);
}
