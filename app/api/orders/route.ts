import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Draft order creation has moved to /api/checkout so inventory reservations stay tied to payment." },
    { status: 410 }
  );
}
