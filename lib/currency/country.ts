import type { CurrencyCode } from "@/data/site-config";

const eurozoneAndEuropeanUnionCountries = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"
]);

export function currencyForCountry(countryCode: string | null | undefined): CurrencyCode {
  const country = countryCode?.trim().toUpperCase();

  if (country === "NG") return "NGN";
  if (country === "GB") return "GBP";
  if (country === "US") return "USD";
  if (country && eurozoneAndEuropeanUnionCountries.has(country)) return "EUR";

  return "USD";
}

export function countryFromRequestHeaders(headers: Headers) {
  return (
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country-code") ??
    null
  );
}
