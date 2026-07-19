import { NextResponse } from "next/server";
import { getProductInventory } from "@/lib/backend/inventory";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const inventory = await getProductInventory(slug);

  return NextResponse.json({ ok: true, inventory });
}
