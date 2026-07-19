import { NextResponse } from "next/server";
import { getAdminOrders, requireAdminSession } from "@/lib/backend/admin";

export async function GET() {
  const session = await requireAdminSession();

  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: session.status });
  }

  const orders = await getAdminOrders();

  if (!orders.ok) {
    return NextResponse.json({ error: orders.reason }, { status: 500 });
  }

  return NextResponse.json({ ok: true, orders: orders.orders });
}
