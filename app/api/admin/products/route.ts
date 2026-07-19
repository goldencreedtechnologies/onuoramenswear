import { NextResponse } from "next/server";
import { getAdminProducts, productAdminSchema, requireAdminSession, upsertAdminProduct } from "@/lib/backend/admin";

export async function GET() {
  const session = await requireAdminSession();

  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: session.status });
  }

  const products = await getAdminProducts();

  if (!products.ok) {
    return NextResponse.json({ error: products.reason }, { status: 500 });
  }

  return NextResponse.json({ ok: true, products: products.products });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: session.status });
  }

  const body = await request.json().catch(() => null);
  const parsed = productAdminSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const saved = await upsertAdminProduct(session.admin, parsed.data);

  if (!saved.ok) {
    return NextResponse.json({ error: saved.reason }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
