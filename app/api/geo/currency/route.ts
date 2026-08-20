import { NextResponse } from "next/server";
import { countryFromRequestHeaders, currencyForCountry } from "@/lib/currency/country";

export function GET(request: Request) {
  const country = countryFromRequestHeaders(request.headers);
  const currency = currencyForCountry(country);

  return NextResponse.json(
    { currency },
    {
      headers: {
        "Cache-Control": "private, no-store"
      }
    }
  );
}
