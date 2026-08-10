import { NextResponse } from "next/server";
import { getTrackingLookup, trackingLookupSchema } from "@/lib/backend/tracking";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = trackingLookupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the tracking ID and email address used for the order." }, { status: 400 });
  }

  const result = await getTrackingLookup(parsed.data);
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 404 });

  return NextResponse.json({ ok: true, tracking: result.tracking });
}
