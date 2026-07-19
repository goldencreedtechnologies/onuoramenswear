import crypto from "node:crypto";
import { getGoogleMapsServerApiKey, getMapboxAccessToken, getMapsProvider } from "@/lib/backend/env";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type RouteRequest = {
  origin: Coordinates;
  destination?: Coordinates;
  destinationAddress: string;
  destinationCity: string;
  destinationCountry: string;
};

export type RouteResult = {
  provider: "fallback" | "google" | "mapbox";
  distanceKm: number | null;
  durationSeconds: number | null;
  destination?: Coordinates;
  polyline?: string | null;
  mapUrl?: string | null;
  confidence: "exact" | "estimated" | "manual_review";
  note: string;
};

type GoogleDistanceMatrixResponse = {
  rows?: Array<{
    elements?: Array<{
      status?: string;
      distance?: { value?: number };
      duration?: { value?: number };
    }>;
  }>;
  status?: string;
};

type MapboxMatrixResponse = {
  distances?: number[][];
  durations?: number[][];
  code?: string;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(origin: Coordinates, destination: Coordinates) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const distance =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(distance), Math.sqrt(1 - distance));
}

function buildGoogleMapUrl(destination: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
}

export function getRouteCacheKey(input: RouteRequest) {
  return crypto
    .createHash("sha256")
    .update(
      [
        input.origin.latitude,
        input.origin.longitude,
        input.destination?.latitude ?? "",
        input.destination?.longitude ?? "",
        input.destinationAddress.trim().toLowerCase(),
        input.destinationCity.trim().toLowerCase(),
        input.destinationCountry.trim().toLowerCase()
      ].join("|")
    )
    .digest("hex");
}

async function getGoogleRoute(input: RouteRequest): Promise<RouteResult | null> {
  const key = getGoogleMapsServerApiKey();

  if (!key) {
    return null;
  }

  const destination =
    input.destination ??
    `${input.destinationAddress}, ${input.destinationCity}, ${input.destinationCountry}`;
  const origin = `${input.origin.latitude},${input.origin.longitude}`;
  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");

  url.searchParams.set("origins", origin);
  url.searchParams.set(
    "destinations",
    typeof destination === "string" ? destination : `${destination.latitude},${destination.longitude}`
  );
  url.searchParams.set("units", "metric");
  url.searchParams.set("key", key);

  const response = await fetch(url, { next: { revalidate: 60 * 60 } });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GoogleDistanceMatrixResponse;
  const element = data.rows?.[0]?.elements?.[0];

  if (data.status !== "OK" || element?.status !== "OK" || !element.distance?.value) {
    return null;
  }

  return {
    provider: "google",
    distanceKm: Number((element.distance.value / 1000).toFixed(2)),
    durationSeconds: element.duration?.value ?? null,
    destination: input.destination,
    polyline: null,
    mapUrl: buildGoogleMapUrl(`${input.destinationAddress}, ${input.destinationCity}, ${input.destinationCountry}`),
    confidence: "exact",
    note: "Live map distance was calculated for this delivery estimate."
  };
}

async function getMapboxRoute(input: RouteRequest): Promise<RouteResult | null> {
  const token = getMapboxAccessToken();

  if (!token || !input.destination) {
    return null;
  }

  const coordinates = `${input.origin.longitude},${input.origin.latitude};${input.destination.longitude},${input.destination.latitude}`;
  const url = new URL(`https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordinates}`);

  url.searchParams.set("annotations", "distance,duration");
  url.searchParams.set("access_token", token);

  const response = await fetch(url, { next: { revalidate: 60 * 60 } });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as MapboxMatrixResponse;
  const distanceMeters = data.distances?.[0]?.[1];

  if (data.code !== "Ok" || !distanceMeters) {
    return null;
  }

  return {
    provider: "mapbox",
    distanceKm: Number((distanceMeters / 1000).toFixed(2)),
    durationSeconds: data.durations?.[0]?.[1] ?? null,
    destination: input.destination,
    polyline: null,
    mapUrl: buildGoogleMapUrl(`${input.destination.latitude},${input.destination.longitude}`),
    confidence: "exact",
    note: "Live route distance was calculated for this delivery estimate."
  };
}

export async function resolveDeliveryRoute(input: RouteRequest): Promise<RouteResult> {
  const provider = getMapsProvider();

  if (provider === "google") {
    const route = await getGoogleRoute(input);

    if (route) {
      return route;
    }
  }

  if (provider === "mapbox") {
    const route = await getMapboxRoute(input);

    if (route) {
      return route;
    }
  }

  if (input.destination) {
    const distanceKm = Number(haversineDistanceKm(input.origin, input.destination).toFixed(2));

    return {
      provider: "fallback",
      distanceKm,
      durationSeconds: Math.round((distanceKm / 35) * 60 * 60),
      destination: input.destination,
      polyline: null,
      mapUrl: buildGoogleMapUrl(`${input.destination.latitude},${input.destination.longitude}`),
      confidence: "estimated",
      note: "Distance is estimated from coordinates until the live maps provider is connected."
    };
  }

  return {
    provider: "fallback",
    distanceKm: null,
    durationSeconds: null,
    polyline: null,
    mapUrl: buildGoogleMapUrl(`${input.destinationAddress}, ${input.destinationCity}, ${input.destinationCountry}`),
    confidence: "manual_review",
    note: "Add a maps provider key or customer coordinates to calculate route distance automatically."
  };
}
