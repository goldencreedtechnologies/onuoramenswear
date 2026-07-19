import { NextResponse } from "next/server";
import { createDeliveryQuote, deliveryQuoteRequestSchema } from "@/lib/backend/delivery";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = deliveryQuoteRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid delivery quote payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const quote = await createDeliveryQuote(parsed.data);

  return NextResponse.json({ ok: true, quote });
}
