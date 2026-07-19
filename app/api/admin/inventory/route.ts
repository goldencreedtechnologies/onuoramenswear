import { NextResponse } from "next/server";
import { getAdminInventory, requireAdminSession } from "@/lib/backend/admin";

export async function GET() {
  const session = await requireAdminSession();

  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: session.status });
  }

  const inventory = await getAdminInventory();

  if (!inventory.ok) {
    return NextResponse.json({ error: inventory.reason }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inventory: inventory.inventory });
}
