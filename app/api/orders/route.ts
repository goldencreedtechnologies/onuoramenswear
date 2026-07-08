import { NextResponse } from "next/server";
import { checkoutDraftSchema, createOrder } from "@/lib/backend/orders";
import { hasSupabaseConfig } from "@/lib/backend/env";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutDraftSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: "Supabase is not configured yet." }, { status: 503 });
  }

  const result = await createOrder(parsed.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 500 });
  }

  return NextResponse.json({ ok: true, orderId: result.orderId });
}
